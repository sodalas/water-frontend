import { useState, useCallback } from 'react';
import type { ComposerDraft } from './DraftStore';
import { Draft } from '../../infrastructure/draft/Draft';

export type ComposerStatus = "idle" | "publishing" | "error" | "success";

export function useComposer(viewerId: string) {
  const [draft, setDraft] = useState<ComposerDraft>({});
  const [text, setText] = useState("");
  const [status, setStatus] = useState<ComposerStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const update = useCallback((partial: ComposerDraft) => {
    setDraft(prev => ({ ...prev, ...partial }));
  }, []);

  const reset = useCallback(() => {
    setDraft({});
    setText("");
    setStatus("idle");
    setError(null);
  }, []);

  const save = useCallback(async () => {
    if (!viewerId) return;
    await Draft.save(viewerId, draft);
  }, [viewerId, draft]);

  const load = useCallback(async () => {
    if (!viewerId) return;
    const loaded = await Draft.load(viewerId);
    if (loaded) {
      setDraft(loaded);
    }
  }, [viewerId]);

  const clear = useCallback(async () => {
    if(!viewerId) return;
    await Draft.clear(viewerId);
    reset();
  }, [viewerId, reset]);

  const handleSetText = useCallback((newText: string) => {
    setText(newText);
    if (status === "success") {
      setStatus("idle");
    }
  }, [status]);

  const publish = useCallback(async (
    viewer?: { id: string; displayName?: string | null; handle?: string | null }, 
    options?: { replyTo?: string }
  ) => {
    if (!text.trim()) return null;

    setStatus("publishing");
    setError(null);

    try {
      const cso = {
        text,
        assertionType: options?.replyTo ? "response" : "note",
        visibility: "public",
        refs: options?.replyTo ? [options.replyTo] : []
      };

      const response = await fetch("/api/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ cso })
      });

      if (!response.ok) {
        throw new Error(`Publish failed: ${response.status}`);
      }

      const { assertionId, createdAt } = await response.json();

      setText("");
      setStatus("success");

      // Construct minimal FeedItem
      if (viewerId && viewer) {
        return {
            assertionId,
            authorId: viewerId,
            author: { 
                id: viewerId, 
                displayName: viewer.displayName ?? null, 
                handle: viewer.handle ?? null 
            },
            assertionType: cso.assertionType,
            text: cso.text,
            createdAt,
            visibility: cso.visibility,
            replyTo: options?.replyTo
        };
      }
      return null;
    } catch (err) {
      console.error("Publish error:", err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to publish");
      return null;
    }
  }, [text, viewerId]);

  return {
    draft,
    text,
    setText: handleSetText,
    status,
    error,
    update,
    reset,
    save,
    load,
    clear,
    publish
  };
}
