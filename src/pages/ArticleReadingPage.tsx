// 🟥 Invariant: Article reading pages MUST compose canonical reading components.
// Inline reading layout or typography is forbidden.

/**
 * ArticleReadingPage.tsx
 *
 * CANONICAL ARTICLE READING PAGE (🟥 BINDING)
 *
 * Responsibilities:
 * - Routing (receives articleId param)
 * - Data fetching (fetch article from API)
 * - Error/loading states
 * - Composition of canonical reading components
 *
 * Invariants:
 * - Reading MUST work without authentication
 * - MUST use server-rendered HTML (never client-side Markdown)
 * - MUST NOT depend on stream or editor state
 * - Engagement features MUST NOT appear during reading
 * - MUST compose canonical components (no inline layout/typography)
 *
 * DO NOT:
 * - Add client-side Markdown parsing
 * - Add personalization to reading
 * - Add comments/reactions mid-article
 * - Share code with stream or editor
 * - Inline reading layout or typography rules
 */

import { useState, useEffect } from "react";
import { useParams } from "@tanstack/react-router";
import {
  ReadingPageShell,
  ArticleHeader,
  ArticleBody,
  ArticleFooter,
  PostArticleCTA,
} from "../components/reading";

interface Article {
  id: string;
  title: string;
  dek: string | null;
  html: string;
  readingTimeMinutes: number;
  publishedAt: string;
  author: {
    id: string;
    name: string;
  };
}

function CenteredError({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-reading-bg text-reading-text flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-ui text-reading-muted">{children}</p>
      </div>
    </div>
  );
}

function CenteredLoading() {
  return (
    <div className="min-h-screen bg-reading-bg text-reading-text flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-ui text-reading-muted">Loading...</p>
      </div>
    </div>
  );
}

export function ArticleReadingPage() {
  const { articleId } = useParams({ strict: false }) as { articleId: string };
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/articles/${articleId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => !cancelled && setArticle(data))
      .catch(() => !cancelled && setError("Unable to load article"));

    return () => {
      cancelled = true;
    };
  }, [articleId]);

  if (error) return <CenteredError>{error}</CenteredError>;
  if (!article) return <CenteredLoading />;

  // 🟥 Canonical component composition - do not inline layout/typography
  return (
    <ReadingPageShell>
      <ArticleHeader
        title={article.title}
        dek={article.dek || undefined}
        author={article.author.name}
        publishedAt={new Date(article.publishedAt).toLocaleDateString()}
        readingTime={`${article.readingTimeMinutes} min read`}
      />

      <ArticleBody>
        <div dangerouslySetInnerHTML={{ __html: article.html }} />
      </ArticleBody>

      <ArticleFooter
        articleId={article.id}
        articleTitle={article.title}
      />

      {/* 🟥 Post-article CTA: ONLY after ArticleFooter */}
      <PostArticleCTA />
    </ReadingPageShell>
  );
}
