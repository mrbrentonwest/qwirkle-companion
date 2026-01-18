'use client';

import type { StoredGameState } from '@/lib/types';
import { GameHistoryItem } from './game-history-item';
import { EmptyHistory } from './empty-history';
import { Loader2 } from 'lucide-react';

interface GameHistoryListProps {
  games: StoredGameState[];
  isLoading: boolean;
  error: Error | null;
  onSelectGame: (game: StoredGameState) => void;
  onNewGame: () => void;
}

export function GameHistoryList({
  games,
  isLoading,
  error,
  onSelectGame,
  onNewGame,
}: GameHistoryListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p className="font-medium">Failed to load history</p>
        <p className="text-sm text-gray-500">{error.message}</p>
      </div>
    );
  }

  if (games.length === 0) {
    return <EmptyHistory onNewGame={onNewGame} />;
  }

  return (
    <div className="space-y-3">
      {games.map(game => (
        <GameHistoryItem
          key={game.id}
          game={game}
          onSelect={onSelectGame}
        />
      ))}
    </div>
  );
}
