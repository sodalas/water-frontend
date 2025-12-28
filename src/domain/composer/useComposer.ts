import { useState, useCallback } from 'react';
import { Draft } from '../../infrastructure/draft/Draft';

export type ComposerStatus = "idle" | "publishing" | "error" | "success";

export type MediaItem = {
  id: string;
  type: "image" | "link";
  src: string;
};

export type ComposerDraft = {
  text: string;
  media: MediaItem[];
};

export function useComposer(viewerId: string) {
  // Single mutable source of truth
  const [draft, setDraft] = useState<ComposerDraft>({
    text: "",
    media: []
  });
  
  const [status, setStatus] = useState<ComposerStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Persistence helpers
  const save = useCallback(async () => {
    if (!viewerId) return;
    await Draft.save(viewerId, draft);
  }, [viewerId, draft]);

  const load = useCallback(async () => {
    if (!viewerId) return;
    const loaded = await Draft.load(viewerId);
    if (loaded) {
      // Ensure shape integrity when loading potentially partial/old drafts
      setDraft({
        text: typeof loaded.text === 'string' ? loaded.text : "",
        media: Array.isArray(loaded.media) ? loaded.media : []
      });
    }
  }, [viewerId]);

  const clear = useCallback(async () => {
    if(!viewerId) return;
    await Draft.clear(viewerId);
    // Unified reset
    setDraft({ text: "", media: [] });
    setStatus("idle");
    setError(null);
  }, [viewerId]);

  const setText = useCallback((newText: string) => {
    setDraft(prev => ({ ...prev, text: newText }));
    if (status === "success") {
      setStatus("idle");
    }
  }, [status]);

  const addMedia = useCallback((item: { type: "image" | "link"; src: string }) => {
    // Generate stable ID
    const id = Math.random().toString(36).substr(2, 9);
    setDraft(prev => ({ 
      ...prev, 
      media: [...prev.media, { ...item, id }] 
    }));
  }, []);

  const removeMedia = useCallback((id: string) => {
    setDraft(prev => ({
      ...prev,
      media: prev.media.filter(m => m.id !== id)
    }));
  }, []);

  const publish = useCallback(async (
    viewer?: { id: string; displayName?: string | null; handle?: string | null }, 
    options?: { replyTo?: string }
  ) => {
    if (!draft.text.trim() && draft.media.length === 0) return null;

    setStatus("publishing");
    setError(null);

    try {
      const cso = {
        text: draft.text,
        assertionType: options?.replyTo ? "response" : "note",
        visibility: "public",
        refs: options?.replyTo ? [options.replyTo] : [],
        media: draft.media
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

      // Unified reset on success
      setDraft({ text: "", media: [] });
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
            replyTo: options?.replyTo,
            media: cso.media
        };
      }
      return null;
    } catch (err) {
      console.error("Publish error:", err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to publish");
      return null;
    }
  }, [draft, viewerId]);

  return {
    draft,
    setText,
    addMedia,
    removeMedia,
    status,
    error,
    save,
    load,
    clear,
    publish
  };
}
