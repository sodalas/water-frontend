// HomeFeedContainer.tsx
import React from "react";
import { useHomeFeed } from "../domain/feed/useHomeFeed";
import { HomeFeedList } from "./HomeFeedList";
import { FeedSkeletonList } from "@/components/feed/FeedSkeletonList";
import { FeedErrorState } from "@/components/feed/FeedErrorState";
import type { HomeFeedAdapter } from "../domain/feed/HomeFeedAdapter";

type HomeFeedContainerProps = {
  adapter: HomeFeedAdapter;
  onItemPress?: (assertionId: string) => void;
  onAuthorPress?: (authorId: string) => void;
};

export function HomeFeedContainer(props: HomeFeedContainerProps) {
  const { adapter, onItemPress, onAuthorPress } = props;

  const state = useHomeFeed(adapter);

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
      return <HomeFeedList items={state.items} />;

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
