import SkeletonBlock from "./_SkeletonBlock";

export function FeedSkeletonCard() {
  return (
    <article
      className="
          bg-surface-dark border border-surface-highlight
          rounded-2xl p-5
          flex gap-4
          animate-pulse
        "
    >
      {/* Avatar */}
      <div className="shrink-0">
        <SkeletonBlock className="size-11 rounded-full" />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 gap-3">
        {/* Header */}
        <div className="flex gap-2 items-center">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-10" />
        </div>

        {/* Text lines */}
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-11/12" />
        <SkeletonBlock className="h-4 w-8/12" />

        {/* Media placeholder (optional, but included per design) */}
        <SkeletonBlock className="h-48 w-full rounded-xl mt-2" />

        {/* Footer */}
        <SkeletonBlock className="h-4 w-6 mt-3" />
      </div>
    </article>
  );
}
