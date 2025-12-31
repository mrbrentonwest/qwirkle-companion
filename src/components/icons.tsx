import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 9h6v6H9z" />
      <path d="M12 3v6" />
      <path d="M12 15v6" />
      <path d="M3 12h6" />
      <path d="M15 12h6" />
    </svg>
  );
}

export function QwirkleShape({ shape, className, style }: { shape: string, className?: string, style?: React.CSSProperties }) {
  switch (shape) {
      case 'circle': return <svg viewBox="0 0 24 24" className={cn("fill-current", className)} style={style}><circle cx="12" cy="12" r="10" /></svg>;
      case 'square': return <svg viewBox="0 0 24 24" className={cn("fill-current", className)} style={style}><rect x="4" y="4" width="16" height="16" rx="2" /></svg>;
      case 'diamond': return <svg viewBox="0 0 24 24" className={cn("fill-current", className)} style={style}><polygon points="12 2 22 12 12 22 2 12" /></svg>;
      case 'star': return <svg viewBox="0 0 24 24" className={cn("fill-current", className)} style={style}><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" /></svg>;
      case 'clover': return (
          <svg viewBox="0 0 24 24" className={cn("fill-current", className)} style={style}>
              <path d="M12 12c-2-1-3.5-4-3.5-6.5S10 1 12 1s3.5 2 3.5 4.5-1.5 5.5-3.5 6.5z" />
              <path d="M12 12c-2 1-3.5 4-3.5 6.5S10 23 12 23s3.5-2 3.5-4.5-1.5-5.5-3.5-6.5z" />
              <path d="M12 12c-1-2-4-3.5-6.5-3.5S1 10 1 12s2 3.5 4.5 3.5 5.5-1.5 6.5-3.5z" />
              <path d="M12 12c1-2 4-3.5 6.5-3.5S23 10 23 12s-2 3.5-4.5 3.5-5.5-1.5-6.5-3.5z" />
          </svg>
      );
      case 'starburst': return <svg viewBox="0 0 24 24" className={cn("fill-current", className)} style={style}><polygon points="12 2 14.5 9.5 22 12 14.5 14.5 12 22 9.5 14.5 2 12 9.5 9.5" /></svg>;
      default: return <div className={className} style={style} />;
  }
}
