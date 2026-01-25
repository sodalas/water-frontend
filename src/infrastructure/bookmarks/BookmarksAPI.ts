/**
 * Phase 14: Bookmarks API Adapter
 *
 * Provides fetch-based API calls for bookmark operations.
 * Follows idempotent semantics: re-bookmarking is a no-op.
 */

const API_BASE = '/api';

export interface BookmarkState {
  isBookmarked: boolean;
}

/**
 * Check if an assertion is bookmarked by the current user.
 */
export async function fetchBookmarkState(assertionId: string): Promise<BookmarkState> {
  const res = await fetch(`${API_BASE}/bookmarks/${assertionId}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch bookmark state: ${res.status}`);
  }

  return res.json();
}

/**
 * Add a bookmark (idempotent).
 */
export async function addBookmark(assertionId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/bookmarks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ assertionId }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Failed to add bookmark: ${res.status}`);
  }
}

/**
 * Remove a bookmark (idempotent).
 */
export async function removeBookmark(assertionId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/bookmarks`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ assertionId }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Failed to remove bookmark: ${res.status}`);
  }
}
