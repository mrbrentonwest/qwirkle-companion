import type { Player } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

interface PlayerScoresProps {
  players: Player[];
  currentPlayerId: string;
}

const PLAYER_COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#EAB308', '#A855F7', '#EC4899'];

export function PlayerScores({ players, currentPlayerId }: PlayerScoresProps) {
    const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
    const topScore = sortedPlayers.length > 0 ? sortedPlayers[0].totalScore : 0;

  return (
    <div className="grid grid-cols-2 gap-3 p-4 bg-background border-b border-orange-100">
      {players.map((player, idx) => {
        const playerColor = PLAYER_COLORS[idx % PLAYER_COLORS.length];
        const isCurrent = player.id === currentPlayerId;
        
        return (
            <div
                key={player.id}
                className={cn(
                    'p-3 rounded-2xl border-b-4 transition-all duration-300 flex flex-col justify-between h-28 overflow-hidden shadow-sm relative',
                    isCurrent 
                        ? 'bg-white border-primary scale-[1.02] shadow-md z-10' 
                        : 'bg-gray-50 border-gray-200 opacity-90'
                )}
            >
                <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-2">
                        <div 
                            className="w-3 h-3 rounded-full shadow-sm" 
                            style={{ backgroundColor: playerColor }} 
                        />
                        <p className={cn(
                            'font-headline text-sm font-bold truncate max-w-[80px]',
                            isCurrent ? 'text-primary' : 'text-gray-500'
                        )}>
                            {player.name}
                        </p>
                    </div>
                    {player.totalScore === topScore && topScore > 0 && (
                        <Crown className="h-5 w-5 text-yellow-500 fill-yellow-200" />
                    )}
                </div>
                <div className="relative z-10 text-right mt-1">
                    <p className="text-4xl font-black font-headline tracking-tight" style={{ color: isCurrent ? 'inherit' : playerColor }}>
                        {player.totalScore}
                    </p>
                </div>
            </div>
        );
      })}
    </div>
  );
}
