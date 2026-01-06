/**
 * ShareButton - Article sharing affordance
 *
 * 🟥 PLACEMENT: Outside article body (near header or footer)
 *
 * Invariants:
 * - Uses native share API (mobile)
 * - Falls back to copy link (desktop)
 * - Does not block or interrupt reading
 * - Minimal, unobtrusive UI
 *
 * DO NOT:
 * - Place inside ArticleBody
 * - Make sticky or fixed
 * - Add social media buttons (use native share)
 * - Track without consent
 */

import { useState } from "react";

interface ShareButtonProps {
  articleId: string;
  title: string;
  /**
   * Optional: use "header" for placement near title,
   * "footer" for placement near end-of-article
   */
  placement?: "header" | "footer";
}

export function ShareButton({
  articleId,
  title,
  placement = "footer",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const articleUrl = `${window.location.origin}/article/${articleId}`;

  const handleShare = async () => {
    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: articleUrl,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fall through to copy
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    }

    // Fallback: copy to clipboard (desktop)
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const baseStyles =
    "inline-flex items-center gap-2 font-ui text-sm text-reading-faint hover:text-reading-text transition-colors";

  const placementStyles =
    placement === "header"
      ? "mb-4" // Near header
      : "mt-8"; // Near footer

  return (
    <button
      onClick={handleShare}
      className={`${baseStyles} ${placementStyles}`}
      aria-label="Share article"
    >
      {/* Share icon (minimal) */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="4" cy="8" r="2" />
        <circle cx="12" cy="4" r="2" />
        <circle cx="12" cy="12" r="2" />
        <line x1="5.5" y1="7" x2="10.5" y2="5" />
        <line x1="5.5" y1="9" x2="10.5" y2="11" />
      </svg>

      <span>{copied ? "Link copied!" : "Share"}</span>
    </button>
  );
}
