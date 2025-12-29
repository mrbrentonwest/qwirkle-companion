'use client';

import { useState } from 'react';
import type { Player, TurnScore } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Replace } from 'lucide-react';

interface CurrentTurnProps {
  player: Player;
  round: number;
  onAddScore: (score: number, type: TurnScore['type']) => void;
}

export function CurrentTurn({ player, round, onAddScore }: CurrentTurnProps) {
  const [score, setScore] = useState('');

  const handleAddScore = () => {
    const scoreValue = parseInt(score, 10);
    if (!isNaN(scoreValue) && scoreValue >= 0) {
      onAddScore(scoreValue, 'manual');
      setScore('');
    }
  };

  const handleSwapTiles = () => {
    onAddScore(0, 'swap');
    setScore('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddScore();
    }
  };

  return (
    <Card className="flex-1 flex flex-col justify-center">
      <CardHeader className="text-center">
        <CardDescription>Round {round}</CardDescription>
        <CardTitle className="font-headline text-2xl">
            It's <span className="text-primary font-bold">{player.name}'s</span> turn!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
            <Input
                type="number"
                placeholder="Enter score"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-center text-2xl h-16"
                inputMode="numeric"
            />
            <Button size="icon" className="h-16 w-16" onClick={handleAddScore} disabled={!score}>
                <CheckCircle className="h-8 w-8" />
            </Button>
        </div>
        
        <Button variant="secondary" className="w-full" onClick={handleSwapTiles}>
          <Replace className="mr-2 h-4 w-4" />
          Swap Tiles (0 points)
        </Button>
      </CardContent>
    </Card>
  );
}
