'use client';

import type { GameState, TurnScore } from '@/lib/types';
import { PlayerScores } from './player-scores';
import { CurrentTurn } from './current-turn';
import { ScoreHistoryDialog } from './score-history-dialog';
import { AiHelperDialog } from './ai-helper-dialog';
import { EndGameDialog } from './end-game-dialog';
import { useState } from 'react';
import { Button } from '../ui/button';
import { History, WandSparkles } from 'lucide-react';

interface GameViewProps {
  gameState: GameState;
  onAddScore: (score: number, type: TurnScore['type']) => void;
  onEndGame: (bonusPlayerId: string | null) => void;
  onResetGame: () => void;
}

export function GameView({ gameState, onAddScore, onEndGame, onResetGame }: GameViewProps) {
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [isAiHelperOpen, setAiHelperOpen] = useState(false);
  const [isEndGameOpen, setEndGameOpen] = useState(false);

  const { players, currentPlayerIndex, isGameOver, round } = gameState;
  const currentPlayer = players[currentPlayerIndex];

  if (isGameOver) {
    return <EndGameDialog isOpen={isGameOver} onPlayAgain={onResetGame} players={players} />;
  }

  return (
    <div className="flex flex-col h-full">
      <PlayerScores players={players} currentPlayerId={currentPlayer.id} />

      <div className="flex-grow p-4 space-y-4 flex flex-col justify-between">
        <CurrentTurn 
          player={currentPlayer} 
          round={round}
          onAddScore={onAddScore} 
        />
        
        <div className="space-y-2 pt-4 border-t">
            <Button variant="secondary" className="w-full" onClick={() => setAiHelperOpen(true)}>
                <WandSparkles className="mr-2 h-4 w-4" />
                AI Helpers
            </Button>
             <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setHistoryOpen(true)}>
                    <History className="mr-2 h-4 w-4" />
                    Score History
                </Button>
                <Button variant="destructive" onClick={() => setEndGameOpen(true)}>
                    End Game
                </Button>
             </div>
        </div>
      </div>

      <ScoreHistoryDialog 
        isOpen={isHistoryOpen} 
        onOpenChange={setHistoryOpen} 
        players={players} 
        rounds={round -1}
      />
      <AiHelperDialog
        isOpen={isAiHelperOpen}
        onOpenChange={setAiHelperOpen}
        onAddScore={onAddScore}
      />
      <EndGameDialog
        isOpen={isEndGameOpen}
        onOpenChange={setEndGameOpen}
        onFinalize={onEndGame}
        players={players}
      />
    </div>
  );
}
