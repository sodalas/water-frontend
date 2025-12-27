// src/domain/feed/HomeFeedAdapter.ts

export type FeedStatus = 'idle' | 'loading' | 'ready' | 'error';

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
 */
export const HomeFeedAdapter = {
  // Factory for Idle State
  idle(): FeedSnapshot {
    return { status: 'idle', data: null, error: null };
  },

  // Factory for Loading State (replaces snapshot)
  loading(): FeedSnapshot {
    return { status: 'loading', data: null, error: null };
  },

  // Fetch Logic (Authoritative Source)
  async fetch(viewerId: string): Promise<FeedSnapshot> {
    try {
      // Mock Network Call
      // In a real implementation, this would use fetch() to the backend projection API.
      // It is isolated here so the Hook doesn't know about 'fetch' or 'axios'.
      console.debug(`[HomeFeedAdapter] Fetching for ${viewerId}`);
      
      const mockData: FeedItem[] = []; // Empty for now

      return {
        status: 'ready',
        data: mockData,
        error: null
      };
    } catch (error) {
       return {
         status: 'error',
         data: null,
         error: error instanceof Error ? error : new Error('Unknown Adapter Error')
       };
    }
  }
};
