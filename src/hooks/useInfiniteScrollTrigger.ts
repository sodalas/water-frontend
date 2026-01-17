/**
 * useInfiniteScrollTrigger.ts
 *
 * Phase 8: Infinite scroll trigger using IntersectionObserver.
 *
 * Uses IntersectionObserver (NOT scroll listeners) to detect when a sentinel
 * element becomes visible, triggering pagination without UI cursor logic.
 *
 * Hardening (v1.1):
 * - In-flight guard prevents re-trigger storm during layout shifts
 * - Observer detached when disabled (clearer intent, lower overhead)
 * - Sentry breadcrumb for scroll behavior observability
 */

import { useEffect, useRef, useCallback } from "react";
import { addBreadcrumb } from "../components/SentryErrorBoundary";

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
  // Issue 1 fix: In-flight guard prevents re-trigger storm during layout shifts
  const isTriggeredRef = useRef(false);

  // Stable callback reference to avoid re-creating observer
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (!entry.isIntersecting) return;
      if (!enabled) return;
      if (isTriggeredRef.current) return;

      isTriggeredRef.current = true;
      // Issue 3 fix: Sentry breadcrumb for scroll behavior observability
      addBreadcrumb("feed", "Infinite scroll trigger fired", {
        nextCursorPresent: true,
      });
      onTrigger();
    },
    [enabled, onTrigger]
  );

  // Reset in-flight guard when enabled changes (after load completes)
  useEffect(() => {
    if (enabled) {
      isTriggeredRef.current = false;
    }
  }, [enabled]);

  // Issue 2 fix: Observer exists only when enabled (clearer intent, lower overhead)
  useEffect(() => {
    if (!enabled) return;

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
  }, [enabled, handleIntersection, threshold, rootMargin]);

  return sentinelRef;
}
