import type { Player } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';
import { QwirkleShape } from '@/components/icons';

interface PlayerScoresProps {
  players: Player[];
  currentPlayerId: string;
}

const PLAYER_COLORS = ['#DC2626', '#2563EB', '#16A34A', '#CA8A04', '#9333EA', '#EA580C'];
const PLAYER_SHAPES = ['star', 'circle', 'square', 'clover', 'diamond', 'starburst'];

export function PlayerScores({ players, currentPlayerId }: PlayerScoresProps) {
    const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
    const topScore = sortedPlayers.length > 0 ? sortedPlayers[0].totalScore : 0;

  return (
    <div className="grid grid-cols-2 gap-3 p-4 bg-[#F3F4F6]">
      {players.map((player, idx) => {
        const playerColor = PLAYER_COLORS[idx % PLAYER_COLORS.length];
        const playerShape = PLAYER_SHAPES[idx % PLAYER_SHAPES.length];
        const isCurrent = player.id === currentPlayerId;
        
        return (
            <div
                key={player.id}
                className={cn(
                    'relative p-4 rounded-[2rem] flex flex-col justify-between h-32 overflow-hidden transition-all duration-300',
                    isCurrent 
                        ? 'bg-white ring-2 ring-orange-500 ring-offset-2 z-10 shadow-md' 
                        : 'bg-white border border-gray-100 shadow-sm'
                )}
            >
                {/* Giant Watermark - Bottom Right */}
                <QwirkleShape 
                    shape={playerShape} 
                    className="absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.10]" 
                    style={{ color: playerColor }} 
                />

                <div className="flex justify-between items-start relative z-10">
                    {/* Icon Circle */}
                    <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" 
                        style={{ backgroundColor: playerColor }}
                    >
                        <QwirkleShape shape={playerShape} className="w-6 h-6 text-white" />
                    </div>

                    {/* Crown */}
                    {player.totalScore === topScore && topScore > 0 && (
                        <Crown className="h-6 w-6 text-yellow-500 fill-yellow-100" />
                    )}
                </div>
                
                <div className="relative z-10 mt-2">
                    <p className="font-headline font-bold text-base text-gray-800 truncate mb-0.5">
                        {player.name}
                    </p>
                    <p 
                        className="text-5xl font-black font-headline tracking-tighter leading-none" 
                        style={{ color: playerColor }}
                    >
                        {player.totalScore}
                    </p>
                </div>
            </div>
        );
      })}
    </div>
  );
}
