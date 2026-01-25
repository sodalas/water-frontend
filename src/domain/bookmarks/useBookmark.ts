/**
 * Phase 14: useBookmark Hook
 *
 * Manages bookmark state for a single assertion.
 * Uses optimistic updates for responsive UI.
 *
 * Canon compliance:
 * - No counts exposed (bookmarks are private edge existence only)
 * - Unauthenticated users get no-op toggle
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchBookmarkState,
  addBookmark,
  removeBookmark,
} from '../../infrastructure/bookmarks/BookmarksAPI';

export interface UseBookmarkResult {
  isBookmarked: boolean;
  isPending: boolean;
  toggle: () => void;
}

/**
 * Hook for managing bookmark state on an assertion.
 *
 * @param assertionId - The assertion to bookmark
 * @param viewerId - Current user ID (null if not authenticated)
 * @returns Bookmark state and toggle function
 */
export function useBookmark(
  assertionId: string,
  viewerId: string | null
): UseBookmarkResult {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Unauthenticated users: no bookmark functionality
  const isAuthenticated = viewerId !== null && viewerId !== '';

  // Fetch bookmark state on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);

      try {
        const state = await fetchBookmarkState(assertionId);
        if (!cancelled) {
          setIsBookmarked(state.isBookmarked);
        }
      } catch (err) {
        // Silently fail - bookmark state is non-critical
        if (!cancelled) {
          setIsBookmarked(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [assertionId, isAuthenticated]);

  // Toggle bookmark with optimistic update
  const toggle = useCallback(() => {
    if (!isAuthenticated || isPending) return;

    // Optimistic update
    const previousState = isBookmarked;
    setIsBookmarked(!previousState);
    setIsPending(true);

    const mutation = previousState ? removeBookmark : addBookmark;

    mutation(assertionId)
      .catch(() => {
        // Revert on error
        setIsBookmarked(previousState);
      })
      .finally(() => {
        setIsPending(false);
      });
  }, [assertionId, isAuthenticated, isBookmarked, isPending]);

  // Return no-op for unauthenticated users
  if (!isAuthenticated) {
    return {
      isBookmarked: false,
      isPending: false,
      toggle: () => {},
    };
  }

  return {
    isBookmarked,
    isPending: isPending || isLoading,
    toggle,
  };
}
