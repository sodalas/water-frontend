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
          w-full min-h-[72px] p-3
          bg-[#242938] border border-[#2a3142]
          rounded-lg text-[#e5e7eb] text-sm placeholder:text-[#4b5563]
          focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/30
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
            px-4 py-1.5 text-sm font-medium
            bg-[#3b82f6] hover:bg-[#2563eb]
            text-white rounded-lg transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1f2e]
          "
        >
          {composer.isPublishing ? "Posting..." : "Reply"}
        </button>
      </div>
    </form>
  );
}
