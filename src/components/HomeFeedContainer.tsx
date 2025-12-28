// HomeFeedContainer.tsx
import { HomeFeedList } from "./HomeFeedList";
import { FeedSkeletonList } from "./feed/FeedSkeletonList";
import { FeedErrorState } from "./feed/FeedErrorState";
import type { FeedItem } from "../domain/feed/HomeFeedAdapter";
import type { FeedItemView } from "./feed/types";

type FeedStatus = "idle" | "loading" | "ready" | "error";

type HomeFeedContainerProps = {
  status: FeedStatus;
  items: FeedItem[];
  error: Error | null;
  onRetry: () => void;
  onItemPress?: (assertionId: string) => void;
  onAuthorPress?: (authorId: string) => void;
};

function toFeedItemView(item: FeedItem): FeedItemView {
  return {
    assertionId: item.assertionId,
    author: item.author,
    createdAt: item.createdAt,
    text: item.text,
    media: item.media,
  };
}

export function HomeFeedContainer(props: HomeFeedContainerProps) {
  const { status, items, onRetry, onItemPress, onAuthorPress } = props;

  switch (status) {
    case "idle":
      return (
        <section aria-label="Home feed (idle)">
          <p>Feed not loaded.</p>
        </section>
      );

    case "loading":
      return <FeedSkeletonList />;

    case "error":
      return <FeedErrorState onRetry={onRetry} />;

    case "ready":
      return (
        <HomeFeedList
          items={items.map(toFeedItemView)}
          onItemPress={onItemPress}
          onAuthorPress={onAuthorPress}
        />
      );

    default:
      return null;
  }
}
