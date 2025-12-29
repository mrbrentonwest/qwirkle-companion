'use client';

import { useState } from 'react';
import type { Player } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Crown, Trophy } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';

interface EndGameDialogProps {
  isOpen: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  onFinalize?: (bonusPlayerId: string | null) => void;
  onPlayAgain?: () => void;
  players: Player[];
}

export function EndGameDialog({ isOpen, onOpenChange, onFinalize, onPlayAgain, players, isGameOver }: { players: Player[], isOpen: boolean, onOpenChange?: (open: boolean) => void, onFinalize?: (bonusPlayerId: string | null) => void, onPlayAgain?: () => void, isGameOver?: boolean }) {
  const [bonusPlayerId, setBonusPlayerId] = useState<string | null>(null);

  if (isGameOver || (onPlayAgain && players.length > 0)) {
    const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
    const winner = sortedPlayers[0];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl flex items-center gap-2">
                        <Trophy className="text-amber-500" />
                        Game Over!
                    </DialogTitle>
                    <DialogDescription>
                        Congratulations to <span className="font-bold text-primary">{winner.name}</span>!
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {sortedPlayers.map((player, index) => (
                        <Card key={player.id} className={index === 0 ? "border-amber-500 border-2" : ""}>
                            <CardContent className="p-4 flex justify-between items-center">
                                <div className='flex items-center gap-3'>
                                    {index === 0 ? <Crown className="text-amber-500" /> : <span className='w-6 text-center font-bold text-muted-foreground'>{index + 1}</span>}
                                    <p className="font-headline text-lg">{player.name}</p>
                                </div>
                                <p className="font-bold text-2xl">{player.totalScore}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <DialogFooter>
                    <Button className="w-full font-headline" onClick={onPlayAgain}>Play Again</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">End Game</DialogTitle>
          <DialogDescription>
            Award the 6 point bonus to the player who went out first.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup onValueChange={setBonusPlayerId}>
            <div className="space-y-2">
                {players.map(player => (
                    <div className="flex items-center space-x-2" key={player.id}>
                        <RadioGroupItem value={player.id} id={player.id} />
                        <Label htmlFor={player.id} className="text-lg font-headline">{player.name}</Label>
                    </div>
                ))}
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none" className="text-lg font-headline text-muted-foreground">No bonus</Label>
                </div>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button onClick={() => onFinalize?.(bonusPlayerId === 'none' ? null : bonusPlayerId)}>Finalize Scores</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
