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
 * Encapsulates state definitions, transition logic, and data fetching.
 *
 */

export class HomeFeedAdapter {
  private snapshot: FeedSnapshot = this.idle();

  idle(): FeedSnapshot {
    return { status: "idle", data: null, error: null, nextCursor: null };
  }

  loading(existingData: FeedItem[] | null = null): FeedSnapshot {
    return { status: "loading", data: existingData, error: null, nextCursor: this.snapshot.nextCursor };
  }

  getSnapshot(): FeedSnapshot {
    return this.snapshot;
  }

  async fetch(viewerId: string, cursor: string | null = null): Promise<FeedSnapshot> {
    // Keep existing data if paging
    this.snapshot = this.loading(cursor ? this.snapshot.data : null);

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
      const newData = cursor && this.snapshot.data 
        ? [...this.snapshot.data, ...items] 
        : items;

      this.snapshot = {
        status: "ready",
        data: newData,
        error: null,
        nextCursor
      };
    } catch (error) {
      this.snapshot = {
        status: "error",
        data: this.snapshot.data, // Keep old data on error
        error:
          error instanceof Error ? error : new Error("Unknown Adapter Error"),
        nextCursor: this.snapshot.nextCursor
      };
    }

    return this.snapshot;
  }

  async refresh(viewerId: string) {
    return this.fetch(viewerId, null);
  }
}
