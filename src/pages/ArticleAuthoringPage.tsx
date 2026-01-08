/**
 * ArticleAuthoringPage.tsx
 *
 * 🟥 MINIMAL ARTICLE AUTHORING UI
 *
 * Phase 2 Prime Invariant:
 * /write produces canonical articles by calling POST /api/articles/publish
 * and then gets out of the way.
 *
 * No drafts.
 * No preview.
 * No persistence on the client.
 * No editor gravity.
 *
 * The harness has one responsibility:
 * - Collect input
 * - Submit once
 * - Redirect
 *
 * 🟥 Things explicitly forbidden:
 * - Markdown preview
 * - Editor toolbar
 * - Autosave
 * - "Draft saved" messaging
 * - Debounce logic
 * - Optimistic UI
 * - Client-side validation beyond required fields
 * - localStorage / IndexedDB
 * - Feature flags
 */

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Surface } from "../ui/surface";
import { Stack } from "../ui/stack";
import { Field } from "../ui/field";
import { Button } from "../ui/button";

export function ArticleAuthoringPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function publish() {
    // Guard against double-submit
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/articles/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, markdown }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.message || "Publish failed");
      }

      const { id } = await res.json();

      // 🟥 Nudge projections to refresh
      await queryClient.invalidateQueries({ queryKey: ["home-feed"] });

      // 🟥 Immediately hand control to Reading
      // Reading is the preview.
      navigate({ to: `/article/${id}` });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Publish failed");
      setIsSubmitting(false);
    }
  }

  return (
    <Surface>
      <Stack gap="lg">
        <Field label="Title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Body">
          <textarea
            rows={18}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Write in Markdown prose…"
            disabled={isSubmitting}
          />
        </Field>

        {error && <div className="text-red-600">{error}</div>}

        <Button onClick={publish} disabled={isSubmitting}>
          {isSubmitting ? "Publishing…" : "Publish"}
        </Button>
      </Stack>
    </Surface>
  );
}
