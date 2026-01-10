/**
 * ArticleWritePage.tsx
 *
 * MINIMAL ARTICLE AUTHORING (Test Infrastructure Only, 🟥)
 *
 * Purpose:
 * - Enable creating real articles
 * - Test /article/:id rendering pipeline
 * - Verify guest reading, sharing, CTA behavior
 *
 * This is NOT a product editor. This is test infrastructure.
 *
 * UI Constraints (STRICT):
 * - Title input
 * - Body textarea
 * - Publish button
 * - Nothing else
 *
 * Explicitly Forbidden:
 * - Formatting buttons
 * - Markdown toolbars
 * - Preview toggles
 * - Sidebars
 * - Autosuggestions
 * - Draft lists
 * - Publishing workflows
 */

import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useComposer } from "../domain/composer/useComposer";
import { authClient } from "../lib/auth-client";

export function ArticleWritePage() {
  const { data: session, isLoading, isPending } = authClient.useSession();

  // Invariant 1: Auth presence on protected route
  // Wait for session to load (route guard ensures it exists)
  if (isLoading || isPending || !session) {
    return <div>Loading...</div>;
  }

  const viewerId = session.user.id;

  if (!viewerId) {
    throw new Error("Invariant violation: authenticated route without viewerId");
  }

  const composer = useComposer(viewerId);
  const navigate = useNavigate();

  const publishArticle = useCallback(async () => {
    if (!composer.draft.title?.trim()) {
      alert("Please add a title");
      return;
    }

    if (!composer.draft.text.trim()) {
      alert("Please add article content");
      return;
    }

    try {
      // Call the articles API endpoint (server-side rendering)
      const response = await fetch("/api/articles/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: composer.draft.title,
          markdown: composer.draft.text,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to publish article");
      }

      const article = await response.json();

      // Clear the draft after successful publish
      await composer.clear();

      // Navigate to the published article
      navigate({ to: `/article/${article.id}` });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to publish article");
    }
  }, [composer, navigate]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <input
        type="text"
        placeholder="Article title"
        value={composer.draft.title || ""}
        onChange={(e) => composer.setTitle(e.target.value)}
        className="w-full text-3xl font-bold border-none outline-none mb-8 bg-transparent"
      />

      <textarea
        placeholder="Write your article…"
        value={composer.draft.text}
        onChange={(e) => composer.setText(e.target.value)}
        rows={20}
        className="w-full text-lg border-none outline-none resize-none bg-transparent"
      />

      <button
        onClick={publishArticle}
        disabled={composer.status === "publishing"}
        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {composer.status === "publishing" ? "Publishing..." : "Publish Article"}
      </button>

      {composer.error && (
        <p className="mt-4 text-red-600">{composer.error}</p>
      )}
    </main>
  );
}
