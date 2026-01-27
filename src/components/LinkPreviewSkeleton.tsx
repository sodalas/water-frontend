/**
 * LinkPreviewSkeleton - Loading placeholder for link previews
 *
 * Mimics the structure of LinkPreview success state with staggered animate-pulse.
 * Uses established skeleton patterns from project with refined timing.
 */

export function LinkPreviewSkeleton() {
  return (
    <div
      className="block rounded-lg bg-[#242938] border border-[#2a3142] overflow-hidden"
      aria-label="Loading link preview"
      role="status"
    >
      {/* Image placeholder - starts first */}
      <div
        className="h-32 bg-[#2a3142] animate-pulse"
        style={{ animationDelay: '0ms' }}
      />

      {/* Content area */}
      <div className="p-3 space-y-2">
        {/* Title placeholder - slight delay */}
        <div
          className="h-5 bg-[#2a3142] rounded animate-pulse w-3/4"
          style={{ animationDelay: '75ms' }}
        />

        {/* Description placeholder - two lines with cascading delays */}
        <div className="space-y-1.5">
          <div
            className="h-4 bg-[#2a3142] rounded animate-pulse w-full"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="h-4 bg-[#2a3142] rounded animate-pulse w-2/3"
            style={{ animationDelay: '225ms' }}
          />
        </div>

        {/* Domain placeholder - last to load feel */}
        <div
          className="h-3 bg-[#2a3142] rounded animate-pulse w-24 mt-2"
          style={{ animationDelay: '300ms' }}
        />
      </div>

      {/* Screen reader loading text */}
      <span className="sr-only">Loading link preview...</span>
    </div>
  );
}
