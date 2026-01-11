/**
 * Phase D.1: Reply Composer Hook
 *
 * Simplified composer for reply creation in thread view.
 * Wraps useComposer with reply-specific defaults.
 */

import { useReducer, useCallback } from "react";

type ReplyComposerState = {
  text: string;
  status: "idle" | "publishing" | "success" | "error";
  error: string | null;
};

type ReplyComposerAction =
  | { type: "SET_TEXT"; text: string }
  | { type: "PUBLISH_START" }
  | { type: "PUBLISH_SUCCESS" }
  | { type: "PUBLISH_ERROR"; error: string }
  | { type: "RESET" };

function replyComposerReducer(
  state: ReplyComposerState,
  action: ReplyComposerAction
): ReplyComposerState {
  switch (action.type) {
    case "SET_TEXT":
      return { ...state, text: action.text };
    case "PUBLISH_START":
      return { ...state, status: "publishing", error: null };
    case "PUBLISH_SUCCESS":
      return { text: "", status: "success", error: null };
    case "PUBLISH_ERROR":
      return { ...state, status: "error", error: action.error };
    case "RESET":
      return { text: "", status: "idle", error: null };
    default:
      return state;
  }
}

interface UseReplyComposerOptions {
  parentId: string;
  onSuccess?: () => void;
}

export function useReplyComposer({ parentId, onSuccess }: UseReplyComposerOptions) {
  const [state, dispatch] = useReducer(replyComposerReducer, {
    text: "",
    status: "idle",
    error: null,
  });

  const setText = useCallback((text: string) => {
    dispatch({ type: "SET_TEXT", text });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const publish = useCallback(async () => {
    if (!state.text.trim() || !parentId) return null;

    dispatch({ type: "PUBLISH_START" });

    try {
      const cso = {
        text: state.text,
        assertionType: "response",
        visibility: "public",
        refs: [{ uri: parentId }],
        media: [],
      };

      const response = await fetch("/api/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ cso }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Publish failed: ${response.status}`);
      }

      const { assertionId } = await response.json();

      dispatch({ type: "PUBLISH_SUCCESS" });
      onSuccess?.();

      return assertionId;
    } catch (err) {
      console.error("Reply publish error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to publish reply";
      dispatch({ type: "PUBLISH_ERROR", error: errorMessage });
      return null;
    }
  }, [state.text, parentId, onSuccess]);

  return {
    text: state.text,
    status: state.status,
    error: state.error,
    setText,
    publish,
    reset,
    // Convenience getters
    isPublishing: state.status === "publishing",
    canPublish: state.text.trim().length > 0 && state.status !== "publishing",
  };
}
