/**
 * Phase E.1: Reactions API Adapter
 *
 * Provides fetch-based API calls for reaction operations.
 */

import type { ReactionType, ReactionsData, ReactionMutationResponse } from '../../domain/reactions/types';

const API_BASE = '/api';

/**
 * Fetch reactions for an assertion.
 * Returns counts and the current user's reactions (if authenticated).
 */
export async function fetchReactions(assertionId: string): Promise<ReactionsData> {
  const res = await fetch(`${API_BASE}/reactions/${assertionId}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch reactions: ${res.status}`);
  }

  return res.json();
}

/**
 * Add a reaction to an assertion.
 * Uses MERGE semantics - safe to call multiple times.
 */
export async function addReaction(
  assertionId: string,
  reactionType: ReactionType
): Promise<ReactionMutationResponse> {
  const res = await fetch(`${API_BASE}/reactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ assertionId, reactionType }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Failed to add reaction: ${res.status}`);
  }

  return res.json();
}

/**
 * Remove a reaction from an assertion.
 */
export async function removeReaction(
  assertionId: string,
  reactionType: ReactionType
): Promise<ReactionMutationResponse> {
  const res = await fetch(`${API_BASE}/reactions`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ assertionId, reactionType }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Failed to remove reaction: ${res.status}`);
  }

  return res.json();
}
