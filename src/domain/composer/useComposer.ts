import { useState, useCallback, useRef, useEffect } from "react";
import { Draft } from "../../infrastructure/draft/Draft";

export type ComposerStatus = "idle" | "publishing" | "error" | "success";
export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type MediaItem = {
  id: string;
  type: "image" | "link";
  src: string;
};

export type ComposerDraft = {
  text: string;
  media: MediaItem[];
  originPublicationId?: string;
};

export type PublishOptions = {
  replyTo?: string;
  clearDraft?: boolean; // opt-in only
};

export function useComposer(viewerId: string) {
  // Enforce Structural Recovery: Load exactly once on mount/viewerId
  const hasLoadedRef = useRef(false);

  // Single mutable source of truth
  const [draft, setDraft] = useState<ComposerDraft>({
    text: "",
    media: [],
  });

  const [status, setStatus] = useState<ComposerStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // UI Affordances
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  // Invariant: isRestored may be true ONLY when load() hydrates a persisted draft with meaningful content (non-empty text or media); blank drafts must never surface a "restored" UI.
  const [isRestored, setIsRestored] = useState(false);

  // ... (persistence and helpers remain same)
  // Persistence helpers
  // Persistence helpers
  const save = useCallback(async () => {
    if (!viewerId) return;
    try {
      await Draft.save(viewerId, draft);
      setSaveStatus("saved");
    } catch (e) {
      // Internal tracking only, per directive (so UI remains silent/last known good)
      setSaveStatus("error");
    }
  }, [viewerId, draft]);

  const load = useCallback(async () => {
    if (!viewerId) return;
    const loaded = await Draft.load(viewerId);
    if (loaded) {
      // Ensure shape integrity when loading potentially partial/old drafts
      setDraft({
        text: typeof loaded.text === "string" ? loaded.text : "",
        media: Array.isArray(loaded.media) ? loaded.media : [],
        originPublicationId:
          typeof loaded.originPublicationId === "string"
            ? loaded.originPublicationId
            : undefined,
      });
      // IsRestored = true ONLY on load hydration IF content exists
      if (loaded.text.trim() || loaded.media.length > 0) {
        setIsRestored(true);
      }
    }
  }, [viewerId]);

  // Structural Recovery: Auto-load on viewer availability
  useEffect(() => {
    if (!viewerId) return;
    if (hasLoadedRef.current) return;

    hasLoadedRef.current = true;
    load();
  }, [viewerId, load]);

  // Autosave: Persist draft changes after 1s of inactivity
  useEffect(() => {
    if (!viewerId) return;
    // Don't autosave if empty? Actually, empty might be a valid draft change (clearing).
    // But we might want to avoid saving on initial mount empty state if meaningless.
    // However, structural recovery means exact state.

    // Simple debounce
    const timer = setTimeout(() => {
      save();
    }, 1000);

    return () => clearTimeout(timer);
  }, [draft, viewerId, save]);

  const clear = useCallback(async () => {
    if (!viewerId) return;
    await Draft.clear(viewerId);
    // Unified reset
    setDraft({ text: "", media: [] });
    setStatus("idle");
    setError(null);
  }, [viewerId]);

  const setText = useCallback(
    (newText: string) => {
      setDraft((prev) => ({ ...prev, text: newText }));
      // Mutation interactions dismiss "Restored" state
      setIsRestored(false);
      // Pending save
      setSaveStatus("saving");

      if (status === "success") {
        setStatus("idle");
      }
    },
    [status]
  );

  const addMedia = useCallback(
    (item: { type: "image" | "link"; src: string }) => {
      // Generate stable ID
      const id = Math.random().toString(36).substr(2, 9);
      setDraft((prev) => ({
        ...prev,
        media: [...prev.media, { ...item, id }],
      }));
      setIsRestored(false);
      setSaveStatus("saving");
    },
    []
  );

  const replaceDraft = useCallback(
    async (newDraft: ComposerDraft) => {
      setDraft(newDraft);
      if (viewerId) {
        await Draft.save(viewerId, newDraft);
      }
    },
    [viewerId]
  );

  const removeMedia = useCallback((id: string) => {
    setDraft((prev) => ({
      ...prev,
      media: prev.media.filter((m) => m.id !== id),
    }));
  }, []);

  const publish = useCallback(
    async (
      viewer?: {
        id: string;
        displayName?: string | null;
        handle?: string | null;
      },
      options?: PublishOptions
    ) => {
      if (!draft.text.trim() && draft.media.length === 0) return null;

      setStatus("publishing");
      setError(null);

      try {
        // Construct CSO from draft state (Source of Truth)
        const cso = {
          text: draft.text,
          assertionType: options?.replyTo ? "response" : "note",
          visibility: "public",
          refs: options?.replyTo ? [options.replyTo] : [],
          media: draft.media,
          originPublicationId: draft.originPublicationId,
        };

        const response = await fetch("/api/publish", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cso,
            // Explicit opt-in for "fire-and-forget" behavior (e.g. tweets/replies).
            // Default is false (retention) for safety.
            clearDraft: options?.clearDraft,
          }),
        });

        if (!response.ok) {
          throw new Error(`Publish failed: ${response.status}`);
        }

        const { assertionId, createdAt } = await response.json();

        // Lifecycle Transition: Draft -> Publication
        // We only reset the local composer state.
        // Backend draft retention is handled via the clearDraft flag.
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
              handle: viewer.handle ?? null,
            },
            assertionType: cso.assertionType,
            text: cso.text,
            createdAt,
            visibility: cso.visibility,
            replyTo: options?.replyTo,
            media: cso.media,
          };
        }
        return null;
      } catch (err) {
        console.error("Publish error:", err);
        setStatus("error");
        setError(err instanceof Error ? err.message : "Failed to publish");
        return null;
      }
    },
    [draft, viewerId]
  );

  return {
    draft,
    setText,
    addMedia,
    removeMedia,
    replaceDraft,
    status,
    error,
    save,
    load,
    clear,
    publish,
    saveStatus,
    isRestored,
  };
}
