// src/domain/feed/HomeFeedAdapter.ts

import type { MediaItem } from "../composer/useComposer";

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
  media?: MediaItem[];
  createdAt: string;
  visibility: string;
  replyTo?: string;
  responses?: FeedItem[];
  /** Canon: Optimistic items are visually provisional until backend confirms */
  isPending?: boolean;
  /** Phase: Reaction Aggregation - counts from projection */
  reactionCounts?: { like: number; acknowledge: number };
  /** Phase 12: Backend-authoritative response count */
  responseCount?: number;
}

// 🟥 VIOLATION #2 FIX: Discriminated union prevents impossible states at compile time
export type FeedSnapshot =
  | { status: "idle"; data: null; error: null; nextCursor: null }
  | { status: "loading"; data: FeedItem[] | null; error: null; nextCursor: string | null }
  | { status: "ready"; data: FeedItem[]; error: null; nextCursor: string | null }
  | { status: "error"; data: FeedItem[] | null; error: Error; nextCursor: string | null };

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
    cursor: string | null = null,
    signal?: AbortSignal
  ): Promise<FeedSnapshot> {
    try {
      console.debug(`[HomeFeedAdapter] Fetching for ${viewerId}, cursor: ${cursor}`);

      const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
      const response = await fetch(`/api/home${query}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        signal,
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
