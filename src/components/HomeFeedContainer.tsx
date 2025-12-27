// HomeFeedContainer.tsx
import React from "react";
import { useHomeFeed } from "../domain/feed/useHomeFeed";
import { HomeFeedList } from "./HomeFeedList";
import { FeedSkeletonList } from "./feed/FeedSkeletonList";
import { FeedErrorState } from "./feed/FeedErrorState";
import type { HomeFeedAdapter } from "../domain/feed/HomeFeedAdapter";

type HomeFeedContainerProps = {
  adapter: HomeFeedAdapter;
  viewerId: string;
  onItemPress?: (assertionId: string) => void;
  onAuthorPress?: (authorId: string) => void;
};

export function HomeFeedContainer(props: HomeFeedContainerProps) {
  const { adapter, viewerId, onItemPress, onAuthorPress } = props;

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
          onRetry={() => adapter.refresh()}
          // optional: title/message if you want
          // title="Couldn't load feed"
          // message="Please try again."
        />
      );

    case "ready":
      return (
        <HomeFeedList
          items={state.items}
          onItemPress={onItemPress}
          onAuthorPress={onAuthorPress}
        />
      );

    default:
      // Exhaustiveness guard — illegal states must be impossible
      return null;
  }
}
