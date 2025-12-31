'use client';

import type { Player } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { X, History as HistoryIcon, Hash, Trophy } from 'lucide-react';
import { QwirkleShape } from '@/components/icons';

interface ScoreHistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  players: Player[];
  rounds: number;
}

const PLAYER_COLORS = ['#DC2626', '#2563EB', '#16A34A', '#CA8A04', '#9333EA', '#EA580C'];
const PLAYER_SHAPES = ['star', 'circle', 'square', 'clover', 'diamond', 'starburst'];

// --- DEPTH UTILITIES ---
const depthStyles = {
    raised: "bg-white shadow-[inset_0_1px_0_0_rgba(255,255,255,1.0),0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] border border-gray-200",
    recessed: "bg-gray-100 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05)] border-b border-white",
};

export function ScoreHistoryDialog({ isOpen, onOpenChange, players, rounds }: ScoreHistoryDialogProps) {
  const roundNumbers = Array.from({ length: rounds }, (_, i) => i + 1); // Round 1 at top
  const maxScore = Math.max(...players.map(p => p.totalScore));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-none shadow-2xl p-0 bg-[#F3F4F6] [&>button]:hidden">
        <div className="p-6 space-y-6">
            <DialogHeader className="relative">
                <button 
                    onClick={() => onOpenChange(false)}
                    className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-400 hover:text-gray-900 border border-gray-100 z-10"
                >
                    <X className="h-5 w-5" />
                </button>
                <DialogTitle className="font-headline font-black text-3xl flex items-center gap-3 text-orange-600 drop-shadow-sm">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-orange-100">
                        <HistoryIcon className="text-orange-500 h-7 w-7" /> 
                    </div>
                    Turn History
                </DialogTitle>
                <DialogDescription className="font-black text-[10px] tracking-[0.2em] text-gray-400 uppercase mt-2">
                    TRACK THE GAME • ROUND BY ROUND
                </DialogDescription>
            </DialogHeader>

            {/* Players Header with Full Cards */}
            <div className="grid grid-cols-[40px_1fr] gap-3 px-1">
                <div /> {/* Spacer for Round Column */}
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${players.length}, 1fr)` }}>
                    {players.map((player, idx) => {
                        const playerColor = PLAYER_COLORS[idx % PLAYER_COLORS.length];
                        const playerShape = PLAYER_SHAPES[idx % PLAYER_SHAPES.length];
                        const maxScore = Math.max(...players.map(p => p.totalScore));
                        const isLeader = player.totalScore === maxScore && maxScore > 0;

                        return (
                            <div
                                key={player.id}
                                className={cn(
                                    'relative p-2 rounded-[1.5rem] flex flex-col justify-between h-28 overflow-hidden border transition-all',
                                    'bg-white border-gray-100 shadow-sm'
                                )}
                            >
                                {/* Watermark */}
                                <QwirkleShape 
                                    shape={playerShape} 
                                    className="absolute -right-2 -bottom-2 w-16 h-16 opacity-[0.10]" 
                                    style={{ color: playerColor }} 
                                />

                                <div className="flex justify-between items-start relative z-10">
                                    <div 
                                        className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm" 
                                        style={{ backgroundColor: playerColor }}
                                    >
                                        <QwirkleShape shape={playerShape} className="w-4 h-4 text-white" />
                                    </div>
                                    {isLeader && (
                                        <div className="bg-yellow-100 p-1 rounded-full">
                                            <Trophy className="h-3 w-3 text-yellow-600" />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="relative z-10 mt-1">
                                    <p className="font-headline font-bold text-xs text-gray-700 truncate mb-0.5">
                                        {player.name}
                                    </p>
                                    <p 
                                        className="text-3xl font-black font-headline tracking-tighter leading-none" 
                                        style={{ color: playerColor }}
                                    >
                                        {player.totalScore}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <ScrollArea className="h-[50vh] px-1">
                <div className="space-y-3 pb-4">
                    {roundNumbers.map((round) => (
                        <div key={round} className="grid grid-cols-[40px_1fr] gap-3 items-center">
                            <div className="text-center font-black text-gray-400 text-xs tracking-tighter">
                                R{round}
                            </div>
                            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${players.length}, 1fr)` }}>
                                {players.map((player) => {
                                    const turn = player.scores.find(s => s.turnNumber === round);
                                    const score = turn?.score;
                                    const isQwirkle = turn?.isQwirkle ?? false;
                                    const isBonus = turn?.type === 'bonus';
                                    
                                    return (
                                        <div 
                                            key={`${player.id}-${round}`} 
                                            className={cn(
                                                "h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all",
                                                score !== undefined ? depthStyles.raised : "bg-gray-100/50 border border-dashed border-gray-200 opacity-40",
                                                isQwirkle && "ring-2 ring-orange-400 ring-offset-1 bg-orange-50",
                                                isBonus && "ring-2 ring-yellow-400 bg-yellow-50"
                                            )}
                                            style={{ color: score !== undefined ? PLAYER_COLORS[players.indexOf(player) % PLAYER_COLORS.length] : 'transparent' }}
                                        >
                                            {score !== undefined ? score : ''}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
