/**
 * Reply Composer Component
 *
 * Simplified composer for replies in thread view.
 * Text-only, no media attachments (keeps replies lightweight).
 */

import type { useReplyComposer } from "../domain/feed/useReplyComposer";

type ReplyComposer = ReturnType<typeof useReplyComposer>;

interface ReplyComposerProps {
  composer: ReplyComposer;
  autoFocus?: boolean;
  placeholder?: string;
}

export function ReplyComposer({
  composer,
  autoFocus = false,
  placeholder = "Write a reply...",
}: ReplyComposerProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (composer.canPublish) {
      composer.publish();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        autoFocus={autoFocus}
        value={composer.text}
        onChange={(e) => composer.setText(e.target.value)}
        placeholder={placeholder}
        disabled={composer.isPublishing}
        className="
          w-full min-h-[80px] p-3
          bg-surface-highlight/20 border border-surface-highlight/60
          rounded-xl text-text-body placeholder:text-text-muted/60
          focus:outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/20
          resize-none transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      />

      <div className="flex items-center justify-between">
        <div className="text-sm">
          {composer.status === "error" && (
            <span className="text-red-400">{composer.error || "Error posting reply"}</span>
          )}
          {composer.status === "success" && (
            <span className="text-green-400">Reply posted!</span>
          )}
        </div>

        <button
          type="submit"
          disabled={!composer.canPublish}
          className="
            px-4 py-2 text-sm font-medium
            bg-brand-primary hover:bg-brand-light
            text-white rounded-lg transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-dark
          "
        >
          {composer.isPublishing ? "Posting..." : "Reply"}
        </button>
      </div>
    </form>
  );
}
