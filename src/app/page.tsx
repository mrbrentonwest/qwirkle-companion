'use client';

import { useState, useCallback, useEffect } from 'react';
import type { GameState, TurnScore, StoredGameState } from '@/lib/types';
import { GameSetup } from '@/components/game/game-setup';
import { GameView } from '@/components/game/game-view';
import { AppLogo } from '@/components/icons';
import { CelebrationOverlay } from '@/components/game/celebration-overlay';

import { QwirkleShape } from '@/components/icons';
import { ScoreHistoryDialog } from '@/components/game/score-history-dialog';

import { useIdentity } from '@/contexts/identity-context';
import { PassphraseDialog } from '@/components/identity/passphrase-dialog';
import { SettingsSheet } from '@/components/identity/settings-sheet';
import { UserAvatar } from '@/components/identity/user-avatar';
import { useGamePersistence } from '@/hooks/use-game-persistence';
import { HomeScreen } from '@/components/home/home-screen';
import { GameDetailDialog } from '@/components/home/game-detail-dialog';
import { useGameHistory } from '@/hooks/use-game-history';
import { archiveGame } from '@/lib/firestore-game';

export default function Home() {
  const { isLoading, isIdentified, userId, isFirebaseReady } = useIdentity();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Game persistence hook - handles Firestore sync
  const { initialGame, isLoading: isPersistenceLoading, saveGame, clearGame } = useGamePersistence({
    userId,
    isFirebaseReady,
  });

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameHistory, setGameHistory] = useState<GameState[]>([]); // Past states for undo
  const [futureHistory, setFutureHistory] = useState<GameState[]>([]); // Future states for redo
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationScore, setCelebrationScore] = useState(0);
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [view, setView] = useState<'home' | 'game'>('home');
  const [selectedGame, setSelectedGame] = useState<StoredGameState | null>(null);

  // Game history hook - fetches past games from Firestore
  const { games: historyGames, isLoading: isHistoryLoading, error: historyError, refetch: refetchHistory } = useGameHistory(userId, isFirebaseReady);

  // Initialize gameState from Firestore when loaded
  // Don't auto-switch to game view - user decides from home
  useEffect(() => {
    if (initialGame && !gameState) {
      setGameState(initialGame);
    }
  }, [initialGame, gameState]);

  // Auto-save gameState to Firestore when it changes
  useEffect(() => {
    if (gameState && isFirebaseReady) {
      saveGame(gameState);
    }
  }, [gameState, isFirebaseReady, saveGame]);

  const triggerCelebration = useCallback((score: number) => {
    setCelebrationScore(score);
    setShowCelebration(true);
  }, []);

  const dismissCelebration = useCallback(() => {
    setShowCelebration(false);
  }, []);

  // Home screen navigation handlers
  const handleGoToHome = useCallback(() => {
    setView('home');
    refetchHistory();
  }, [refetchHistory]);

  const handleContinueGame = useCallback(() => {
    setView('game');
  }, []);

  const handleNewGame = useCallback(() => {
    setGameState(null);
    setGameHistory([]);
    setFutureHistory([]);
    setView('game'); // Go to game setup
  }, []);

  const handleSelectHistoryGame = useCallback((game: StoredGameState) => {
    setSelectedGame(game);
  }, []);

  const handleStartGame = (playerNames: string[]) => {
    setGameState({
      players: playerNames.map((name, index) => ({
        id: `${name}-${index}`,
        name,
        scores: [],
        totalScore: 0,
      })),
      currentPlayerIndex: 0,
      round: 1,
      isGameActive: true,
      isGameOver: false,
    });
  };

  const handleAddScore = (score: number, type: TurnScore['type']) => {
    // Trigger celebration for Qwirkle (12+ points)
    if (score >= 12) {
      triggerCelebration(score);
    }

    // Save current state to history before making changes
    if (gameState) {
      setGameHistory((prev) => [...prev, gameState]);
      setFutureHistory([]); // Clear redo stack on new action
    }

    setGameState((prev) => {
      if (!prev) return null;

      const newPlayers = prev.players.map((player, index) => {
        if (index === prev.currentPlayerIndex) {
          const newScore: TurnScore = {
            turnNumber: prev.round,
            score,
            isQwirkle: score >= 12,
            type,
          };
          const updatedScores = [...player.scores, newScore];
          const newTotalScore = updatedScores.reduce((sum, s) => sum + s.score, 0);
          return {
            ...player,
            scores: updatedScores,
            totalScore: newTotalScore,
          };
        }
        return player;
      });

      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % newPlayers.length;
      const nextRound = nextPlayerIndex === 0 ? prev.round + 1 : prev.round;

      return {
        ...prev,
        players: newPlayers,
        currentPlayerIndex: nextPlayerIndex,
        round: nextRound,
      };
    });
  };

  const handleEndGame = async (bonusPlayerId: string | null) => {
    if (!gameState || !userId) return;

    // Build final state
    let finalPlayers = [...gameState.players];
    if (bonusPlayerId) {
      finalPlayers = finalPlayers.map(p => {
        if (p.id === bonusPlayerId) {
          const bonusScore: TurnScore = { turnNumber: gameState.round, score: 6, isQwirkle: false, type: 'bonus' };
          return {
            ...p,
            scores: [...p.scores, bonusScore],
            totalScore: p.totalScore + 6,
          };
        }
        return p;
      });
    }

    const finalState: GameState = {
      ...gameState,
      players: finalPlayers,
      isGameActive: false,
      isGameOver: true,
    };

    // Archive to history first
    try {
      await archiveGame(userId, finalState);
    } catch (err) {
      console.error('Failed to archive game:', err);
    }

    // Clear active game
    await clearGame();

    // Update local state
    setGameState(null);
    setGameHistory([]);
    setFutureHistory([]);

    // Return to home
    handleGoToHome();
  };
  
  const handleResetGame = async () => {
    setGameState(null);
    setGameHistory([]);
    setFutureHistory([]);
    await clearGame();
  };

  const handleUndo = useCallback(() => {
    if (gameHistory.length === 0 || !gameState) return;

    // Move current state to future
    setFutureHistory((prev) => [gameState, ...prev]);

    // Pop the last state from history
    const previousState = gameHistory[gameHistory.length - 1];
    setGameHistory((prev) => prev.slice(0, -1));
    setGameState(previousState);
  }, [gameState, gameHistory]);

  const handleRedo = useCallback(() => {
    if (futureHistory.length === 0) return;

    // Move current state to history
    if (gameState) {
      setGameHistory((prev) => [...prev, gameState]);
    }

    // Pop the first state from future
    const nextState = futureHistory[0];
    setFutureHistory((prev) => prev.slice(1));
    setGameState(nextState);
  }, [gameState, futureHistory]);

  return (
    <div className="min-h-svh w-full bg-background relative overflow-x-hidden">
      {/* Playful Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none overflow-hidden" 
           style={{ 
               backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, 
               backgroundSize: '24px 24px' 
           }} 
      >
        <QwirkleShape shape="star" className="absolute top-20 left-10 w-24 h-24 text-orange-500 animate-bounce delay-700" />
        <QwirkleShape shape="clover" className="absolute bottom-40 right-10 w-32 h-32 text-green-600 animate-pulse delay-150" />
        <QwirkleShape shape="circle" className="absolute top-1/3 right-1/4 w-16 h-16 text-blue-500 opacity-60 animate-bounce" />
        <QwirkleShape shape="square" className="absolute bottom-20 left-1/4 w-20 h-20 text-purple-500 opacity-60" />
      </div>

      <div className="relative z-10 mx-auto max-w-md flex flex-col min-h-svh">
        <header className="sticky top-0 z-50 p-4 mb-2">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,1.0),0_4px_6px_-1px_rgba(0,0,0,0.1)] border border-gray-200">
                <div className="flex items-center gap-2">
                    {view === 'game' && (
                        <button
                            onClick={handleGoToHome}
                            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </button>
                    )}
                    <QwirkleShape shape="starburst" className="h-8 w-8 text-orange-500 drop-shadow-sm" />
                    <h1 className="font-headline text-xl font-black text-gray-900 tracking-tight">
                        <span className="text-orange-600">Qwirkle</span> Companion
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {gameState && (
                        <button
                            onClick={() => setHistoryOpen(true)}
                            className="bg-orange-100 hover:bg-orange-200 active:scale-95 transition-all px-3 py-1 rounded-full border border-orange-200 shadow-sm group"
                        >
                            <span className="text-[10px] font-black text-orange-700 uppercase tracking-widest leading-none group-hover:text-orange-800">Round {gameState.round}</span>
                        </button>
                    )}
                    {!isLoading && isIdentified && (
                        <UserAvatar onClick={() => setSettingsOpen(true)} />
                    )}
                </div>
            </div>
        </header>

        <main className="flex-1 flex flex-col">
            {/* Show loading state while persistence is loading */}
            {isPersistenceLoading && isFirebaseReady ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <QwirkleShape shape="starburst" className="h-12 w-12 text-orange-500 mx-auto animate-spin" />
                        <p className="mt-4 text-gray-500 text-sm">Loading your game...</p>
                    </div>
                </div>
            ) : view === 'home' ? (
                <HomeScreen
                    hasActiveGame={!!gameState}
                    onNewGame={handleNewGame}
                    onContinueGame={handleContinueGame}
                    games={historyGames}
                    isLoadingHistory={isHistoryLoading}
                    historyError={historyError}
                    onSelectGame={handleSelectHistoryGame}
                />
            ) : !gameState ? (
                <GameSetup onStartGame={handleStartGame} />
            ) : (
                <GameView
                    gameState={gameState}
                    onAddScore={handleAddScore}
                    onEndGame={handleEndGame}
                    onResetGame={handleResetGame}
                    isHistoryOpen={isHistoryOpen}
                    onHistoryOpenChange={setHistoryOpen}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={gameHistory.length > 0}
                    canRedo={futureHistory.length > 0}
                />
            )}
        </main>

        {/* Qwirkle Celebration Overlay */}
        <CelebrationOverlay
          isVisible={showCelebration}
          score={celebrationScore}
          onComplete={dismissCelebration}
        />

        {gameState && (
            <ScoreHistoryDialog
                isOpen={isHistoryOpen}
                onOpenChange={setHistoryOpen}
                players={gameState.players}
                rounds={gameState.round}
            />
        )}

        {/* Game Detail Dialog for viewing completed games */}
        <GameDetailDialog
            game={selectedGame}
            isOpen={!!selectedGame}
            onOpenChange={(open) => !open && setSelectedGame(null)}
        />

        {/* Identity UI */}
        <PassphraseDialog open={!isIdentified && !isLoading} />
        <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
    </div>
  );
}
