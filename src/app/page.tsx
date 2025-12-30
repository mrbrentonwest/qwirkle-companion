'use client';

import { useState, useCallback } from 'react';
import type { GameState, TurnScore } from '@/lib/types';
import { GameSetup } from '@/components/game/game-setup';
import { GameView } from '@/components/game/game-view';
import { AppLogo } from '@/components/icons';
import { CelebrationOverlay } from '@/components/game/celebration-overlay';

import { QwirkleShape } from '@/components/icons';
import { ScoreHistoryDialog } from '@/components/game/score-history-dialog';

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameHistory, setGameHistory] = useState<GameState[]>([]); // Past states for undo
  const [futureHistory, setFutureHistory] = useState<GameState[]>([]); // Future states for redo
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationScore, setCelebrationScore] = useState(0);
  const [isHistoryOpen, setHistoryOpen] = useState(false);

  const triggerCelebration = useCallback((score: number) => {
    setCelebrationScore(score);
    setShowCelebration(true);
  }, []);

  const dismissCelebration = useCallback(() => {
    setShowCelebration(false);
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

  const handleEndGame = (bonusPlayerId: string | null) => {
    if (!gameState) return;

    setGameState((prev) => {
      if (!prev) return null;

      let newPlayers = [...prev.players];

      if (bonusPlayerId) {
        newPlayers = newPlayers.map(p => {
          if (p.id === bonusPlayerId) {
            const bonusScore: TurnScore = { turnNumber: prev.round, score: 6, isQwirkle: false, type: 'bonus' };
            return {
              ...p,
              scores: [...p.scores, bonusScore],
              totalScore: p.totalScore + 6,
            };
          }
          return p;
        });
      }

      return {
        ...prev,
        players: newPlayers,
        isGameActive: false,
        isGameOver: true,
      };
    });
  };
  
  const handleResetGame = () => {
    setGameState(null);
    setGameHistory([]);
    setFutureHistory([]);
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
                    <QwirkleShape shape="starburst" className="h-8 w-8 text-orange-500 drop-shadow-sm" />
                    <h1 className="font-headline text-xl font-black text-gray-900 tracking-tight">
                        <span className="text-orange-600">Qwirkle</span> Companion
                    </h1>
                </div>
                {gameState && (
                    <button 
                        onClick={() => setHistoryOpen(true)}
                        className="bg-orange-100 hover:bg-orange-200 active:scale-95 transition-all px-3 py-1 rounded-full border border-orange-200 shadow-sm group"
                    >
                        <span className="text-[10px] font-black text-orange-700 uppercase tracking-widest leading-none group-hover:text-orange-800">Round {gameState.round}</span>
                    </button>
                )}
            </div>
        </header>

        <main className="flex-1 flex flex-col">
            {!gameState ? (
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
      </div>
    </div>
  );
}
