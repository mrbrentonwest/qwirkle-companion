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
  isHistoryOpen: boolean;
  onHistoryOpenChange: (open: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function GameView({ gameState, onAddScore, onEndGame, onResetGame, isHistoryOpen, onHistoryOpenChange, onUndo, onRedo, canUndo, canRedo }: GameViewProps) {
  const [isAiHelperOpen, setAiHelperOpen] = useState(false);
  const [isEndGameOpen, setEndGameOpen] = useState(false);

  const { players, currentPlayerIndex, isGameOver, round } = gameState;
  const currentPlayer = players[currentPlayerIndex];

  if (isGameOver) {
    return <EndGameDialog isOpen={isGameOver} onPlayAgain={onResetGame} players={players} />;
  }

    return (
      <div className="flex flex-col h-full relative overflow-hidden">
        {/* Playful Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
             style={{
                 backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
                 backgroundSize: '24px 24px'
             }}
        />
  
        <div className="relative z-10 flex flex-col h-full">
          <PlayerScores players={players} currentPlayerId={currentPlayer.id} />
  
          <div className="flex-grow p-4 space-y-4 flex flex-col justify-between">
              <CurrentTurn
              player={currentPlayer}
              round={round}
              onAddScore={onAddScore}
              onUndo={onUndo}
              onRedo={onRedo}
              canUndo={canUndo}
              canRedo={canRedo}
              />
              
              <div className="space-y-3 pt-6">
                  <Button 
                      variant="default" 
                      className="w-full h-14 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 shadow-md flex items-center justify-center gap-2 font-bold" 
                      onClick={() => setAiHelperOpen(true)}
                  >
                      <WandSparkles className="h-5 w-5 text-yellow-300" />
                      ASK AI HELPER
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                      <Button 
                          variant="secondary" 
                          className="h-12 rounded-xl bg-white text-gray-600 font-bold border-b-2 border-gray-300 active:border-b-0 active:translate-y-0.5 shadow-sm hover:bg-gray-50" 
                          onClick={() => onHistoryOpenChange(true)}
                      >
                          <History className="mr-2 h-4 w-4" />
                          History
                      </Button>
                      <Button 
                          variant="destructive" 
                          className="h-12 rounded-xl border-b-2 border-red-800 active:border-b-0 active:translate-y-0.5 font-bold shadow-sm" 
                          onClick={() => setEndGameOpen(true)}
                      >
                          End Game
                      </Button>
                  </div>
              </div>
          </div>
        </div>
  
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
