/**
 * FeedItemCard with Full Interaction Surface (Canon-Aligned)
 *
 * Canon compliance:
 * - All assertions expose identical affordances (reply + thread navigation)
 * - No client-derived counts (reply counts must come from backend if needed)
 * - Optimistic items display provisional state via isPending
 */

import { Link } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import type { FeedItemView } from "./feed/types";
import { ComposerSkeleton } from "./ComposerSkeleton";
import { PostActionMenu } from "./PostActionMenu";
import { Tooltip } from "./Tooltip";
import { ReactionBar } from "./ReactionBar";
import type { UserRole } from "../domain/permissions/UserRole";
import { canEdit, canDelete } from "../domain/permissions/UserRole";

export function FeedItemCard({
  item,
  viewerId,
  viewerRole,
  activeReplyId,
  onActiveReplyIdChange,
  replyComposer,
  onEdit,
  onDelete
}: {
  item: FeedItemView;
  viewerId?: string;
  viewerRole: UserRole;
  activeReplyId?: string | null;
  onActiveReplyIdChange?: (id: string | null) => void;
  replyComposer?: any;
  onEdit?: (assertionId: string) => void;
  onDelete?: (assertionId: string) => void;
}) {
  const isReplying = activeReplyId === item.assertionId;
  const isPublishing = replyComposer?.status === 'publishing';
  const isAuthenticated = !!viewerId;

  // Permission checks for Edit/Delete visibility
  const canEditPost = canEdit(viewerId, item.author.id, viewerRole);
  const canDeletePost = canDelete(viewerId, item.author.id, viewerRole);

  // Determine disabled reasons for actions
  const editDisabledReason = !isAuthenticated
    ? "Sign in to edit"
    : !canEditPost
    ? "Only the author can edit"
    : undefined;

  const deleteDisabledReason = !isAuthenticated
    ? "Sign in to delete"
    : !canDeletePost
    ? "Only the author can delete"
    : undefined;

  const replyDisabledReason = !isAuthenticated ? "Sign in to reply" : undefined;

  const name = item.author.displayName ?? item.author.handle ?? item.author.id;

  const handle = item.author.handle
    ? item.author.handle.startsWith("@")
      ? item.author.handle.slice(1)
      : item.author.handle
    : null;

  return (
    <article className="bg-[#1a1f2e] border border-[#2a3142] rounded-xl p-4 flex gap-3">
      {/* Avatar */}
      <div className="shrink-0">
        {item.author.avatarUrl ? (
          <img
            src={item.author.avatarUrl}
            alt={name}
            className="size-10 rounded-full object-cover"
          />
        ) : (
          <div className="size-10 rounded-full bg-[#2a3142]" />
        )}
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center gap-1.5 mb-0.5">
          <span className="font-semibold text-white text-[15px] truncate">{name}</span>
          {handle && (
            <span className="text-[13px] text-[#6b7280] truncate">@{handle}</span>
          )}
          <span className="text-[13px] text-[#4b5563]">·</span>
          <time className="text-[13px] text-[#6b7280] whitespace-nowrap">
            {item.createdAt}
          </time>

          {/* Canon: Optimistic items are visually provisional */}
          {item.isPending && (
            <span className="text-xs text-[#6b7280] opacity-60 ml-1">(sending…)</span>
          )}

          {/* Action menu */}
          <div className="ml-auto">
            <PostActionMenu
              canEdit={canEditPost}
              canDelete={canDeletePost}
              onEdit={() => onEdit?.(item.assertionId)}
              onDelete={() => onDelete?.(item.assertionId)}
              editDisabledReason={editDisabledReason}
              deleteDisabledReason={deleteDisabledReason}
            />
          </div>
        </header>

        {/* Text */}
        {item.text && (
          <p className="text-[#e5e7eb] text-[15px] leading-relaxed whitespace-pre-wrap mt-1">
            {item.text}
          </p>
        )}

        {/* Media */}
        {item.media?.length ? (
          <div className="mt-3 space-y-3">
            {item.media.map((m, i) => {
              if (m.type === "image") {
                return (
                  <img
                    key={i}
                    src={m.src}
                    alt={m.title ?? ""}
                    className="w-full rounded-lg object-cover"
                  />
                );
              }

              if (m.type === "link") {
                return (
                  <a
                    key={i}
                    href={m.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-lg bg-[#242938] border border-[#2a3142] hover:bg-[#2a3142] transition-colors"
                  >
                    <div className="text-sm font-medium text-white truncate">
                      {m.title ?? m.domain ?? m.src}
                    </div>
                    {m.domain && (
                      <div className="text-xs text-[#6b7280] mt-0.5">
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

        {/* Phase 12: Thread indicator — backend-authoritative count */}
        {item.responseCount != null && item.responseCount > 0 && (
          <Link
            to="/thread/$assertionId"
            params={{ assertionId: item.assertionId }}
            className="mt-3 flex items-center gap-1.5 text-sm text-[#8b949e] hover:text-[#58a6ff] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/50 rounded"
          >
            <MessageSquare className="size-4" />
            <span>{item.responseCount} {item.responseCount === 1 ? 'reply' : 'replies'}</span>
          </Link>
        )}

        {/* Footer actions - icon based */}
        <footer className="mt-3 flex items-center gap-3">
            {/* Reply icon with tooltip - Canon: all assertions expose reply affordance */}
            {onActiveReplyIdChange && (
                replyDisabledReason ? (
                  <Tooltip content={replyDisabledReason}>
                    <button
                      disabled
                      className="text-[#4b5563] cursor-not-allowed p-1"
                      aria-label="Reply"
                    >
                      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
                      </svg>
                    </button>
                  </Tooltip>
                ) : (
                  <button
                    onClick={() => onActiveReplyIdChange(isReplying ? null : item.assertionId)}
                    disabled={isPublishing}
                    className="text-[#6b7280] hover:text-[#3b82f6] transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/50 rounded"
                    aria-label={isReplying ? "Cancel reply" : "Reply"}
                  >
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
                    </svg>
                  </button>
                )
            )}

            {/* Phase E.1: Reaction buttons */}
            <ReactionBar
              assertionId={item.assertionId}
              isAuthenticated={isAuthenticated}
              initialCounts={item.reactionCounts}
            />
        </footer>

        {isReplying && replyComposer && (
            <div className="mt-3 pt-3 border-t border-[#2a3142]">
                <ComposerSkeleton composer={replyComposer} autoFocus />
            </div>
        )}

        {/* Thread Navigation - Canon: all assertions can be thread origins */}
        <Link
          to="/thread/$assertionId"
          params={{ assertionId: item.assertionId }}
          className="mt-3 text-[13px] text-[#6b7280] hover:text-[#3b82f6] transition-colors inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/50 rounded"
        >
          View thread
        </Link>
      </div>
    </article>
  );
}
