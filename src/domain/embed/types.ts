/**
 * Types for external link preview rendering
 *
 * These types support the rendering layer only - preview data is discardable
 * and regenerable per v3.0 guardrails.
 */

export interface NormalizedPreview {
  title: string;
  description?: string;
  image?: { url: string; width?: number; height?: number };
  siteName?: string;
  type: 'article' | 'video' | 'website' | 'unknown';
  canonicalUrl: string;
  fetchedAt: string;
}

export interface PreviewResponse {
  preview: NormalizedPreview | null;
  reason?: 'blocked' | 'unavailable';
}
