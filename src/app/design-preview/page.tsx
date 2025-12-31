'use client';

import React, { useState } from 'react';
import { Crown, CheckCircle, Replace, WandSparkles, History, Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Qwirkle Color Palette (Vibrant & Kid-Friendly) ---
// Updated for WCAG AA Contrast Compliance
const COLORS = {
  red: '#DC2626',      
  orange: '#EA580C',   
  yellow: '#CA8A04',   
  green: '#16A34A',    
  blue: '#2563EB',     
  purple: '#9333EA',   
  background: '#F3F4F6', 
  cardBg: '#FFFFFF',
  textMain: '#111827',   
  textMuted: '#4B5563',  
};

// --- Shapes for Background/Avatars ---
const SHAPES = ['circle', 'square', 'diamond', 'star', 'clover', 'starburst'];

// --- Mock Data ---
const MOCK_PLAYERS = [
  { id: '1', name: 'Alice', score: 124, color: COLORS.red, shape: 'star' },
  { id: '2', name: 'Bob', score: 118, color: COLORS.blue, shape: 'circle' },
  { id: '3', name: 'Charlie', score: 95, color: COLORS.green, shape: 'square' },
  { id: '4', name: 'Dave', score: 88, color: COLORS.yellow, shape: 'clover' },
];

const ShapeIcon = ({ shape, className }: { shape: string, className?: string }) => {
    switch (shape) {
        case 'circle': return <svg viewBox="0 0 24 24" className={className} fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>;
        case 'square': return <svg viewBox="0 0 24 24" className={className} fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>;
        case 'diamond': return <svg viewBox="0 0 24 24" className={className} fill="currentColor"><polygon points="12 2 22 12 12 22 2 12" /></svg>;
        case 'star': return <svg viewBox="0 0 24 24" className={className} fill="currentColor"><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" /></svg>;
        case 'clover': return (
            <svg viewBox="0 0 24 24" className={className} fill="currentColor">
                <path d="M12 12c-2-1-3.5-4-3.5-6.5S10 1 12 1s3.5 2 3.5 4.5-1.5 5.5-3.5 6.5z" />
                <path d="M12 12c-2 1-3.5 4-3.5 6.5S10 23 12 23s3.5-2 3.5-4.5-1.5-5.5-3.5-6.5z" />
                <path d="M12 12c-1-2-4-3.5-6.5-3.5S1 10 1 12s2 3.5 4.5 3.5 5.5-1.5 6.5-3.5z" />
                <path d="M12 12c1-2 4-3.5 6.5-3.5S23 10 23 12s-2 3.5-4.5 3.5-5.5-1.5-6.5-3.5z" />
            </svg>
        );
        case 'starburst': return <svg viewBox="0 0 24 24" className={className} fill="currentColor"><polygon points="12 2 14.5 9.5 22 12 14.5 14.5 12 22 9.5 14.5 2 12 9.5 9.5" /></svg>;
        default: return <div className={className} />;
    }
}

// --- DEPTH UTILITIES ---
const depthStyles = {
    raised: "bg-white shadow-[inset_0_1px_0_0_rgba(255,255,255,1.0),0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] border border-gray-200",
    raisedHover: "hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,1.0),0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] transition-all duration-300",
    recessed: "bg-gray-100 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.06)] border-b border-white",
    buttonPrimary: "bg-orange-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_4px_6px_rgba(194,65,12,0.4),0_2px_4px_rgba(0,0,0,0.1)] text-white border border-orange-700/20 active:translate-y-1 active:shadow-inner",
    buttonSecondary: "bg-white shadow-[inset_0_1px_0_0_rgba(255,255,255,1.0),0_2px_4px_rgba(0,0,0,0.05)] border border-gray-200 text-gray-700 hover:bg-gray-50",
    buttonPurple: "bg-purple-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_4px_6px_rgba(126,34,206,0.4),0_2px_4px_rgba(0,0,0,0.1)] text-white border border-purple-700/20 active:translate-y-1 active:shadow-inner",
};


export default function DesignPreviewPage() {
  const [activeTab, setActiveTab] = useState<'game' | 'components'>('game');
  const [mockScore, setMockScore] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  return (
    <div className="min-h-screen font-body relative transition-colors duration-300" style={{ backgroundColor: COLORS.background, color: COLORS.textMain }}>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none overflow-hidden" 
           style={{ 
               backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, 
               backgroundSize: '24px 24px' 
           }} 
      >
        <ShapeIcon shape="star" className="absolute top-20 left-10 w-24 h-24 text-orange-500 animate-bounce delay-700" />
        <ShapeIcon shape="clover" className="absolute bottom-40 right-10 w-32 h-32 text-green-600 animate-pulse delay-150" />
        <ShapeIcon shape="circle" className="absolute top-1/3 right-1/4 w-16 h-16 text-blue-500 opacity-60 animate-bounce" />
        <ShapeIcon shape="square" className="absolute bottom-20 left-1/4 w-20 h-20 text-purple-500 opacity-60" />
      </div>

      {/* Header */}
      <header className={cn("sticky top-0 z-50 p-4 flex justify-between items-center backdrop-blur-md", depthStyles.raised, "border-b-0 rounded-b-2xl mb-4 mx-2 mt-2")}>
        <div>
          <h1 className="text-xl font-headline font-black flex items-center gap-2 text-slate-900">
            <ShapeIcon shape="starburst" className="w-8 h-8 text-orange-600 drop-shadow-sm" />
            <span className="text-orange-700 drop-shadow-sm">Qwirkle</span> Companion
          </h1>
        </div>
        <div className={cn("flex gap-1 p-1 rounded-full", depthStyles.recessed)}>
           <button 
             onClick={() => setActiveTab('game')}
             className={cn("px-4 py-1.5 rounded-full text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-orange-500", activeTab === 'game' ? "bg-white shadow-sm text-orange-700" : "text-gray-500 hover:text-gray-900")}
           >
             Game
           </button>
           <button 
             onClick={() => setActiveTab('components')}
             className={cn("px-4 py-1.5 rounded-full text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-orange-500", activeTab === 'components' ? "bg-white shadow-sm text-orange-700" : "text-gray-500 hover:text-gray-900")}
           >
             Components
           </button>
        </div>
      </header>

      <main className="max-w-md mx-auto min-h-[calc(100vh-100px)] relative z-10 px-4 pb-8">
        
        {activeTab === 'game' && (
          <div className="h-full flex flex-col relative space-y-6">
            
            {showCelebration && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in zoom-in duration-300 rounded-3xl">
                    <div className="text-7xl font-headline font-black text-orange-600 animate-bounce p-4 text-center drop-shadow-sm">
                        QWIRKLE!
                    </div>
                    <div className="bg-yellow-500 text-yellow-950 px-6 py-2 rounded-full text-2xl font-black shadow-lg animate-pulse transform -rotate-2">
                        +12 POINTS!
                    </div>
                    <div className="absolute inset-0 pointer-events-none">
                        <Sparkles className="absolute top-1/4 left-1/4 w-12 h-12 text-yellow-500 animate-spin" />
                        <Sparkles className="absolute bottom-1/4 right-1/4 w-16 h-16 text-orange-500 animate-pulse" />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {MOCK_PLAYERS.map((player, idx) => {
                const isCurrent = idx === 0;
                return (
                  <div 
                    key={player.id} 
                    className={cn(
                        "relative p-3 rounded-2xl flex flex-col justify-between h-28 overflow-hidden transition-all duration-300",
                        isCurrent 
                            ? cn(depthStyles.raised, "ring-2 ring-orange-500 ring-offset-2 scale-[1.02]") 
                            : "bg-white/50 border border-gray-200"
                    )}
                  >
                    <ShapeIcon shape={player.shape} className="absolute -right-2 -bottom-2 w-20 h-20 opacity-[0.10]" style={{ color: player.color }} />
                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex items-center gap-2">
                             <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white font-bold", isCurrent ? "shadow-md" : "opacity-80")} style={{ backgroundColor: player.color }}>
                                <ShapeIcon shape={player.shape} className="w-5 h-5 text-white" />
                             </div>
                        </div>
                        {idx === 0 && <Crown size={20} className="text-yellow-600 drop-shadow-sm fill-yellow-200" />}
                    </div>
                    <div className="relative z-10 mt-1">
                        <span className="block text-sm font-bold text-gray-700 truncate">{player.name}</span>
                        <span className="text-4xl font-black font-headline tracking-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]" style={{ color: player.color }}>{player.score}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-6">
                <div className="text-center space-y-3">
                    <div className={cn("inline-block px-4 py-1.5 rounded-full text-xs font-bold text-orange-700 uppercase tracking-widest", depthStyles.raised)}>
                        Round 8
                    </div>
                    <div className="flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500">
                         <h2 className="text-3xl font-headline font-black text-gray-900 drop-shadow-sm">
                            It's <span style={{ color: MOCK_PLAYERS[0].color }} className="underline decoration-4 decoration-wavy underline-offset-4">{MOCK_PLAYERS[0].name}'s</span> Turn!
                        </h2>
                    </div>
                </div>

                <div className={cn("p-6 rounded-3xl space-y-5 relative", depthStyles.raised)}>
                     <div className="flex gap-3">
                        <input 
                            type="number" 
                            placeholder="0" 
                            className={cn("flex-1 rounded-2xl px-4 py-4 text-center text-5xl font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-gray-400", depthStyles.recessed)}
                            value={mockScore}
                            onChange={(e) => setMockScore(e.target.value)}
                        />
                        <button 
                            onClick={triggerCelebration}
                            className={cn("w-24 rounded-2xl flex items-center justify-center transition-transform", depthStyles.buttonPrimary)}
                        >
                            <CheckCircle size={36} className="drop-shadow-md" />
                        </button>
                     </div>
                     <p className="text-center text-xs font-bold text-gray-500 cursor-pointer hover:text-orange-600 underline" onClick={triggerCelebration}>(Tap checkmark for celebration demo)</p>
                     <button className={cn("w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2", depthStyles.buttonSecondary)}>
                        <Replace size={18} />
                        SWAP TILES (0 PTS)
                     </button>
                </div>
            </div>

            <div className="space-y-3 pb-4">
                <button className={cn("w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-headline font-bold text-lg transition-transform group relative overflow-hidden", depthStyles.buttonPurple)}>
                    <WandSparkles size={22} className="text-yellow-200 animate-pulse drop-shadow-sm" />
                    <span className="drop-shadow-sm">Ask AI Helper</span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <div className="grid grid-cols-2 gap-3">
                    <button className={cn("py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm", depthStyles.buttonSecondary)}>
                        <History size={18} />
                        History
                    </button>
                    <button className={cn("py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm text-red-600 hover:bg-red-50", depthStyles.buttonSecondary)}>
                        <Trophy size={18} />
                        End Game
                    </button>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'components' && (
             <div className="p-6 space-y-8 h-full">
                <section>
                    <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4 font-black">Game Pieces</h3>
                    <div className="grid grid-cols-6 gap-2">
                        {SHAPES.map((shape, i) => (
                             <div key={shape} className={cn("aspect-square rounded-xl flex items-center justify-center group hover:-translate-y-1 transition-transform", depthStyles.raised)}>
                                <ShapeIcon shape={shape} className="w-8 h-8 drop-shadow-sm" style={{ color: Object.values(COLORS)[i] }} />
                             </div>
                        ))}
                    </div>
                </section>
                <section>
                    <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4 font-black">Palette</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {Object.entries(COLORS).map(([name, hex]) => (
                            <div key={name} className="space-y-1">
                                <div className={cn("h-12 w-full rounded-xl", depthStyles.raised)} style={{ backgroundColor: hex }} />
                                <p className="text-xs capitalize text-gray-600 font-medium">{name}</p>
                            </div>
                        ))}
                    </div>
                </section>
                <section>
                    <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4 font-black">Depth Demo</h3>
                    <div className="space-y-4">
                        <button className={cn("w-full py-4 rounded-2xl font-black text-xl", depthStyles.buttonPrimary)}>
                            Raised Primary
                        </button>
                        <div className={cn("p-6 rounded-2xl space-y-4", depthStyles.raised)}>
                            <p className="font-headline font-bold text-lg text-gray-900">Raised Card</p>
                            <div className={cn("h-12 w-full rounded-xl flex items-center justify-center text-gray-500 font-medium", depthStyles.recessed)}>
                                Recessed Area
                            </div>
                        </div>
                    </div>
                </section>
             </div>
        )}
      </main>
    </div>
  );
}