import type { Player } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

interface PlayerScoresProps {
  players: Player[];
  currentPlayerId: string;
}

export function PlayerScores({ players, currentPlayerId }: PlayerScoresProps) {
    const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
    const topScore = sortedPlayers.length > 0 ? sortedPlayers[0].totalScore : 0;

  return (
    <div className="grid grid-cols-2 gap-2 p-2 bg-muted/50 border-b">
      {players.map((player) => (
        <div
          key={player.id}
          className={cn(
            'p-2 rounded-lg border-2 transition-all duration-300',
            player.id === currentPlayerId ? 'bg-primary/10 border-primary shadow-lg' : 'bg-card border-transparent'
          )}
        >
          <div className="flex justify-between items-center">
            <p
              className={cn(
                'font-headline text-lg truncate',
                player.id === currentPlayerId ? 'text-primary font-bold' : 'text-foreground'
              )}
            >
              {player.name}
            </p>
            {player.totalScore === topScore && topScore > 0 && (
                <Crown className="h-5 w-5 text-amber-500" />
            )}
          </div>
          <p className="text-3xl font-bold text-right text-foreground/80">{player.totalScore}</p>
        </div>
      ))}
    </div>
  );
}
