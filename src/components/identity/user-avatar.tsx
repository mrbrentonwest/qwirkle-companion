'use client';

import { User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UserAvatarProps {
  onClick: () => void;
}

/**
 * Avatar button that opens the settings sheet.
 * Displays a User icon as fallback.
 */
export function UserAvatar({ onClick }: UserAvatarProps) {
  return (
    <button
      onClick={onClick}
      className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full transition-transform active:scale-95"
      aria-label="Open settings"
    >
      <Avatar className="h-9 w-9 border border-gray-200 shadow-sm bg-white">
        <AvatarFallback className="bg-orange-50">
          <User className="h-5 w-5 text-orange-600" />
        </AvatarFallback>
      </Avatar>
    </button>
  );
}
