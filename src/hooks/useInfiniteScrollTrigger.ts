/**
 * useInfiniteScrollTrigger.ts
 *
 * Phase 8: Infinite scroll trigger using IntersectionObserver.
 *
 * Uses IntersectionObserver (NOT scroll listeners) to detect when a sentinel
 * element becomes visible, triggering pagination without UI cursor logic.
 */

import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollTriggerOptions {
  /**
   * Callback fired when sentinel becomes visible.
   * Should call the existing loadMore() from useHomeFeed.
   */
  onTrigger: () => void;

  /**
   * Whether the trigger is enabled.
   * Set to false while loading or when no more items exist.
   */
  enabled: boolean;

  /**
   * IntersectionObserver threshold (0-1).
   * Default: 0 (trigger as soon as any part is visible)
   */
  threshold?: number;

  /**
   * Root margin for earlier/later triggering.
   * Default: "100px" (trigger 100px before sentinel is visible)
   */
  rootMargin?: string;
}

/**
 * Hook that returns a ref to attach to a sentinel element.
 * When the sentinel becomes visible and enabled is true, onTrigger is called.
 *
 * @example
 * const sentinelRef = useInfiniteScrollTrigger({
 *   onTrigger: loadMore,
 *   enabled: !!nextCursor && status !== 'loading',
 * });
 *
 * return (
 *   <>
 *     <FeedList items={items} />
 *     <div ref={sentinelRef} aria-hidden="true" />
 *   </>
 * );
 */
export function useInfiniteScrollTrigger({
  onTrigger,
  enabled,
  threshold = 0,
  rootMargin = "100px",
}: UseInfiniteScrollTriggerOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Stable callback reference to avoid re-creating observer
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && enabled) {
        onTrigger();
      }
    },
    [enabled, onTrigger]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersection, threshold, rootMargin]);

  return sentinelRef;
}
