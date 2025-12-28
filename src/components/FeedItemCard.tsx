// FeedItemCard now uses FeedItemView
import type { FeedItemView } from "./feed/types";
import { ComposerSkeleton } from "./ComposerSkeleton";

export function FeedItemCard({ 
  item, 
  activeReplyId, 
  onActiveReplyIdChange, 
  replyComposer 
}: { 
  item: FeedItemView; 
  viewerId?: string; // Kept for interface compatibility but maybe unused now unless needed for nested? 
  activeReplyId?: string | null;
  onActiveReplyIdChange?: (id: string | null) => void;
  replyComposer?: any;
}) {
  const isReplying = activeReplyId === item.assertionId;
  const isResponse = item.assertionType === 'response';
  
  const name = item.author.displayName ?? item.author.handle ?? item.author.id;

  const handle = item.author.handle
    ? item.author.handle.startsWith("@")
      ? item.author.handle.slice(1)
      : item.author.handle
    : null;

  return (
    <article className="bg-surface-dark border border-surface-highlight rounded-2xl p-5 flex gap-4">
      {/* Avatar */}
      <div className="shrink-0">
        {item.author.avatarUrl ? (
          <img
            src={item.author.avatarUrl}
            alt={name}
            className="size-11 rounded-full object-cover"
          />
        ) : (
          <div className="size-11 rounded-full bg-surface-highlight" />
        )}
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-white truncate">{name}</span>

          {handle && (
            <span className="text-sm text-text-muted truncate">@{handle}</span>
          )}
          <span className="text-sm text-text-muted">·</span>
          <time className="text-sm text-text-muted whitespace-nowrap">
            {item.createdAt}
          </time>
        </header>

        {/* Text */}
        {item.text && (
          <p className="text-text-body leading-relaxed whitespace-pre-wrap mb-3">
            {item.text}
          </p>
        )}

        {/* Media */}
        {item.media?.length ? (
          <div className="mt-2 space-y-3">
            {item.media.map((m, i) => {
              if (m.type === "image") {
                return (
                  <img
                    key={i}
                    src={m.src}
                    alt={m.title ?? ""}
                    className="
                      w-full rounded-xl
                      border border-surface-highlight
                      object-cover
                    "
                  />
                );
              }

              if (m.type === "link") {
                return (
                  <a
                    key={i}
                    href={m.src}
                    className="
                      block p-4 rounded-xl
                      bg-surface-highlight/30
                      border border-surface-highlight
                      hover:bg-surface-highlight/50
                      transition
                    "
                  >
                    <div className="text-sm font-medium text-white truncate">
                      {m.title ?? m.domain ?? m.src}
                    </div>
                    {m.domain && (
                      <div className="text-xs text-text-muted mt-1">
                        {m.domain}
                      </div>
                    )}
                  </a>
                );
              }

              return null;
            })}
          </div>
        ) : null}

        {/* Footer actions */}
        <footer className="mt-4 flex items-center gap-4">
            {!isResponse && onActiveReplyIdChange && (
                <button 
                  onClick={() => onActiveReplyIdChange(isReplying ? null : item.assertionId)}
                  className="text-sm text-text-muted hover:text-white transition"
                >
                    {isReplying ? "Cancel" : "Reply"}
                </button>
            )}
        </footer>
        
        {isReplying && replyComposer && (
            <div className="mt-4 pt-4 border-t border-surface-highlight">
                <ComposerSkeleton composer={replyComposer} />
            </div>
        )}

        {/* Nested Responses (Visual Depth 1) */}
        {item.responses && item.responses.length > 0 && (
            <div className="mt-4 space-y-4">
                {item.responses.map(response => (
                    <FeedItemCard 
                      key={response.assertionId} 
                      item={response} 
                      // Responses cannot be replied to, so we don't strictly need to pass these props, 
                      // but good for consistency or if we change depth rules later.
                      activeReplyId={activeReplyId}
                      onActiveReplyIdChange={onActiveReplyIdChange}
                      replyComposer={replyComposer}
                    />
                ))}
            </div>
        )}
      </div>
    </article>
  );
}
