import { FeedSkeletonCard } from "./FeedSkeletonCard";

export function FeedSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <section
      role="feed"
      aria-label="Loading feed"
      className="flex flex-col gap-4"
    >
      {Array.from({ length: count }).map((_, i) => (
        <FeedSkeletonCard key={i} />
      ))}
    </section>
  );
}
