import { useReducer, useCallback, useRef, useEffect } from "react";
import { Draft } from "../../infrastructure/draft/Draft";

export type MediaItem = {
  id: string;
  type: "image" | "link";
  src: string;
};

export type ComposerDraft = {
  title?: string;
  text: string;
  media: MediaItem[];
  originPublicationId?: string;
};

export type PublishOptions = {
  replyTo?: string;
  clearDraft?: boolean;
  articleTitle?: string;
  supersedesId?: string; // Phase B3.4-B: For revisions
};

// 🟥 P1 COMPLIANT: Preserve orthogonal axes, eliminate impossible states
// Phase = publication lifecycle (idle/editing/publishing)
// Save = persistence status (orthogonal axis)
// Draft = content (orthogonal axis)
type ComposerState = {
  phase: "idle" | "editing" | "publishing";
  draft: ComposerDraft;
  save: {
    status: "idle" | "saving" | "saved" | "error";
  };
  publish?: {
    lastPublishedId?: string;
    error?: string;
  };
  isRestored: boolean;
};

type ComposerAction =
  | { type: "LOAD_DRAFT"; draft: ComposerDraft; hasContent: boolean }
  | { type: "SET_TITLE"; title: string }
  | { type: "SET_TEXT"; text: string }
  | { type: "ADD_MEDIA"; item: MediaItem }
  | { type: "REMOVE_MEDIA"; id: string }
  | { type: "REPLACE_DRAFT"; draft: ComposerDraft }
  | { type: "CLEAR_DRAFT" }
  | { type: "PUBLISH_START" }
  | { type: "PUBLISH_SUCCESS"; publishedId?: string }
  | { type: "PUBLISH_ERROR"; error: string }
  | { type: "SAVE_START" }
  | { type: "SAVE_SUCCESS" }
  | { type: "SAVE_ERROR" };

// 🟥 Reducer = State Math Only (no side effects, no async, no business logic)
function composerReducer(state: ComposerState, action: ComposerAction): ComposerState {
  switch (action.type) {
    case "LOAD_DRAFT":
      return {
        ...state,
        phase: "idle",
        draft: action.draft,
        publish: undefined,
        isRestored: action.hasContent,
      };

    case "SET_TITLE":
      return {
        ...state,
        phase: "editing",
        draft: { ...state.draft, title: action.title },
        isRestored: false,
        save: { status: "saving" },
      };

    case "SET_TEXT":
      return {
        ...state,
        phase: "editing",
        draft: { ...state.draft, text: action.text },
        isRestored: false,
        save: { status: "saving" },
      };

    case "ADD_MEDIA":
      return {
        ...state,
        phase: "editing",
        draft: {
          ...state.draft,
          media: [...state.draft.media, action.item],
        },
        isRestored: false,
        save: { status: "saving" },
      };

    case "REMOVE_MEDIA":
      return {
        ...state,
        draft: {
          ...state.draft,
          media: state.draft.media.filter((m) => m.id !== action.id),
        },
      };

    case "REPLACE_DRAFT":
      return {
        ...state,
        draft: action.draft,
      };

    case "CLEAR_DRAFT":
      return {
        phase: "idle",
        draft: { text: "", media: [] },
        save: { status: "idle" },
        publish: undefined,
        isRestored: false,
      };

    case "PUBLISH_START":
      return {
        ...state,
        phase: "publishing",
        publish: undefined, // Clear previous publish state
      };

    case "PUBLISH_SUCCESS":
      return {
        phase: "idle",
        draft: { text: "", media: [] },
        save: { status: "idle" },
        publish: { lastPublishedId: action.publishedId },
        isRestored: false,
      };

    case "PUBLISH_ERROR":
      return {
        ...state,
        phase: "idle",
        publish: { error: action.error },
      };

    case "SAVE_START":
      return {
        ...state,
        save: { status: "saving" },
      };

    case "SAVE_SUCCESS":
      return {
        ...state,
        save: { status: "saved" },
      };

    case "SAVE_ERROR":
      return {
        ...state,
        save: { status: "error" },
      };

    default:
      return state;
  }
}

const initialState: ComposerState = {
  phase: "idle",
  draft: { text: "", media: [] },
  save: { status: "idle" },
  publish: undefined,
  isRestored: false,
};

