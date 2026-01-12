import SkeletonBlock from "./_SkeletonBlock";

export function FeedSkeletonCard() {
  return (
    <article
      className="bg-[#1a1f2e] border border-[#2a3142] rounded-xl p-4 flex gap-3 animate-pulse"
    >
      {/* Avatar */}
      <div className="shrink-0">
        <SkeletonBlock className="size-10 rounded-full" />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 gap-2">
        {/* Header */}
        <div className="flex gap-2 items-center">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-3 w-16" />
          <SkeletonBlock className="h-3 w-8" />
        </div>

        {/* Text lines */}
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-11/12" />
        <SkeletonBlock className="h-4 w-8/12" />

        {/* Footer */}
        <SkeletonBlock className="h-4 w-5 mt-2" />
      </div>
    </article>
  );
}
