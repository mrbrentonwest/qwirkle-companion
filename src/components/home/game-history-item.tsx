'use client';

import { formatDistanceToNow } from 'date-fns';
import type { StoredGameState } from '@/lib/types';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLAYER_COLORS = ['#DC2626', '#2563EB', '#16A34A', '#CA8A04', '#9333EA', '#EA580C'];

interface GameHistoryItemProps {
  game: StoredGameState;
  onSelect: (game: StoredGameState) => void;
}

export function GameHistoryItem({ game, onSelect }: GameHistoryItemProps) {
  // Find winner(s) - handle ties
  const maxScore = Math.max(...game.players.map(p => p.totalScore));
  const winners = game.players.filter(p => p.totalScore === maxScore);
  const isTie = winners.length > 1;

  // Format relative time on client only to avoid hydration mismatch
  const relativeTime = game.completedAt
    ? formatDistanceToNow(new Date(game.completedAt), { addSuffix: true })
    : 'Unknown';

  return (
    <button
      onClick={() => onSelect(game)}
      className="w-full text-left bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all active:scale-[0.98]"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-gray-400 font-medium">{relativeTime}</span>
        {isTie && (
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">
            TIE
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {game.players.map((player, idx) => {
          const isWinner = player.totalScore === maxScore && maxScore > 0;
          const color = PLAYER_COLORS[idx % PLAYER_COLORS.length];

          return (
            <div
              key={player.id}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold',
                isWinner ? 'bg-yellow-50 ring-2 ring-yellow-300' : 'bg-gray-50'
              )}
            >
              {isWinner && <Trophy className="h-3 w-3 text-yellow-600" />}
              <span className="text-gray-700">{player.name}</span>
              <span style={{ color }} className="font-black">{player.totalScore}</span>
            </div>
          );
        })}
      </div>
    </button>
  );
}
