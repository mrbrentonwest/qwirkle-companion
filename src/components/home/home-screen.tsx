'use client';

import { Button } from '@/components/ui/button';
import { QwirkleShape } from '@/components/icons';
import { GameHistoryList } from './game-history-list';
import type { StoredGameState } from '@/lib/types';
import { Play, History } from 'lucide-react';

interface HomeScreenProps {
  hasActiveGame: boolean;
  onNewGame: () => void;
  onContinueGame: () => void;
  games: StoredGameState[];
  isLoadingHistory: boolean;
  historyError: Error | null;
  onSelectGame: (game: StoredGameState) => void;
}

export function HomeScreen({
  hasActiveGame,
  onNewGame,
  onContinueGame,
  games,
  isLoadingHistory,
  historyError,
  onSelectGame,
}: HomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Action Buttons */}
      <div className="space-y-3">
        {hasActiveGame && (
          <Button
            onClick={onContinueGame}
            className="w-full h-16 rounded-2xl bg-primary hover:bg-orange-600 text-white border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 font-black text-xl shadow-lg transition-all flex items-center justify-center gap-3"
          >
            <Play className="h-6 w-6" />
            CONTINUE GAME
          </Button>
        )}

        <Button
          onClick={onNewGame}
          variant={hasActiveGame ? 'outline' : 'default'}
          className={
            hasActiveGame
              ? 'w-full h-14 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2'
              : 'w-full h-16 rounded-2xl bg-primary hover:bg-orange-600 text-white border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 font-black text-xl shadow-lg transition-all flex items-center justify-center gap-3'
          }
        >
          <QwirkleShape shape="starburst" className="h-5 w-5" />
          {hasActiveGame ? 'Start New Game' : 'START NEW GAME'}
        </Button>
      </div>

      {/* Game History Section */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-gray-400" />
          <h2 className="font-headline font-bold text-gray-600 text-sm uppercase tracking-wider">
            Recent Games
          </h2>
        </div>

        <GameHistoryList
          games={games}
          isLoading={isLoadingHistory}
          error={historyError}
          onSelectGame={onSelectGame}
          onNewGame={onNewGame}
        />
      </div>
    </div>
  );
}
