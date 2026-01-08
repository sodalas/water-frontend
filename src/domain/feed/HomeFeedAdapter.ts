// src/domain/feed/HomeFeedAdapter.ts

export type FeedStatus = "idle" | "loading" | "ready" | "error";

export interface FeedItem {
  assertionId: string;
  authorId: string;
  author: {
    id: string;
    displayName?: string | null;
    handle?: string | null;
  };
  assertionType: string;
  text: string;
  media?: any[];
  createdAt: string;
  visibility: string;
  replyTo?: string;
  responses?: FeedItem[];
}

export interface FeedSnapshot {
  status: FeedStatus;
  data: FeedItem[] | null;
  error: Error | null;
  nextCursor: string | null;
}

/**
 * Platform-Agnostic Adapter for the Home Feed.
 *
 * 🟥 P2.1 PURE ADAPTER DIRECTIVE
 * - NO internal state (no this.snapshot)
 * - NO mutation (all methods return NEW snapshots)
 * - React hook owns the snapshot via useState
 * - Adapter computes next state from current state
 */
export class HomeFeedAdapter {
  idle(): FeedSnapshot {
    return { status: "idle", data: null, error: null, nextCursor: null };
  }

  loading(snapshot: FeedSnapshot, cursor: string | null = null): FeedSnapshot {
    // Keep existing data if paging, clear if initial load
    return {
      status: "loading",
      data: cursor ? snapshot.data : null,
      error: null,
      nextCursor: snapshot.nextCursor,
    };
  }

  async fetch(
    snapshot: FeedSnapshot,
    viewerId: string,
    cursor: string | null = null
  ): Promise<FeedSnapshot> {
    try {
      console.debug(`[HomeFeedAdapter] Fetching for ${viewerId}, cursor: ${cursor}`);

      const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
      const response = await fetch(`/api/home${query}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to fetch home feed");

      const { items, nextCursor } = await response.json();

      // If paging, append. If first load, replace.
      const newData = cursor && snapshot.data
        ? [...snapshot.data, ...items]
        : items;

      return {
        status: "ready",
        data: newData,
        error: null,
        nextCursor,
      };
    } catch (error) {
      return {
        status: "error",
        data: snapshot.data, // Keep old data on error
        error: error instanceof Error ? error : new Error("Unknown Adapter Error"),
        nextCursor: snapshot.nextCursor,
      };
    }
  }
}
