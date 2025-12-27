// HomeFeedList.tsx
// HomeFeedList uses FeedItemView
import { FeedItemCard } from "./FeedItemCard.tsx";
import type { FeedItemView } from "./feed/types";

interface HomeFeedListProps {
  items: readonly FeedItemView[];
  onItemPress?: (assertionId: string) => void;
  onAuthorPress?: (authorId: string) => void;
}

export function HomeFeedList({ items }: HomeFeedListProps) {
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
        <FeedItemCard key={item.assertionId} item={item} />
      ))}
    </section>
  );
}
