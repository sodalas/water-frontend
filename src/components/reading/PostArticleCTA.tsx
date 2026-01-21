/**
 * PostArticleCTA - Post-article conversion surface
 *
 * 🟥 CANONICAL PLACEMENT: After ArticleFooter ONLY
 *
 * Invariants:
 * - Appears ONLY after end-of-article boundary
 * - NOT sticky (scrolls naturally)
 * - Context-aware (guest vs authenticated)
 * - One value statement (≤ 2 lines)
 * - One primary action, one secondary action
 * - Reader can always leave without friction
 *
 * DO NOT:
 * - Make sticky or fixed
 * - Block reading
 * - Require interaction
 * - Add modals or overlays
 * - Place inside ArticleBody
 */

import { useState } from "react";
import { authClient } from "../../lib/auth-client";

interface PostArticleCTAProps {
  /**
   * Optional context from query params (e.g., utm_source, ref)
   * Used for peripheral UX only, never affects article content
   */
  context?: {
    ref?: string;
    utm_source?: string;
  };
}

export function PostArticleCTA(_props: PostArticleCTAProps) {
  // 🟥 HIGH PRIORITY FIX: Use existing auth hook instead of duplicating fetch logic
  // Textbook: "useEffect allows for cleanup operations... by returning a cleanup function"
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  const [isDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  // Different CTAs for authenticated vs guest users
  const content = isAuthenticated
    ? {
        statement: "Discover more thoughtful writing on Water.",
        primaryAction: "Explore articles",
        primaryHref: "/app",
        secondaryAction: null,
      }
    : {
        statement: "Join Water to read and share thoughtful writing.",
        primaryAction: "Get started",
        primaryHref: "/login",
        secondaryAction: "Explore more",
        secondaryHref: "/app",
      };

  return (
    <div className="mt-12 pt-8 border-t border-reading-border">
      <div className="max-w-md mx-auto text-center">
        {/* Value statement (≤ 2 lines) */}
        <p className="font-ui text-reading-text mb-6 text-base leading-relaxed">
          {content.statement}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {/* Primary action */}
          <a
            href={content.primaryHref}
            className="
              inline-block px-6 py-3
              bg-reading-text text-reading-bg
              font-ui text-sm font-medium
              rounded-lg
              hover:opacity-90
              transition-opacity
            "
          >
            {content.primaryAction}
          </a>

          {/* Secondary action (optional) */}
          {content.secondaryAction && (
            <a
              href={content.secondaryHref}
              className="
                inline-block px-6 py-3
                border border-reading-border
                text-reading-text
                font-ui text-sm font-medium
                rounded-lg
                hover:bg-reading-border/20
                transition-colors
              "
            >
              {content.secondaryAction}
            </a>
          )}
        </div>

        {/* Implicit dismiss: user scrolls away or navigates */}
        {/* No close button needed - respects reader agency */}
      </div>
    </div>
  );
}
