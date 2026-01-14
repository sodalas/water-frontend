/**
 * Phase E.1: ReactionBar Component
 *
 * Displays reaction buttons (like, acknowledge) with counts.
 * Handles disabled states with tooltips when appropriate.
 *
 * Phase: Reaction Aggregation - accepts initial counts from projection data.
 */

import { Tooltip } from './Tooltip';
import { useReactions } from '../domain/reactions/useReactions';
import type { ReactionType, ReactionCounts } from '../domain/reactions/types';

interface ReactionBarProps {
  assertionId: string;
  isAuthenticated: boolean;
  disabled?: boolean;
  disabledReason?: string;
  /** Initial counts from projection data (avoids initial fetch) */
  initialCounts?: ReactionCounts;
}

export function ReactionBar({
  assertionId,
  isAuthenticated,
  disabled = false,
  disabledReason,
  initialCounts,
}: ReactionBarProps) {
  const { counts, userReactions, toggleReaction, isLoading, isMutating } = useReactions(
    assertionId,
    { initialCounts }
  );

  const isDisabled = disabled || !isAuthenticated || isMutating;
  const tooltipReason = disabledReason || (!isAuthenticated ? 'Sign in to react' : undefined);

  const handleClick = (type: ReactionType) => {
    if (isDisabled) return;
    toggleReaction(type);
  };

  return (
    <div className="flex items-center gap-2">
      <ReactionButton
        type="like"
        count={counts.like}
        isActive={userReactions.includes('like')}
        isDisabled={isDisabled}
        isLoading={isLoading || isMutating}
        tooltipReason={tooltipReason}
        onClick={() => handleClick('like')}
      />
      <ReactionButton
        type="acknowledge"
        count={counts.acknowledge}
        isActive={userReactions.includes('acknowledge')}
        isDisabled={isDisabled}
        isLoading={isLoading || isMutating}
        tooltipReason={tooltipReason}
        onClick={() => handleClick('acknowledge')}
      />
    </div>
  );
}

interface ReactionButtonProps {
  type: ReactionType;
  count: number;
  isActive: boolean;
  isDisabled: boolean;
  isLoading: boolean;
  tooltipReason?: string;
  onClick: () => void;
}

function ReactionButton({
  type,
  count,
  isActive,
  isDisabled,
  isLoading,
  tooltipReason,
  onClick,
}: ReactionButtonProps) {
  const icon = type === 'like' ? <LikeIcon filled={isActive} /> : <AcknowledgeIcon filled={isActive} />;
  const label = type === 'like' ? 'Like' : 'Acknowledge';

  const button = (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        flex items-center gap-1 px-2 py-1 rounded transition-colors
        ${isActive
          ? 'text-[#3b82f6] bg-[#3b82f6]/10'
          : 'text-[#6b7280] hover:text-[#3b82f6] hover:bg-[#3b82f6]/5'
        }
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isLoading ? 'animate-pulse' : ''}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/50
      `}
      aria-label={`${label}${count > 0 ? ` (${count})` : ''}`}
      aria-pressed={isActive}
    >
      {icon}
      {count > 0 && (
        <span className="text-[13px] tabular-nums">{count}</span>
      )}
    </button>
  );

  if (tooltipReason && isDisabled) {
    return <Tooltip content={tooltipReason}>{button}</Tooltip>;
  }

  return button;
}

function LikeIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="size-5"
      fill={filled ? 'currentColor' : 'none'}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
      />
    </svg>
  );
}

function AcknowledgeIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="size-5"
      fill={filled ? 'currentColor' : 'none'}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}
