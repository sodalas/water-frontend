// HomeFeedList.tsx
import React from "react";
import { FeedItemCard } from "./FeedItemCard.tsx";

export interface FeedItem {
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

interface HomeFeedListProps {
  items: readonly FeedItem[];
}

export function HomeFeedList({ items }: HomeFeedListProps) {
  if (items.length === 0) {
    // Empty feed is valid data, not an error
    return (
      <section
        role="feed"
        aria-label="Home feed"
        className="flex flex-col gap-4"
      >
        <p className="text-slate-400 text-sm">No posts yet.</p>
      </section>
    );
  }

  return (
    <section role="feed" aria-label="Home feed" className="flex flex-col gap-4">
      {items.map((item) => (
        <FeedItemCard key={item.assertionId} item={item} />
      ))}
    </section>
  );
}
