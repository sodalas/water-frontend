// src/domain/feed/useHomeFeed.ts
import { useState, useEffect, useCallback } from "react";
import type { HomeFeedAdapter, FeedSnapshot } from "./HomeFeedAdapter";

export function useHomeFeed(adapter: HomeFeedAdapter, viewerId: string) {
  const [snapshot, setSnapshot] = useState<FeedSnapshot>(adapter.getSnapshot());

  const load = useCallback(async () => {
    if (!viewerId) return;

    // Explicit Transition: Loading
    setSnapshot(adapter.loading());

    // Delegate transitions to adapter
    const result = await adapter.fetch(viewerId);
    setSnapshot(result);
  }, [adapter, viewerId]);

  // 🟥 FEED INITIAL FETCH DIRECTIVE
  // Visiting the feed route MUST trigger an initial fetch
  // Manual refresh is allowed as a retry mechanism, not as a prerequisite
  useEffect(() => {
    if (viewerId) {
      load();
    }
  }, [load, viewerId]);

  // Explicit Transition: Load More
  const loadMore = useCallback(async () => {
    if (!viewerId || !snapshot.nextCursor || snapshot.status === "loading") return;

    // Delegate transitions to adapter (it handles appending)
    const result = await adapter.fetch(viewerId, snapshot.nextCursor);
    setSnapshot(result);
  }, [adapter, viewerId, snapshot.nextCursor, snapshot.status]);

  // Prepend Logic for Optimistic Updates
  const prepend = useCallback((item: any) => { // Using any broadly here, but should match FeedItem
    setSnapshot(current => {
      if (!current.data) return current;
      
      // Deduplicate
      if (current.data.some(existing => existing.assertionId === item.assertionId)) {
        return current;
      }

      return {
        ...current,
        data: [item, ...current.data]
      };
    });
  }, []);

  const addResponse = useCallback((parentId: string, responseItem: any) => {
    setSnapshot(current => {
      if (!current.data) return current;

      const newData = current.data.map(parent => {
         if (parent.assertionId !== parentId) return parent;

         // Check if response already exists
         const existingResponses = (parent as any).responses || []; // Type cast if necessary until FeedItem updated
         if (existingResponses.some((r: any) => r.assertionId === responseItem.assertionId)) {
             return parent;
         }

         return {
             ...parent,
             responses: [...existingResponses, responseItem]
         };
      });

      return {
          ...current,
          data: newData
      };
    });
  }, []);

  return {
    status: snapshot.status,
    items: snapshot.data ?? [],
    error: snapshot.error,
    nextCursor: snapshot.nextCursor,
    load,
    loadMore,
    refresh: load,
    prepend,
    addResponse,
  };
}
