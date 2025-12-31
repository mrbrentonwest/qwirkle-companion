'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameSetupProps {
  onStartGame: (playerNames: string[]) => void;
}

export function GameSetup({ onStartGame }: GameSetupProps) {
  const [playerNames, setPlayerNames] = useState(['', '']);

  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayerNames = [...playerNames];
    newPlayerNames[index] = name;
    setPlayerNames(newPlayerNames);
  };

  const addPlayer = () => {
    if (playerNames.length < 4) {
      setPlayerNames([...playerNames, '']);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 2) {
      const newPlayerNames = [...playerNames];
      newPlayerNames.splice(index, 1);
      setPlayerNames(newPlayerNames);
    }
  };

  const canStartGame = playerNames.every(name => name.trim() !== '');

  const handleStart = () => {
    if (canStartGame) {
      onStartGame(playerNames.map(name => name.trim()));
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-headline font-black text-gray-900 tracking-tight">
          New Game
        </h2>
        <p className="text-gray-500 font-medium italic">Ready for some family fun?</p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-[inset_0_1px_0_0_rgba(255,255,255,1.0),0_10px_15px_-3px_rgba(0,0,0,0.1)] border border-gray-100 space-y-6">
        <div className="space-y-4">
          {playerNames.map((name, index) => (
            <div key={index} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${index * 100}ms` }}>
              <div className={cn("flex-1 rounded-2xl transition-all duration-200", name ? "ring-2 ring-orange-100" : "")}>
                <Input
                  type="text"
                  placeholder={`Player ${index + 1}`}
                  value={name}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  className="h-14 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-lg font-bold text-gray-800 focus-visible:ring-primary focus-visible:bg-white transition-all placeholder:text-gray-300 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)]"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removePlayer(index)}
                disabled={playerNames.length <= 2}
                className="h-14 w-14 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                aria-label={`Remove Player ${index + 1}`}
              >
                <Trash2 className="h-6 w-6" />
              </Button>
            </div>
          ))}
          
          {playerNames.length < 4 && (
            <Button
              variant="outline"
              onClick={addPlayer}
              className="w-full h-14 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 font-bold hover:bg-gray-50 hover:text-gray-600 transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="h-5 w-5" />
              ADD ANOTHER PLAYER
            </Button>
          )}
        </div>

        <Button 
          onClick={handleStart} 
          disabled={!canStartGame} 
          className="w-full h-16 rounded-2xl bg-primary hover:bg-orange-600 text-white border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 font-black text-xl shadow-lg transition-all disabled:opacity-50 disabled:border-b-0 disabled:translate-y-0"
        >
          START THE GAME!
        </Button>
      </div>
    </div>
  );
}
