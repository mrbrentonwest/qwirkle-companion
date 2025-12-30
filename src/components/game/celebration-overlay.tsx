'use client';

import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface CelebrationOverlayProps {
  isVisible: boolean;
  score: number;
  onComplete: () => void;
}

export function CelebrationOverlay({ isVisible, score, onComplete }: CelebrationOverlayProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm animate-in fade-in zoom-in duration-300"
      onClick={onComplete}
    >
      <div className="text-7xl font-headline font-black text-orange-500 animate-bounce p-4 text-center drop-shadow-sm">
        QWIRKLE!
      </div>
      <div className="bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full text-2xl font-black shadow-lg animate-pulse transform -rotate-2">
        +{score} POINTS!
      </div>
      <p className="mt-6 text-gray-400 text-sm font-medium animate-pulse">Tap to dismiss</p>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Sparkles className="absolute top-1/4 left-1/4 w-12 h-12 text-yellow-400 animate-spin" />
        <Sparkles className="absolute top-1/3 right-1/3 w-8 h-8 text-orange-300 animate-ping" />
        <Sparkles className="absolute bottom-1/4 right-1/4 w-16 h-16 text-orange-400 animate-pulse" />
        <Sparkles className="absolute bottom-1/3 left-1/3 w-10 h-10 text-yellow-300 animate-bounce" />

        {/* Confetti-like shapes */}
        <div className="absolute top-10 left-10 w-4 h-4 bg-red-500 rounded-full animate-bounce delay-100" />
        <div className="absolute top-20 right-20 w-3 h-3 bg-blue-500 rounded animate-ping delay-200" />
        <div className="absolute bottom-20 left-20 w-5 h-5 bg-green-500 rotate-45 animate-bounce delay-300" />
        <div className="absolute top-1/2 right-10 w-4 h-4 bg-purple-500 rounded-full animate-pulse delay-150" />
        <div className="absolute bottom-10 right-1/3 w-3 h-3 bg-yellow-500 rotate-45 animate-bounce delay-75" />
        <div className="absolute top-1/3 left-10 w-4 h-4 bg-orange-400 rounded animate-ping delay-500" />
      </div>
    </div>
  );
}
