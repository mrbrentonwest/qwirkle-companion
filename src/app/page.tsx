'use client';

import { useState, useCallback } from 'react';
import type { GameState, TurnScore } from '@/lib/types';
import { GameSetup } from '@/components/game/game-setup';
import { GameView } from '@/components/game/game-view';
import { AppLogo } from '@/components/icons';
import { CelebrationOverlay } from '@/components/game/celebration-overlay';

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationScore, setCelebrationScore] = useState(0);

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
  };

  return (
    <div className="flex h-svh w-full flex-col items-center justify-center bg-muted p-4 sm:p-8">
       <div className="relative mx-auto flex h-full w-full max-w-sm flex-col overflow-hidden rounded-2xl border-4 border-card bg-background shadow-2xl">
        <header className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
                <AppLogo className="h-8 w-8 text-primary" />
                <h1 className="font-headline text-xl font-bold text-foreground">
                Qwirkle Companion
                </h1>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto">
            {!gameState ? (
                <GameSetup onStartGame={handleStartGame} />
            ) : (
                <GameView
                    gameState={gameState}
                    onAddScore={handleAddScore}
                    onEndGame={handleEndGame}
                    onResetGame={handleResetGame}
                />
            )}
        </main>

        {/* Qwirkle Celebration Overlay */}
        <CelebrationOverlay
          isVisible={showCelebration}
          score={celebrationScore}
          onComplete={dismissCelebration}
        />
      </div>
    </div>
  );
}
