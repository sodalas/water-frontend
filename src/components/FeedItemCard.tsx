/**
 * FeedItemCard with Full Interaction Surface
 *
 * - Thread navigation for all root posts
 * - Reply affordances with proper targeting
 * - Edit/Delete with permission checks and explanations
 * - Visual distinction for responses
 */

import { Link } from "@tanstack/react-router";
import type { FeedItemView } from "./feed/types";
import { ComposerSkeleton } from "./ComposerSkeleton";
import { PostActionMenu } from "./PostActionMenu";
import { Tooltip } from "./Tooltip";
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
  const isResponse = item.assertionType === 'response';
  const replyCount = item.responses?.length ?? 0;
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
    <article className="bg-surface-dark border border-surface-highlight rounded-2xl p-5 flex gap-4 transition-colors hover:border-surface-highlight/80">
      {/* Avatar */}
      <div className="shrink-0">
        {item.author.avatarUrl ? (
          <img
            src={item.author.avatarUrl}
            alt={name}
            className="size-11 rounded-full object-cover ring-2 ring-surface-highlight/50"
          />
        ) : (
          <div className="size-11 rounded-full bg-surface-highlight ring-2 ring-surface-highlight/30" />
        )}
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-white truncate">{name}</span>

          {handle && (
            <span className="text-sm text-text-muted truncate">@{handle}</span>
          )}
          <span className="text-xs text-text-muted/60">·</span>
          <time className="text-sm text-text-muted/80 whitespace-nowrap">
            {item.createdAt}
          </time>

          {/* Action menu with permission explanations */}
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
          <p className="text-text-body leading-relaxed whitespace-pre-wrap mt-2">
            {item.text}
          </p>
        )}

        {/* Media */}
        {item.media?.length ? (
          <div className="mt-4 space-y-3">
            {item.media.map((m, i) => {
              if (m.type === "image") {
                return (
                  <img
                    key={i}
                    src={m.src}
                    alt={m.title ?? ""}
                    className="w-full rounded-xl border border-surface-highlight object-cover"
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
                    className="block p-4 rounded-xl bg-surface-highlight/20 border border-surface-highlight hover:bg-surface-highlight/40 transition-colors"
                  >
                    <div className="text-sm font-medium text-white truncate">
                      {m.title ?? m.domain ?? m.src}
                    </div>
                    {m.domain && (
                      <div className="text-xs text-text-muted/70 mt-1">
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
        <footer className="mt-5 pt-3 border-t border-surface-highlight/50 flex items-center gap-4">
            {/* Reply button with disabled state explanation */}
            {!isResponse && onActiveReplyIdChange && (
                replyDisabledReason ? (
                  <Tooltip content={replyDisabledReason}>
                    <button
                      disabled
                      className="text-sm text-text-muted/40 cursor-not-allowed"
                    >
                      Reply{replyCount > 0 ? ` (${replyCount})` : ''}
                    </button>
                  </Tooltip>
                ) : (
                  <button
                    onClick={() => onActiveReplyIdChange(isReplying ? null : item.assertionId)}
                    disabled={isPublishing}
                    className="text-sm text-text-muted hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-dark rounded-sm"
                  >
                    {isReplying ? "Cancel" : `Reply${replyCount > 0 ? ` (${replyCount})` : ''}`}
                  </button>
                )
            )}
        </footer>
        
        {isReplying && replyComposer && (
            <div className="mt-4 pt-4 border-t border-surface-highlight/50">
                <ComposerSkeleton composer={replyComposer} autoFocus />
            </div>
        )}

        {/* Thread Navigation - all roots link to thread view */}
        {!isResponse && (
            <div className="mt-4">
               <Link
                 to="/thread/$assertionId"
                 params={{ assertionId: item.assertionId }}
                 className="text-sm text-brand-primary hover:text-brand-light transition-colors inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-dark rounded-sm"
               >
                   {item.responses && item.responses.length > 0
                     ? `View thread (${item.responses.length} ${item.responses.length === 1 ? 'reply' : 'replies'})`
                     : 'View thread'}
                   <span aria-hidden="true">&rarr;</span>
               </Link>
            </div>
        )}
      </div>
    </article>
  );
}
