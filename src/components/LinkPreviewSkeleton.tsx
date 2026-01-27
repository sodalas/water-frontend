/**
 * LinkPreviewSkeleton - Loading placeholder for link previews
 *
 * Mimics the structure of LinkPreview success state with animate-pulse.
 * Uses established skeleton patterns from project.
 */

export function LinkPreviewSkeleton() {
  return (
    <div
      className="block rounded-lg bg-[#242938] border border-[#2a3142] overflow-hidden"
      aria-label="Loading link preview"
      role="status"
    >
      {/* Image placeholder */}
      <div className="h-32 bg-[#2a3142] animate-pulse" />

      {/* Content area */}
      <div className="p-3 space-y-2">
        {/* Title placeholder */}
        <div className="h-5 bg-[#2a3142] rounded animate-pulse w-3/4" />

        {/* Description placeholder - two lines */}
        <div className="space-y-1.5">
          <div className="h-4 bg-[#2a3142] rounded animate-pulse w-full" />
          <div className="h-4 bg-[#2a3142] rounded animate-pulse w-2/3" />
        </div>

        {/* Domain placeholder */}
        <div className="h-3 bg-[#2a3142] rounded animate-pulse w-24 mt-2" />
      </div>

      {/* Screen reader loading text */}
      <span className="sr-only">Loading link preview...</span>
    </div>
  );
}
