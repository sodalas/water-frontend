/**
 * ArticleFooter - End-of-article boundary marker
 *
 * Mandatory component that signals completion and separates
 * engagement UI from reading content.
 *
 * May optionally include ShareButton for article sharing.
 */

import { ShareButton } from "./ShareButton";

interface ArticleFooterProps {
  children?: React.ReactNode;
  /**
   * Optional: provide articleId and title to enable sharing
   */
  articleId?: string;
  articleTitle?: string;
}

export function ArticleFooter({
  children,
  articleId,
  articleTitle,
}: ArticleFooterProps) {
  return (
    <footer className="mt-16 pt-8 border-t border-reading-border">
      <div className="flex items-center justify-between">
        <span className="text-meta font-ui text-reading-faint">
          {children || "End of article"}
        </span>

        {/* Share button: outside article body, minimal, unobtrusive */}
        {articleId && articleTitle && (
          <ShareButton
            articleId={articleId}
            title={articleTitle}
            placement="footer"
          />
        )}
      </div>
    </footer>
  );
}
