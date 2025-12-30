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
    <div className="flex-1 flex flex-col justify-center space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-block bg-white px-4 py-1.5 rounded-full shadow-sm border border-orange-100">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">Round {round}</span>
        </div>
        <h2 className="text-3xl font-headline font-black text-gray-800">
          It's <span className="text-primary underline decoration-4 decoration-wavy underline-offset-4">{player.name}'s</span> Turn!
        </h2>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-orange-50 space-y-5">
        <div className="flex gap-3">
          <Input
            type="number"
            placeholder="0"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-4 h-20 text-center text-5xl font-black text-gray-800 focus-visible:ring-primary focus-visible:bg-white transition-all placeholder:text-gray-200"
            inputMode="numeric"
          />
          <Button 
            className="h-20 w-24 rounded-2xl bg-primary hover:bg-orange-600 text-white border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 shadow-md transition-all" 
            onClick={handleAddScore} 
            disabled={!score}
          >
            <CheckCircle className="h-10 w-10 drop-shadow-sm" />
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full h-14 rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 font-bold hover:bg-gray-50 hover:text-gray-600 transition-all flex items-center justify-center gap-2" 
          onClick={handleSwapTiles}
        >
          <Replace className="h-5 w-5" />
          SWAP TILES (0 PTS)
        </Button>
      </div>
    </div>
  );
}
