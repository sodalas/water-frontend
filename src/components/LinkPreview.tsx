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

import { useCallback, useState } from 'react';
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
  // Track image loading/error state for graceful degradation
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  // Stable callback for image error - prevents recreation on every render
  // (vercel-react-best-practices: rerender-functional-setstate)
  const handleImageError = useCallback(() => {
    setImageStatus('error');
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageStatus('loaded');
  }, []);

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
            className="group shrink-0 p-1.5 text-[#6b7280] hover:text-[#9ca3af] hover:bg-[#2a3142] rounded transition-colors"
            aria-label="Retry loading preview"
            title="Retry"
          >
            <RefreshCw className="size-4 group-hover:rotate-45 transition-transform duration-200" />
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
      className="group block rounded-lg bg-[#242938] border border-[#2a3142] overflow-hidden hover:bg-[#2a3142] hover:border-[#3b82f6]/30 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/50"
      aria-label={`Link preview for ${domain}`}
    >
      {/* Preview image with gradient overlay for depth */}
      {preview.image?.url && (
        <div className="relative">
          {/* Placeholder while loading */}
          {imageStatus === 'loading' && (
            <div className="h-32 bg-[#2a3142] animate-pulse" />
          )}

          <img
            src={preview.image.url}
            alt={preview.title || 'Preview image'}
            className={`w-full max-h-48 object-cover transition-opacity duration-300 ${
              imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0 absolute inset-0'
            } ${imageStatus === 'error' ? 'hidden' : ''}`}
            loading="lazy"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />

          {/* Subtle gradient overlay for visual depth */}
          {imageStatus === 'loaded' && (
            <div className="absolute inset-0 bg-gradient-to-t from-[#242938]/60 to-transparent pointer-events-none" />
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        {/* Title - required, single line truncate */}
        <h3 className="text-sm font-medium text-white truncate group-hover:text-[#e5e7eb] transition-colors">
          {preview.title}
        </h3>

        {/* Description - 2 line clamp */}
        {preview.description && (
          <p className="text-xs text-[#9ca3af] mt-1 line-clamp-2">
            {preview.description}
          </p>
        )}

        {/* Domain badge with external indicator */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-xs text-[#6b7280] truncate">{domain}</span>
          <ExternalLink
            className="size-3 text-[#4b5563] shrink-0 group-hover:text-[#3b82f6] transition-colors"
            aria-hidden="true"
          />
          <span className="sr-only">(opens in new tab)</span>
        </div>
      </div>
    </a>
  );
}
