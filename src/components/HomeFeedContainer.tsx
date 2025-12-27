// HomeFeedContainer.tsx
import React from "react";
import { useHomeFeed } from "../domain/feed/useHomeFeed";
import { HomeFeedList } from "./HomeFeedList";
import { FeedSkeletonList } from "./feed/FeedSkeletonList";
import { FeedErrorState } from "./feed/FeedErrorState";
import type { FeedItem, HomeFeedAdapter } from "../domain/feed/HomeFeedAdapter";
import type { FeedItemView } from "./feed/types";

type HomeFeedContainerProps = {
  adapter: HomeFeedAdapter;
  viewerId: string;
  onItemPress?: (assertionId: string) => void;
  onAuthorPress?: (authorId: string) => void;
};

function toFeedItemView(item: FeedItem): FeedItemView {
  return {
    assertionId: item.assertionId,
    authorName: "Unknown", // placeholder for now
    authorHandle: "unknown",
    createdAt: item.createdAt,
    text: item.text,
    media: item.media,
  };
}

export function HomeFeedContainer(props: HomeFeedContainerProps) {
  const { adapter, viewerId } = props;

  const state = useHomeFeed(adapter, viewerId);

  switch (state.status) {
    case "idle":
      // Explicit idle — no inference, no auto-fetch
      return (
        <section aria-label="Home feed (idle)">
          <p>Feed not loaded.</p>
        </section>
      );

    case "loading":
      return <FeedSkeletonList />;

    case "error":
      return (
        <FeedErrorState
          onRetry={() => adapter.refresh("demo-user")}
          // optional: title/message if you want
          // title="Couldn't load feed"
          // message="Please try again."
        />
      );

    case "ready":
      return (
        <HomeFeedList
          items={state.items.map(toFeedItemView)}
          // onItemPress={onItemPress}
          // onAuthorPress={onAuthorPress}
        />
      );

    default:
      // Exhaustiveness guard — illegal states must be impossible
      return null;
  }
}
