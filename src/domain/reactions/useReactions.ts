/**
 * Phase E.1: useReactions Hook
 *
 * Manages reaction state for a single assertion.
 * Follows Invariant E.1.5: No optimistic updates - refetch after mutation.
 *
 * Phase: Reaction Aggregation - accepts initial counts from projection data
 * to avoid N+1 fetches. Falls back to API fetch if not provided.
 */

import { useState, useEffect, useCallback } from 'react';
import type { ReactionType, ReactionCounts } from './types';
import {
  fetchReactions,
  addReaction,
  removeReaction,
} from '../../infrastructure/reactions/ReactionsAPI';

export interface UseReactionsOptions {
  /** Initial counts from projection data (avoids initial fetch) */
  initialCounts?: ReactionCounts;
}

export interface UseReactionsResult {
  counts: ReactionCounts;
  userReactions: ReactionType[];
  toggleReaction: (type: ReactionType) => Promise<void>;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
}

/**
 * Hook for managing reactions on an assertion.
 *
 * @param assertionId - The assertion to manage reactions for
 * @param options - Optional configuration including initial counts
 * @returns Reaction state and toggle function
 */
export function useReactions(
  assertionId: string,
  options: UseReactionsOptions = {}
): UseReactionsResult {
  const { initialCounts } = options;

  const [counts, setCounts] = useState<ReactionCounts>(
    initialCounts ?? { like: 0, acknowledge: 0 }
  );
  const [userReactions, setUserReactions] = useState<ReactionType[]>([]);
  // Skip initial loading if we have projection counts
  const [isLoading, setIsLoading] = useState(!initialCounts);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch reactions on mount and when assertionId changes
  // If initialCounts provided, still fetch for userReactions but don't show loading
  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Only show loading if we don't have initial counts
      if (!initialCounts) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await fetchReactions(assertionId);
        if (!cancelled) {
          setCounts(data.counts);
          setUserReactions(data.userReactions);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load reactions');
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
  }, [assertionId, initialCounts]);

  // Toggle reaction: add if not present, remove if present
  const toggleReaction = useCallback(
    async (type: ReactionType) => {
      if (isMutating) return;

      setIsMutating(true);
      setError(null);

      try {
        const hasReaction = userReactions.includes(type);

        if (hasReaction) {
          await removeReaction(assertionId, type);
        } else {
          await addReaction(assertionId, type);
        }

        // Invariant E.1.5: Refetch after mutation (no optimistic updates)
        const data = await fetchReactions(assertionId);
        setCounts(data.counts);
        setUserReactions(data.userReactions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to toggle reaction');
      } finally {
        setIsMutating(false);
      }
    },
    [assertionId, userReactions, isMutating]
  );

  return {
    counts,
    userReactions,
    toggleReaction,
    isLoading,
    isMutating,
    error,
  };
}
