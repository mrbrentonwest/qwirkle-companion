'use client';

import { QwirkleShape } from '@/components/icons';

interface EmptyHistoryProps {
  onNewGame: () => void;
}

export function EmptyHistory({ onNewGame }: EmptyHistoryProps) {
  return (
    <div className="text-center py-12 space-y-4">
      <QwirkleShape shape="starburst" className="h-16 w-16 text-gray-300 mx-auto" />
      <div>
        <h3 className="font-headline text-lg font-bold text-gray-700">No games yet</h3>
        <p className="text-gray-500 text-sm">Start your first game and it will appear here</p>
      </div>
    </div>
  );
}
