'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PlusCircle, Trash2, Users } from 'lucide-react';

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
    <div className="flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Users className="h-6 w-6" />
            New Game Setup
          </CardTitle>
          <CardDescription>Enter player names to begin.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {playerNames.map((name, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder={`Player ${index + 1}`}
                  value={name}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  className="text-lg"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePlayer(index)}
                  disabled={playerNames.length <= 2}
                  aria-label={`Remove Player ${index + 1}`}
                >
                  <Trash2 className="h-5 w-5 text-destructive/80" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={addPlayer}
              disabled={playerNames.length >= 4}
              className="w-full"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Player
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStart} disabled={!canStartGame} className="w-full font-headline text-lg">
            Start Game
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