export function useComposer(viewerId: string) {
  const hasLoadedRef = useRef(false);
  const [state, dispatch] = useReducer(composerReducer, initialState);

  // Persistence helpers (async logic lives here, not in reducer)
  const save = useCallback(async () => {
    if (!viewerId) return;
    dispatch({ type: "SAVE_START" });
    try {
      await Draft.save(viewerId, state.draft);
      dispatch({ type: "SAVE_SUCCESS" });
    } catch (e) {
      dispatch({ type: "SAVE_ERROR" });
    }
  }, [viewerId, state.draft]);

  const load = useCallback(async () => {
    if (!viewerId) return;
    const loaded = await Draft.load(viewerId);
    if (loaded) {
      // Ensure shape integrity
      const normalizedDraft: ComposerDraft = {
        title: typeof loaded.title === "string" ? loaded.title : undefined,
        text: typeof loaded.text === "string" ? loaded.text : "",
        media: Array.isArray(loaded.media) ? loaded.media : [],
        originPublicationId:
          typeof loaded.originPublicationId === "string"
            ? loaded.originPublicationId
            : undefined,
      };

      const hasContent = normalizedDraft.text.trim().length > 0 || normalizedDraft.media.length > 0;
      dispatch({ type: "LOAD_DRAFT", draft: normalizedDraft, hasContent });
    }
  }, [viewerId]);

  // Invariant 5: Reset identity-scoped refs when viewerId changes
  useEffect(() => {
    hasLoadedRef.current = false;
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

    const timer = setTimeout(() => {
      save();
    }, 1000);

    return () => clearTimeout(timer);
  }, [state.draft, viewerId, save]);

  const clear = useCallback(async () => {
    if (!viewerId) return;
    await Draft.clear(viewerId);
    dispatch({ type: "CLEAR_DRAFT" });
  }, [viewerId]);

  const setTitle = useCallback((newTitle: string) => {
    dispatch({ type: "SET_TITLE", title: newTitle });
  }, []);

  const setText = useCallback((newText: string) => {
    dispatch({ type: "SET_TEXT", text: newText });
  }, []);

  const addMedia = useCallback((item: { type: "image" | "link"; src: string }) => {
    const id = Math.random().toString(36).substr(2, 9);
    dispatch({ type: "ADD_MEDIA", item: { ...item, id } });
  }, []);

  const removeMedia = useCallback((id: string) => {
    dispatch({ type: "REMOVE_MEDIA", id });
  }, []);

  const replaceDraft = useCallback(
    async (newDraft: ComposerDraft) => {
      dispatch({ type: "REPLACE_DRAFT", draft: newDraft });
      if (viewerId) {
        await Draft.save(viewerId, newDraft);
      }
    },
    [viewerId]
  );

  const publish = useCallback(
    async (
      viewer?: {
        id: string;
        displayName?: string | null;
        handle?: string | null;
      },
      options?: PublishOptions
    ) => {
      if (!state.draft.text.trim() && state.draft.media.length === 0) return null;

      dispatch({ type: "PUBLISH_START" });

      try {
        // Determine assertion type
        let assertionType = "note";
        if (options?.articleTitle) {
          assertionType = "article";
        } else if (options?.replyTo) {
          assertionType = "response";
        }

        const cso = {
          title: options?.articleTitle,
          text: state.draft.text,
          assertionType,
          visibility: "public",
          refs: options?.replyTo ? [options.replyTo] : [],
          media: state.draft.media,
          originPublicationId: state.draft.originPublicationId,
        };

        const response = await fetch("/api/publish", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cso,
            clearDraft: options?.clearDraft,
            supersedesId: options?.supersedesId, // Phase B3.4-B: Revision support
          }),
        });

        if (!response.ok) {
          throw new Error(`Publish failed: ${response.status}`);
        }

        const { assertionId, createdAt } = await response.json();

        dispatch({ type: "PUBLISH_SUCCESS", publishedId: assertionId });

        // Return FeedItem for optimistic updates
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
        const errorMessage = err instanceof Error ? err.message : "Failed to publish";
        dispatch({ type: "PUBLISH_ERROR", error: errorMessage });
        return null;
      }
    },
    [state.draft, viewerId]
  );

  // 🟥 Map internal state to external API (one-to-one with old behavior)
  return {
    draft: state.draft,
    // Map phase to legacy status for backward compatibility
    status: ((): "idle" | "publishing" | "error" | "success" => {
      if (state.phase === "publishing") return "publishing";
      if (state.publish?.error) return "error";
      if (state.publish?.lastPublishedId) return "success";
      return "idle";
    })(),
    error: state.publish?.error ?? null,
    saveStatus: state.save.status,
    isRestored: state.isRestored,
    setTitle,
    setText,
    addMedia,
    removeMedia,
    replaceDraft,
    save,
    load,
    clear,
    publish,
  };
}
