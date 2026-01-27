/**
 * LinkPreview - External link preview card with loading/error/success states
 *
 * Renders rich preview cards for external URLs with proper accessibility.
 * Data is discardable - per v3.0 guardrails, this is rendering-only.
 *
 * States:
 * - Loading: Shows LinkPreviewSkeleton
 * - Error/Blocked: Shows plain URL fallback
 * - Success: Shows rich card with image, title, description, domain
 */

import { RefreshCw, ExternalLink } from 'lucide-react';
import { LinkPreviewSkeleton } from './LinkPreviewSkeleton';
import type { NormalizedPreview } from '../domain/embed/types';

export interface LinkPreviewProps {
  url: string;
  preview: NormalizedPreview | null;
  isLoading: boolean;
  error?: 'blocked' | 'unavailable' | null;
  onRetry?: () => void;
}

/**
 * Extract domain from URL for display
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function LinkPreview({
  url,
  preview,
  isLoading,
  error,
  onRetry,
}: LinkPreviewProps) {
  // Loading state
  if (isLoading) {
    return <LinkPreviewSkeleton />;
  }

  // Error/blocked state - show fallback
  if (!preview) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-[#242938] border border-[#2a3142]">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-sm text-[#3b82f6] hover:underline truncate"
        >
          {url}
        </a>

        {/* Retry button only for unavailable errors (blocked won't succeed) */}
        {error === 'unavailable' && onRetry && (
          <button
            onClick={onRetry}
            className="shrink-0 p-1.5 text-[#6b7280] hover:text-[#9ca3af] hover:bg-[#2a3142] rounded transition-colors"
            aria-label="Retry loading preview"
            title="Retry"
          >
            <RefreshCw className="size-4" />
          </button>
        )}

        <ExternalLink
          className="shrink-0 size-4 text-[#4b5563]"
          aria-hidden="true"
        />
      </div>
    );
  }

  // Success state - rich preview card
  const domain = preview.siteName || extractDomain(preview.canonicalUrl);

  return (
    <a
      href={preview.canonicalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg bg-[#242938] border border-[#2a3142] overflow-hidden hover:bg-[#2a3142] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/50"
      aria-label={`Link preview for ${domain}`}
    >
      {/* Preview image */}
      {preview.image?.url && (
        <div className="relative">
          <img
            src={preview.image.url}
            alt={preview.title || 'Preview image'}
            className="w-full max-h-48 object-cover"
            loading="lazy"
            onError={(e) => {
              // Hide broken images
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        {/* Title - required, single line truncate */}
        <h3 className="text-sm font-medium text-white truncate">
          {preview.title}
        </h3>

        {/* Description - 2 line clamp */}
        {preview.description && (
          <p className="text-xs text-[#9ca3af] mt-1 line-clamp-2">
            {preview.description}
          </p>
        )}

        {/* Domain badge */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-xs text-[#6b7280] truncate">{domain}</span>
          <ExternalLink
            className="size-3 text-[#4b5563] shrink-0"
            aria-hidden="true"
          />
          <span className="sr-only">(opens in new tab)</span>
        </div>
      </div>
    </a>
  );
}
