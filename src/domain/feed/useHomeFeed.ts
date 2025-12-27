// src/domain/feed/useHomeFeed.ts
import { useState, useEffect, useCallback } from "react";
import type { HomeFeedAdapter, FeedSnapshot } from "./HomeFeedAdapter";

export function useHomeFeed(adapter: HomeFeedAdapter, viewerId: string) {
  const [snapshot, setSnapshot] = useState<FeedSnapshot>(adapter.getSnapshot());

  // Reset to idle if viewer changes (Safety)
  useEffect(() => {
    setSnapshot(adapter.idle());
  }, [adapter, viewerId]);

  const load = useCallback(async () => {
    if (!viewerId) return;

    // Explicit Transition: Loading
    setSnapshot(adapter.loading());

    // Delegate transitions to adapter
    const result = await adapter.fetch(viewerId);
    setSnapshot(result);
  }, [adapter, viewerId]);

  return {
    ...snapshot, // Expose flattened state (status, data, error)
    load,
    refresh: load,
  };
}
