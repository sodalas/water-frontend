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
        className="flex flex-col gap-4"
      >
        <p className="text-slate-400 text-sm">No posts yet.</p>
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
