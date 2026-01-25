/**
 * Phase 14: BookmarkButton Component
 *
 * Private bookmark toggle button with proper ARIA semantics.
 *
 * Canon compliance:
 * - No counts displayed (bookmarks are private)
 * - Muted color to avoid suggesting popularity/ranking
 * - Edge existence only (bookmarked/not bookmarked)
 */

import { Bookmark } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { useBookmark } from '../domain/bookmarks/useBookmark';

interface BookmarkButtonProps {
  assertionId: string;
  viewerId: string | null;
}

export function BookmarkButton({ assertionId, viewerId }: BookmarkButtonProps) {
  const { isBookmarked, isPending, toggle } = useBookmark(assertionId, viewerId);

  const isAuthenticated = viewerId !== null && viewerId !== '';
  const tooltipReason = !isAuthenticated ? 'Sign in to bookmark' : undefined;

  const button = (
    <button
      onClick={toggle}
      disabled={!isAuthenticated || isPending}
      className={`
        p-2 rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center
        ${isBookmarked
          ? 'text-[#8b949e]'
          : 'text-[#6b7280] hover:text-[#8b949e]'
        }
        ${!isAuthenticated || isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isPending ? 'animate-pulse' : ''}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/50
      `}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
      aria-pressed={isBookmarked}
    >
      <Bookmark
        className="size-5"
        fill={isBookmarked ? 'currentColor' : 'none'}
      />
    </button>
  );

  if (tooltipReason && !isAuthenticated) {
    return <Tooltip content={tooltipReason}>{button}</Tooltip>;
  }

  return button;
}
