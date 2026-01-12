/**
 * Phase E.1: useReactions Hook
 *
 * Manages reaction state for a single assertion.
 * Follows Invariant E.1.5: No optimistic updates - refetch after mutation.
 */

import { useState, useEffect, useCallback } from 'react';
import type { ReactionType, ReactionCounts } from './types';
import {
  fetchReactions,
  addReaction,
  removeReaction,
} from '../../infrastructure/reactions/ReactionsAPI';

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
 * @returns Reaction state and toggle function
 */
export function useReactions(assertionId: string): UseReactionsResult {
  const [counts, setCounts] = useState<ReactionCounts>({ like: 0, acknowledge: 0 });
  const [userReactions, setUserReactions] = useState<ReactionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch reactions on mount and when assertionId changes
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
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
  }, [assertionId]);

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
