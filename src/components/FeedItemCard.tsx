// FeedItemCard now uses FeedItemView
import { useState } from "react";
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
  const [isExpanded, setIsExpanded] = useState(false);

  const isReplying = activeReplyId === item.assertionId;
  const isPublishing = replyComposer?.status === 'publishing';
  const isResponse = item.assertionType === 'response';
  const replyCount = item.responses?.length ?? 0;
  
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
                  disabled={isPublishing}
                  className="text-sm text-text-muted hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isReplying ? "Cancel" : `Reply${replyCount > 0 ? ` (${replyCount})` : ''}`}
                </button>
            )}
        </footer>
        
        {isReplying && replyComposer && (
            <div className="mt-4 pt-4 border-t border-surface-highlight">
                <ComposerSkeleton composer={replyComposer} autoFocus />
            </div>
        )}

        {/* Nested Responses (Visual Depth 1) */}
        {item.responses && item.responses.length > 0 && (
            <div className="mt-4 border-l-2 border-surface-highlight pl-4">
               {!isExpanded ? (
                   <button 
                     onClick={() => setIsExpanded(true)}
                     className="text-sm text-brand-primary hover:text-brand-light transition"
                   >
                       View {item.responses.length} replies
                   </button>
               ) : (
                   <div className="space-y-4">
                       <button 
                         onClick={() => setIsExpanded(false)}
                         className="text-sm text-text-muted hover:text-white transition mb-4"
                       >
                           Hide replies
                       </button>
                       {item.responses.map(response => (
                        <FeedItemCard 
                          key={response.assertionId} 
                          item={response} 
                          activeReplyId={activeReplyId}
                          onActiveReplyIdChange={onActiveReplyIdChange}
                          replyComposer={replyComposer}
                        />
                       ))}
                   </div>
               )}
            </div>
        )}
      </div>
    </article>
  );
}
