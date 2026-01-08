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
};

// 🟥 CRITICAL FIX: Unified state eliminates impossible state combinations
// Textbook: "Move states that belong together from multiple useState into a single useReducer"
type ComposerState =
  | { status: "idle"; draft: ComposerDraft; error: null; saveStatus: "idle" | "saving" | "saved" | "error"; isRestored: boolean }
  | { status: "publishing"; draft: ComposerDraft; error: null; saveStatus: "idle" | "saving" | "saved" | "error"; isRestored: boolean }
  | { status: "success"; draft: ComposerDraft; error: null; saveStatus: "idle" | "saving" | "saved" | "error"; isRestored: boolean }
  | { status: "error"; draft: ComposerDraft; error: string; saveStatus: "idle" | "saving" | "saved" | "error"; isRestored: boolean };

type ComposerAction =
  | { type: "LOAD_DRAFT"; draft: ComposerDraft; hasContent: boolean }
  | { type: "SET_TITLE"; title: string }
  | { type: "SET_TEXT"; text: string }
  | { type: "ADD_MEDIA"; item: MediaItem }
  | { type: "REMOVE_MEDIA"; id: string }
  | { type: "REPLACE_DRAFT"; draft: ComposerDraft }
  | { type: "CLEAR_DRAFT" }
  | { type: "PUBLISH_START" }
  | { type: "PUBLISH_SUCCESS" }
  | { type: "PUBLISH_ERROR"; error: string }
  | { type: "SAVE_STATUS"; status: "idle" | "saving" | "saved" | "error" };

function composerReducer(state: ComposerState, action: ComposerAction): ComposerState {
  switch (action.type) {
    case "LOAD_DRAFT":
      return {
        ...state,
        status: "idle",
        draft: action.draft,
        error: null,
        isRestored: action.hasContent,
      };

    case "SET_TITLE":
      return {
        ...state,
        status: state.status === "success" ? "idle" : state.status,
        draft: { ...state.draft, title: action.title },
        isRestored: false,
        saveStatus: "saving",
      };

    case "SET_TEXT":
      return {
        ...state,
        status: state.status === "success" ? "idle" : state.status,
        draft: { ...state.draft, text: action.text },
        isRestored: false,
        saveStatus: "saving",
      };

    case "ADD_MEDIA":
      return {
        ...state,
        draft: {
          ...state.draft,
          media: [...state.draft.media, action.item],
        },
        isRestored: false,
        saveStatus: "saving",
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
        status: "idle",
        draft: { text: "", media: [] },
        error: null,
        saveStatus: "idle",
        isRestored: false,
      };

    case "PUBLISH_START":
      // Only valid transition from idle/error/success
      if (state.status === "publishing") return state;
      return {
        ...state,
        status: "publishing",
        error: null,
      };

    case "PUBLISH_SUCCESS":
      // Only valid transition from publishing
      if (state.status !== "publishing") return state;
      return {
        status: "success",
        draft: { text: "", media: [] }, // Clear draft on success
        error: null,
        saveStatus: "idle",
        isRestored: false,
      };

    case "PUBLISH_ERROR":
      // Only valid transition from publishing
      if (state.status !== "publishing") return state;
      return {
        ...state,
        status: "error",
        error: action.error,
      };

    case "SAVE_STATUS":
      return {
        ...state,
        saveStatus: action.status,
      };

    default:
      return state;
  }
}

const initialState: ComposerState = {
  status: "idle",
  draft: { text: "", media: [] },
  error: null,
  saveStatus: "idle",
  isRestored: false,
};

export function useComposer(viewerId: string) {
  const hasLoadedRef = useRef(false);
  const [state, dispatch] = useReducer(composerReducer, initialState);

  // Persistence helpers
  const save = useCallback(async () => {
    if (!viewerId) return;
    try {
      await Draft.save(viewerId, state.draft);
      dispatch({ type: "SAVE_STATUS", status: "saved" });
    } catch (e) {
      dispatch({ type: "SAVE_STATUS", status: "error" });
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
          }),
        });

        if (!response.ok) {
          throw new Error(`Publish failed: ${response.status}`);
        }

        const { assertionId, createdAt } = await response.json();

        dispatch({ type: "PUBLISH_SUCCESS" });

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

  return {
    draft: state.draft,
    status: state.status,
    error: state.error,
    saveStatus: state.saveStatus,
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
