// src/components/feed/types.ts
export interface FeedItemView {
  assertionId: string;
  authorName: string;
  authorHandle: string;
  avatarUrl?: string;
  createdAt: string;
  text: string;
  media?: {
    type: "image" | "video" | "link";
    src: string;
    preview?: string;
    title?: string;
    domain?: string;
  }[];
}
