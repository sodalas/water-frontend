/**
 * src/components/feed/types.ts
 * * STRICT FEED VIEW TYPES (🟥 NO ANY)
 */

export interface MediaItem {
  id: string;
  type: "image" | "link";
  src: string;
  title?: string;   // Required for accessible image alts and link previews [cite: 410]
  domain?: string;  // Required for link attribution [cite: 411]
}

export interface FeedItemView {
  assertionId: string;
  assertionType: string;
  author: {
    id: string;
    displayName?: string | null;
    handle?: string | null;
    avatarUrl?: string | null;
  };
  createdAt: string;
  text: string;
  media?: MediaItem[];
  responses?: FeedItemView[];
}