// src/domain/feed/useHomeFeed.ts
import { useState, useEffect, useCallback } from "react";
import type { HomeFeedAdapter, FeedSnapshot, FeedItem } from "./HomeFeedAdapter";

export function useHomeFeed(adapter: HomeFeedAdapter, viewerId: string) {
  const [snapshot, setSnapshot] = useState<FeedSnapshot>(adapter.idle());

  // 🟥 VIOLATION #1 FIX: Accept AbortSignal for cancellation support
  const load = useCallback(async (signal?: AbortSignal) => {
    if (!viewerId) return;

    // Capture current snapshot for consistent state throughout async operation
    let capturedSnapshot: FeedSnapshot;
    setSnapshot(current => {
      capturedSnapshot = current;
      return adapter.loading(current);
    });

    // Delegate transitions to adapter using captured snapshot
    const result = await adapter.fetch(capturedSnapshot!, viewerId, null, signal);
    
    // 🟥 VIOLATION #1 FIX: Only set state if not aborted (prevents race conditions)
    if (!signal?.aborted) {
      setSnapshot(result);
    }
  }, [adapter, viewerId]);

  // 🟥 FEED INITIAL FETCH DIRECTIVE
  // Visiting the feed route MUST trigger an initial fetch
  // Manual refresh is allowed as a retry mechanism, not as a prerequisite
  // 🟥 VIOLATION #1 FIX: Return cleanup function to abort pending requests
  useEffect(() => {
    const controller = new AbortController();
    if (viewerId) {
      load(controller.signal);
    }
    return () => controller.abort();
  }, [load, viewerId]);

  // Explicit Transition: Load More
  const loadMore = useCallback(async () => {
    // Capture current snapshot for guard checks and consistent state
    let capturedSnapshot: FeedSnapshot;
    setSnapshot(current => {
      capturedSnapshot = current;
      return current;
    });

    if (!viewerId || !capturedSnapshot!.nextCursor || capturedSnapshot!.status === "loading") return;

    // Delegate transitions to adapter (it handles appending)
    const result = await adapter.fetch(capturedSnapshot!, viewerId, capturedSnapshot!.nextCursor);
    setSnapshot(result);
  }, [adapter, viewerId]);

  // Prepend Logic for Optimistic Updates
  // 🟥 VIOLATION #3 FIX: Use FeedItem type instead of any
  const prepend = useCallback((item: FeedItem) => {
    setSnapshot(current => {
      if (!current.data) return current;
      
      // Deduplicate
      if (current.data.some(existing => existing.assertionId === item.assertionId)) {
        return current;
      }

      return {
        ...current,
        data: [item, ...current.data]
      } as FeedSnapshot;
    });
  }, []);

  // 🟥 VIOLATION #3 FIX: Use FeedItem type instead of any
  const addResponse = useCallback((parentId: string, responseItem: FeedItem) => {
    setSnapshot(current => {
      if (!current.data) return current;

      const newData = current.data.map(parent => {
         if (parent.assertionId !== parentId) return parent;

         // Check if response already exists
         const existingResponses = parent.responses || [];
         if (existingResponses.some((r) => r.assertionId === responseItem.assertionId)) {
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
      } as FeedSnapshot;
    });
  }, []);

  // Phase C Hardening: Optimistic removal by exact ID (for superseded assertions)
  const removeItem = useCallback((assertionId: string) => {
    setSnapshot(current => {
      if (!current.data) return current;

      return {
        ...current,
        data: current.data.filter(item => item.assertionId !== assertionId)
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
    removeItem,
  };
}
