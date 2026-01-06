/**
 * ProgressIndicator - Optional reading progress bar
 *
 * Canon-safe progress indicator that doesn't interfere with reading.
 * Displays as a thin bar at the top of the viewport.
 */

interface ProgressIndicatorProps {
  progress: number; // 0-100
}

export function ProgressIndicator({ progress }: ProgressIndicatorProps) {
  return (
    <div
      className="fixed top-0 left-0 h-[2px] bg-reading-text/25 z-50"
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      aria-hidden="true"
    />
  );
}
