/**
 * Phase E.1: Reaction Types
 *
 * Type definitions for the reactions feature.
 */

/** Allowed reaction types */
export type ReactionType = 'like' | 'acknowledge';

/** Reaction counts by type */
export interface ReactionCounts {
  like: number;
  acknowledge: number;
}

/** Response from GET /api/reactions/:assertionId */
export interface ReactionsData {
  counts: ReactionCounts;
  userReactions: ReactionType[];
}

/** Response from POST/DELETE /api/reactions */
export interface ReactionMutationResponse {
  success: boolean;
  action: 'added' | 'removed' | 'not_found';
}
