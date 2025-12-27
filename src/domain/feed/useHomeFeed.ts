// src/domain/feed/useHomeFeed.ts
import { useState, useCallback, useEffect } from "react";
import { HomeFeedAdapter, type FeedSnapshot } from "./HomeFeedAdapter";

export function useHomeFeed(_adapter: HomeFeedAdapter, viewerId: string) {
  const [snapshot, setSnapshot] = useState<FeedSnapshot>(
    HomeFeedAdapter.idle()
  );

  // Reset to idle if viewer changes (Safety)
  useEffect(() => {
    setSnapshot(HomeFeedAdapter.idle());
  }, [viewerId]);

  const load = useCallback(async () => {
    if (!viewerId) return;

    // Explicit Transition: Loading
    setSnapshot(HomeFeedAdapter.loading());

    // Explicit Transition: Fetch Result
    const result = await HomeFeedAdapter.fetch(viewerId);
    setSnapshot(result);
  }, [viewerId]);

  return {
    ...snapshot, // Expose flattened state (status, data, error)
    load,
    refresh: load,
  };
}
