// src/domain/feed/HomeFeedAdapter.ts

export type FeedStatus = "idle" | "loading" | "ready" | "error";

export interface FeedItem {
  assertionId: string;
  authorId: string;
  assertionType: string;
  text: string;
  media?: any[];
  createdAt: string;
  visibility: string;
  replyTo?: string;
}

export interface FeedSnapshot {
  status: FeedStatus;
  data: FeedItem[] | null;
  error: Error | null;
}

/**
 * Platform-Agnostic Adapter for the Home Feed.
 * Encapsulates state definitions, transition logic, and data fetching.
 *
 */

export class HomeFeedAdapter {
  private snapshot: FeedSnapshot = this.idle();

  idle(): FeedSnapshot {
    return { status: "idle", data: null, error: null };
  }

  loading(): FeedSnapshot {
    return { status: "loading", data: null, error: null };
  }

  getSnapshot(): FeedSnapshot {
    return this.snapshot;
  }

  async fetch(viewerId: string): Promise<FeedSnapshot> {
    this.snapshot = this.loading();

    try {
      console.debug(`[HomeFeedAdapter] Fetching for ${viewerId}`);

      const response = await fetch('/api/home', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to fetch home feed');

      const data: FeedItem[] = await response.json();

      this.snapshot = {
        status: "ready",
        data,
        error: null,
      };
    } catch (error) {
      this.snapshot = {
        status: "error",
        data: null,
        error:
          error instanceof Error ? error : new Error("Unknown Adapter Error"),
      };
    }

    return this.snapshot;
  }

  async refresh(viewerId: string) {
    return this.fetch(viewerId);
  }
}
