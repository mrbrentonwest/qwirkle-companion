'use client';

import React, { useState } from 'react';
import { Crown, CheckCircle, Replace, WandSparkles, History, Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Qwirkle Color Palette (Vibrant & Kid-Friendly) ---
const COLORS = {
  red: '#EF4444',      // Brighter Red
  orange: '#F97316',   // Bright Orange
  yellow: '#EAB308',   // Golden Yellow
  green: '#22C55E',    // Vivid Green
  blue: '#3B82F6',     // Bright Blue
  purple: '#A855F7',   // Playful Purple
  background: '#FFFBEB', // Warm Cream/Paper
  cardBg: '#FFFFFF',
  textMain: '#1F2937',   // Dark Gray (Softer than black)
  textMuted: '#6B7280',
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
      
      {/* --- Dynamic Background Pattern (Playful) --- */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none overflow-hidden" 
           style={{ 
               backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, 
               backgroundSize: '24px 24px' 
           }} 
      >
        {/* Floating Shapes - Colorful and Fun */}
        <ShapeIcon shape="star" className="absolute top-20 left-10 w-24 h-24 text-orange-400 animate-bounce delay-700" />
        <ShapeIcon shape="clover" className="absolute bottom-40 right-10 w-32 h-32 text-green-400 animate-pulse delay-150" />
        <ShapeIcon shape="circle" className="absolute top-1/3 right-1/4 w-16 h-16 text-blue-400 opacity-60 animate-bounce" />
        <ShapeIcon shape="square" className="absolute bottom-20 left-1/4 w-20 h-20 text-purple-400 opacity-60" />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md p-4 border-b border-orange-100 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div>
          <h1 className="text-xl font-headline font-black flex items-center gap-2 text-slate-800">
            <ShapeIcon shape="starburst" className="w-8 h-8 text-orange-500" />
            <span className="text-orange-600">Qwirkle</span> Companion
          </h1>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setActiveTab('game')}
             className={cn("px-4 py-2 rounded-full text-sm font-bold transition-all", activeTab === 'game' ? "bg-orange-100 text-orange-700 shadow-sm" : "text-gray-500 hover:bg-gray-100")}
           >
             Game
           </button>
           <button 
             onClick={() => setActiveTab('components')}
             className={cn("px-4 py-2 rounded-full text-sm font-bold transition-all", activeTab === 'components' ? "bg-orange-100 text-orange-700 shadow-sm" : "text-gray-500 hover:bg-gray-100")}
           >
             Components
           </button>
        </div>
      </header>

      <main className="max-w-md mx-auto min-h-[calc(100vh-80px)] shadow-xl overflow-hidden relative z-10 bg-white border-x border-orange-50">
        
        {/* --- GAME VIEW MOCKUP --- */}
        {activeTab === 'game' && (
          <div className="h-full flex flex-col relative bg-white">
            
            {/* Celebration Overlay */}
            {showCelebration && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
                    <div className="text-7xl font-headline font-black text-orange-500 animate-bounce p-4 text-center drop-shadow-sm">
                        QWIRKLE!
                    </div>
                    <div className="bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full text-2xl font-black shadow-lg animate-pulse transform -rotate-2">
                        +12 POINTS!
                    </div>
                    <div className="absolute inset-0 pointer-events-none">
                        <Sparkles className="absolute top-1/4 left-1/4 w-12 h-12 text-yellow-400 animate-spin" />
                        <Sparkles className="absolute bottom-1/4 right-1/4 w-16 h-16 text-orange-400 animate-pulse" />
                    </div>
                </div>
            )}

            {/* Player Scores Area */}
            <div className="grid grid-cols-2 gap-3 p-4">
              {MOCK_PLAYERS.map((player, idx) => {
                const isCurrent = idx === 0;
                return (
                  <div 
                    key={player.id} 
                    className={cn(
                        "relative p-3 rounded-2xl border-b-4 transition-all flex flex-col justify-between h-28 overflow-hidden group",
                        isCurrent 
                            ? "bg-white border-orange-400 shadow-lg scale-[1.02] z-10" 
                            : "bg-gray-50 border-gray-200 shadow-sm opacity-90"
                    )}
                  >
                    {/* Background Avatar Watermark */}
                    <ShapeIcon shape={player.shape} className="absolute -right-2 -bottom-2 w-20 h-20 opacity-[0.15] group-hover:scale-110 transition-transform" style={{ color: player.color }} />

                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-sm" style={{ backgroundColor: player.color }}>
                                <ShapeIcon shape={player.shape} className="w-5 h-5 text-white" />
                             </div>
                        </div>
                        {idx === 0 && <Crown size={20} className="text-yellow-500 drop-shadow-sm fill-yellow-200" />}
                    </div>
                    
                    <div className="relative z-10 mt-1">
                        <span className="block text-sm font-bold text-gray-600 truncate">{player.name}</span>
                        <span className="text-4xl font-black font-headline tracking-tight" style={{ color: player.color }}>{player.score}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Main Game Action Area */}
            <div className="flex-1 px-4 flex flex-col justify-center space-y-6 pb-6">
                
                {/* Turn Indicator */}
                <div className="text-center space-y-3">
                    <div className="inline-block bg-white px-4 py-1.5 rounded-full shadow-sm border border-orange-100">
                        <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">Round 8</span>
                    </div>
                    <div className="flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500">
                         <h2 className="text-3xl font-headline font-black text-gray-800">
                            It's <span style={{ color: MOCK_PLAYERS[0].color }} className="underline decoration-4 decoration-wavy underline-offset-4">{MOCK_PLAYERS[0].name}'s</span> Turn!
                        </h2>
                    </div>
                </div>

                {/* Score Input Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-orange-100 space-y-5 relative">
                     <div className="flex gap-3">
                        <input 
                            type="number" 
                            placeholder="0" 
                            className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-4 text-center text-5xl font-black text-gray-800 focus:outline-none focus:border-orange-400 focus:bg-white transition-all placeholder:text-gray-300"
                            value={mockScore}
                            onChange={(e) => setMockScore(e.target.value)}
                        />
                        <button 
                            onClick={triggerCelebration}
                            className="w-24 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-md bg-orange-500 hover:bg-orange-600 text-white border-b-4 border-orange-700 active:border-b-0 active:translate-y-1"
                        >
                            <CheckCircle size={36} className="drop-shadow-sm" />
                        </button>
                     </div>
                     <p className="text-center text-xs font-medium text-gray-400 cursor-pointer hover:text-orange-500" onClick={triggerCelebration}>(Tap checkmark for celebration demo)</p>
                     
                     <button className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 font-bold text-sm">
                        <Replace size={18} />
                        SWAP TILES (0 PTS)
                     </button>
                </div>

            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 bg-white border-t border-gray-100 space-y-3 pb-8">
                
                {/* AI Helper - Fun & Friendly */}
                <button 
                    className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-headline font-bold text-lg transition-all active:scale-95 shadow-md group relative overflow-hidden bg-purple-600 text-white border-b-4 border-purple-800 active:border-b-0 active:translate-y-1"
                >
                    <WandSparkles size={22} className="text-yellow-300 animate-pulse" />
                    <span>Ask AI Helper</span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button className="py-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-bold text-sm">
                        <History size={18} />
                        History
                    </button>
                    <button className="py-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 font-bold text-sm">
                        <Trophy size={18} />
                        End Game
                    </button>
                </div>
            </div>

          </div>
        )}

        {/* --- COMPONENT LIBRARY MOCKUP --- */}
        {activeTab === 'components' && (
             <div className="p-6 space-y-8 overflow-y-auto h-full bg-gray-50/50">
                <section>
                    <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-black">Game Pieces</h3>
                    <div className="grid grid-cols-6 gap-2">
                        {SHAPES.map((shape, i) => (
                             <div key={shape} className="aspect-square bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 group hover:-translate-y-1 transition-transform">
                                <ShapeIcon shape={shape} className="w-8 h-8 drop-shadow-sm" style={{ color: Object.values(COLORS)[i] }} />
                             </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-black">Palette</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {Object.entries(COLORS).map(([name, hex]) => (
                            <div key={name} className="space-y-1">
                                <div className="h-12 w-full rounded-xl shadow-sm border border-gray-100" style={{ backgroundColor: hex }} />
                                <p className="text-xs capitalize text-gray-500 font-medium">{name}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-black">Buttons & Cards</h3>
                    <div className="space-y-4">
                        <button className="w-full py-4 rounded-2xl font-black text-white shadow-md bg-orange-500 border-b-4 border-orange-700">
                            Playful Primary
                        </button>
                        <button className="w-full py-4 rounded-2xl font-black text-white shadow-md bg-green-500 border-b-4 border-green-700">
                            Success Action
                        </button>
                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <p className="font-headline font-bold text-lg text-gray-800">Card Title</p>
                            <p className="text-gray-500 mt-1">This is a card content area with a softer shadow and rounded corners.</p>
                        </div>
                    </div>
                </section>
             </div>
        )}

      </main>
    </div>
  );
}