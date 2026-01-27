/**
 * useLinkPreview Hook
 *
 * Fetches external link preview data from backend API.
 * Handles loading, success, and error states.
 *
 * Per v3.0 guardrails: preview data is discardable and regenerable.
 * This is rendering-only infrastructure with no canonical impact.
 */

import { useState, useEffect, useCallback } from 'react';
import type { NormalizedPreview, PreviewResponse } from './types';

export interface UseLinkPreviewResult {
  preview: NormalizedPreview | null;
  isLoading: boolean;
  error: 'blocked' | 'unavailable' | null;
  retry: () => void;
}

/**
 * Hook for fetching external link preview data.
 *
 * @param url - URL to fetch preview for (null/empty returns empty state)
 * @returns Preview data, loading state, error, and retry function
 */
export function useLinkPreview(url: string | null): UseLinkPreviewResult {
  const [preview, setPreview] = useState<NormalizedPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<'blocked' | 'unavailable' | null>(null);
  const [refetchCounter, setRefetchCounter] = useState(0);

  // Retry triggers refetch by incrementing counter
  const retry = useCallback(() => {
    setRefetchCounter((c) => c + 1);
  }, []);

  useEffect(() => {
    // No URL provided - return empty state
    if (!url || url.trim() === '') {
      setPreview(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Capture validated URL for use in async function
    const validatedUrl = url;

    let cancelled = false;
    const controller = new AbortController();

    async function fetchPreview() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/previews?url=${encodeURIComponent(validatedUrl)}`,
          {
            signal: controller.signal,
            credentials: 'include',
          }
        );

        if (cancelled) return;

        if (!response.ok) {
          // Network/server error - treat as unavailable
          setPreview(null);
          setError('unavailable');
          return;
        }

        const data: PreviewResponse = await response.json();

        if (cancelled) return;

        if (data.preview) {
          // Success - have preview data
          setPreview(data.preview);
          setError(null);
        } else {
          // No preview - map reason to error state
          setPreview(null);
          setError(data.reason || 'unavailable');
        }
      } catch (err) {
        if (cancelled) return;

        // AbortError means we cancelled - not a real error
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        // Network error - treat as unavailable
        setPreview(null);
        setError('unavailable');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchPreview();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [url, refetchCounter]);

  return {
    preview,
    isLoading,
    error,
    retry,
  };
}
