// HomeFeedList.tsx
// HomeFeedList uses FeedItemView
import { FeedItemCard } from "./FeedItemCard.tsx";
import type { FeedItemView } from "./feed/types";
import type { UserRole } from "../domain/permissions/UserRole";

interface HomeFeedListProps {
  items: readonly FeedItemView[];
  viewerId?: string;
  viewerRole: UserRole;
  onItemPress?: (assertionId: string) => void;
  onAuthorPress?: (authorId: string) => void;
  activeReplyId?: string | null;
  onActiveReplyIdChange?: (id: string | null) => void;
  replyComposer?: any;
  onEdit?: (assertionId: string) => void;
  onDelete?: (assertionId: string) => void;
}

export function HomeFeedList({ items, viewerId, viewerRole, activeReplyId, onActiveReplyIdChange, replyComposer, onEdit, onDelete }: HomeFeedListProps) {
  if (items.length === 0) {
    // Empty feed is valid data, not an error
    return (
      <section
        role="feed"
        aria-label="Home feed"
        className="flex flex-col items-center justify-center text-center py-16"
      >
        <div
          className="size-14 rounded-full bg-surface-highlight/30 flex items-center justify-center mb-5"
          aria-hidden="true"
        >
          <svg
            className="size-7 text-text-muted/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
        </div>
        <p className="text-text-muted text-sm">No posts yet.</p>
        <p className="text-text-muted/60 text-xs mt-1">Be the first to share something.</p>
      </section>
    );
  }

  return (
    <section role="feed" aria-label="Home feed" className="flex flex-col gap-4">
      {items.map((item) => (
        <FeedItemCard
          key={item.assertionId}
          item={item}
          viewerId={viewerId}
          viewerRole={viewerRole}
          activeReplyId={activeReplyId}
          onActiveReplyIdChange={onActiveReplyIdChange}
          replyComposer={replyComposer}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
}
