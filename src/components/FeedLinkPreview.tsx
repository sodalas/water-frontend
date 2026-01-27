/**
 * FeedLinkPreview - Connected LinkPreview for feed items
 *
 * Wrapper component that connects useLinkPreview hook to LinkPreview component.
 * Extracted to separate component per Vercel best practices (rerender-memo):
 * - Isolates fetch state from parent re-renders
 * - Each link manages its own loading/error state
 * - Prevents unnecessary re-renders of sibling content
 *
 * Per v3.0 guardrails: preview data is discardable and regenerable.
 */

import { memo } from 'react';
import { LinkPreview } from './LinkPreview';
import { useLinkPreview } from '../domain/embed/useLinkPreview';

interface FeedLinkPreviewProps {
  url: string;
}

/**
 * Memoized link preview that fetches and displays external URL previews.
 * Memo prevents re-renders when parent feed item updates (reactions, replies, etc.)
 */
export const FeedLinkPreview = memo(function FeedLinkPreview({
  url,
}: FeedLinkPreviewProps) {
  const { preview, isLoading, error, retry } = useLinkPreview(url);

  return (
    <LinkPreview
      url={url}
      preview={preview}
      isLoading={isLoading}
      error={error}
      onRetry={retry}
    />
  );
});
