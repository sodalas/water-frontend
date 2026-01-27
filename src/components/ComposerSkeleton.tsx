import type { useComposer } from "../domain/composer/useComposer";

type Composer = ReturnType<typeof useComposer>;

interface ComposerSkeletonProps {
  composer: Composer;
  autoFocus?: boolean;
  avatarUrl?: string | null;
  isRevising?: boolean;
  onCancelRevision?: () => void;
}

export function ComposerSkeleton({ composer, autoFocus, avatarUrl, isRevising, onCancelRevision }: ComposerSkeletonProps) {
  const isPublishing = composer.status === "publishing";
  const canPost = composer.draft.text.trim() || composer.draft.media.length > 0;

  // Handle cancel revision with draft clear
  const handleCancelRevision = async () => {
    await composer.clear();
    onCancelRevision?.();
  };

  return (
    <div className={`bg-[#1a1f2e] border rounded-xl p-4 ${isRevising ? 'border-amber-500/50' : 'border-[#2a3142]'}`}>
      {/* Revision mode banner */}
      {isRevising && (
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#2a3142]">
          <span className="text-amber-400 text-sm font-medium flex items-center gap-2">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Editing post
          </span>
          <button
            type="button"
            onClick={handleCancelRevision}
            disabled={isPublishing}
            className="text-[#6b7280] hover:text-[#9ca3af] text-sm transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      )}
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="size-10 rounded-full object-cover"
            />
          ) : (
            <div className="size-10 rounded-full bg-[#2a3142]" />
          )}
        </div>

        {/* Input area */}
        <div className="flex-1 min-w-0">
          <textarea
            autoFocus={autoFocus}
            value={composer.draft.text}
            onChange={(e) => composer.setText(e.target.value)}
            placeholder="What's happening?"
            disabled={isPublishing}
            className="
              w-full min-h-[60px] p-0 bg-transparent border-0
              text-[#e5e7eb] text-[15px] placeholder:text-[#6b7280]
              focus:outline-none resize-none
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />

          {/* Media Previews */}
          {composer.draft.media && composer.draft.media.length > 0 && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {composer.draft.media.map((m: any) => (
                <div
                  key={m.id}
                  className="relative size-16 bg-[#242938] rounded-lg overflow-hidden"
                >
                  {m.type === "image" ? (
                    <img
                      src={m.src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg className="size-5 text-[#6b7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.182-5.425a4.5 4.5 0 00-6.364 6.364L10.5 10.5" />
                      </svg>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => composer.removeMedia(m.id)}
                    className="absolute top-0.5 right-0.5 size-5 flex items-center justify-center bg-black/60 hover:bg-black/80 text-white rounded-full text-xs transition-colors"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Status messages */}
          {composer.status === "error" && (
            <div className="flex items-start gap-2 mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
              <svg className="size-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-red-400 text-sm flex-1">{composer.error || "Error publishing"}</p>
              <button
                type="button"
                onClick={() => composer.clear()}
                className="text-red-400/60 hover:text-red-400 text-xs shrink-0"
                aria-label="Dismiss error"
              >
                Dismiss
              </button>
            </div>
          )}
          {composer.status === "success" && (
            <p className="text-green-400 text-sm mt-2">Posted!</p>
          )}

          {/* Footer: actions + post button */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Image button */}
              <button
                type="button"
                onClick={() => {
                  const url = prompt("Enter image URL");
                  if (url) composer.addMedia({ type: "image", src: url });
                }}
                disabled={isPublishing}
                className="p-2 text-[#3b82f6] hover:bg-[#3b82f6]/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Add image"
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </button>

              {/* Link button */}
              <button
                type="button"
                onClick={() => {
                  const url = prompt("Enter link URL");
                  if (url) composer.addMedia({ type: "link", src: url });
                }}
                disabled={isPublishing}
                className="p-2 text-[#3b82f6] hover:bg-[#3b82f6]/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Add link"
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.182-5.425a4.5 4.5 0 00-6.364 6.364L10.5 10.5" />
                </svg>
              </button>

              {/* Save status indicator (subtle) */}
              {composer.saveStatus === "saving" && (
                <span className="text-[#4b5563] text-xs ml-2">Saving...</span>
              )}
              {composer.isRestored && (
                <span className="text-[#4ade80] text-xs ml-2">Draft restored</span>
              )}
            </div>

            {/* Post button */}
            <button
              type="button"
              onClick={() => composer.publish()}
              disabled={isPublishing || !canPost}
              className="
                px-4 py-1.5 text-sm font-medium
                bg-[#3b82f6] hover:bg-[#2563eb]
                text-white rounded-full transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1f2e]
              "
            >
              {isPublishing ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
