// src/components/feed/types.ts
export interface FeedItemView {
  assertionId: string;
  author: {
    id: string;
    displayName?: string | null;
    handle?: string | null;
    avatarUrl?: string | null;
  };
  createdAt: string;
  text: string;
  media?: any[];
}
