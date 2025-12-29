'use client';

import type { Player } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

interface ScoreHistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  players: Player[];
  rounds: number;
}

export function ScoreHistoryDialog({ isOpen, onOpenChange, players, rounds }: ScoreHistoryDialogProps) {
  const roundNumbers = Array.from({ length: rounds }, (_, i) => i + 1);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Score History</DialogTitle>
          <DialogDescription>
            A turn-by-turn breakdown of the scores.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-[50px]">Rnd</TableHead>
                {players.map((player) => (
                  <TableHead key={player.id} className="text-center font-headline">{player.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {roundNumbers.map((round) => (
                <TableRow key={round}>
                  <TableCell className="font-medium">{round}</TableCell>
                  {players.map((player) => {
                    const turn = player.scores.find(s => s.turnNumber === round);
                    const score = turn?.score;
                    const isQwirkle = turn?.isQwirkle ?? false;
                    return (
                      <TableCell key={`${player.id}-${round}`} className={cn("text-center font-semibold text-lg", isQwirkle && "text-primary")}>
                        {score !== undefined ? (
                           <Badge variant={isQwirkle ? 'default' : 'secondary'} className={cn('text-base', isQwirkle && 'bg-primary/90')}>
                             {score}
                           </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
                <TableRow className="bg-muted/50 font-bold">
                    <TableCell>Total</TableCell>
                    {players.map(player => (
                        <TableCell key={player.id} className="text-center text-xl text-primary">
                            {player.totalScore}
                        </TableCell>
                    ))}
                </TableRow>
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
