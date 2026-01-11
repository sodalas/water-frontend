/**
 * Thread Page with Full Interaction Surface
 *
 * - Thread root clearly distinguished from replies
 * - Reply affordances with proper targeting
 * - Edit/Delete with permission checks and confirmation
 * - Visual hierarchy for nested replies
 */

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "@tanstack/react-router";
import type { FeedItemView } from "../components/feed/types";
import { authClient } from "../lib/auth-client";
import { getUserRole, canEdit, canDelete } from "../domain/permissions/UserRole";
import { PostActionMenu } from "../components/PostActionMenu";
import { Tooltip } from "../components/Tooltip";
import { ReplyComposer } from "../components/ReplyComposer";
import { useReplyComposer } from "../domain/feed/useReplyComposer";

type ThreadStatus = "idle" | "loading" | "ready" | "error" | "not_found";

interface ThreadData {
  root: FeedItemView;
  responses: FeedItemView[];
  count: number;
}

export function ThreadPage() {
  const { assertionId } = useParams({ from: "/thread/$assertionId" });
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  const viewerId = session?.user?.id ?? "";
  const viewerRole = getUserRole(session);
  const isAuthenticated = !!viewerId;

  const [status, setStatus] = useState<ThreadStatus>("idle");
  const [thread, setThread] = useState<ThreadData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeReplyTarget, setActiveReplyTarget] = useState<string | null>(null);

  // Reply composer
  const replyComposer = useReplyComposer({
    parentId: activeReplyTarget ?? "",
    onSuccess: () => {
      setActiveReplyTarget(null);
      // Refresh thread data
      fetchThread();
    },
  });

  const fetchThread = async () => {
    if (!assertionId) return;

    setStatus("loading");
    setError(null);

    try {
      const res = await fetch(`/api/thread/${assertionId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 404) {
          setStatus("not_found");
          return;
        }
        throw new Error("Failed to load thread");
      }

      const data = await res.json();
      setThread(data);
      setStatus("ready");
    } catch (err: any) {
      console.error("Thread load error:", err);
      setError(err.message);
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchThread();
  }, [assertionId]);

  // Handle edit navigation
  const handleEdit = (itemId: string) => {
    // Navigate to edit mode (implementation depends on your edit flow)
    // For now, navigate to home with edit state
    navigate({ to: "/app", search: { edit: itemId } });
  };

  // Handle delete
  const handleDelete = async (itemId: string) => {
    try {
      const res = await fetch(`/api/assertions/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      // If deleted root, go back to feed
      if (itemId === assertionId) {
        navigate({ to: "/app" });
      } else {
        // Refresh thread
        fetchThread();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (status === "idle" || status === "loading") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-36 bg-surface-highlight/60 rounded-2xl" />
          <div className="h-px bg-surface-highlight/40" />
          <div className="h-28 bg-surface-highlight/40 rounded-2xl" />
          <div className="h-28 bg-surface-highlight/40 rounded-2xl" />
        </div>
      </main>
    );
  }

  if (status === "not_found") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Thread Not Found</h1>
        <p className="text-text-muted mb-8">
          This thread may have been deleted or is not visible to you.
        </p>
        <Link to="/app" className="text-brand-primary hover:text-brand-light">
          Return to Feed
        </Link>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Error Loading Thread</h1>
        <p className="text-text-muted mb-8">{error}</p>
        <Link to="/app" className="text-brand-primary hover:text-brand-light">
          Return to Feed
        </Link>
      </main>
    );
  }

  if (!thread) return null;

  const { root, responses } = thread;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      {/* Back link */}
      <Link
        to="/app"
        className="inline-flex items-center gap-2 text-text-muted hover:text-white mb-8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14] rounded-sm"
      >
        <span aria-hidden="true">&larr;</span>
        <span>Back to Feed</span>
      </Link>

      {/* Thread Root - Distinguished styling */}
      <ThreadItem
        item={root}
        isRoot
        viewerId={viewerId}
        viewerRole={viewerRole}
        isAuthenticated={isAuthenticated}
        isReplyActive={activeReplyTarget === root.assertionId}
        onReplyToggle={() =>
          setActiveReplyTarget(
            activeReplyTarget === root.assertionId ? null : root.assertionId
          )
        }
        replyComposer={activeReplyTarget === root.assertionId ? replyComposer : null}
        onEdit={() => handleEdit(root.assertionId)}
        onDelete={() => handleDelete(root.assertionId)}
      />

      {/* Responses Section */}
      {responses.length > 0 && (
        <div className="mt-8">
          <div className="text-sm text-text-muted/80 mb-5 flex items-center gap-3">
            <span className="w-8 border-t border-surface-highlight/60" aria-hidden="true" />
            <span className="font-medium">
              {responses.length} {responses.length === 1 ? "reply" : "replies"}
            </span>
            <span className="flex-1 border-t border-surface-highlight/60" aria-hidden="true" />
          </div>

          <div className="space-y-4 border-l-2 border-surface-highlight/50 pl-5 ml-1">
            {responses.map((response) => (
              <ThreadItem
                key={response.assertionId}
                item={response}
                isRoot={false}
                viewerId={viewerId}
                viewerRole={viewerRole}
                isAuthenticated={isAuthenticated}
                isReplyActive={activeReplyTarget === response.assertionId}
                onReplyToggle={() =>
                  setActiveReplyTarget(
                    activeReplyTarget === response.assertionId
                      ? null
                      : response.assertionId
                  )
                }
                replyComposer={
                  activeReplyTarget === response.assertionId ? replyComposer : null
                }
                onEdit={() => handleEdit(response.assertionId)}
                onDelete={() => handleDelete(response.assertionId)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state for threads with no replies */}
      {responses.length === 0 && (
        <div className="mt-10 text-center">
          <div
            className="size-12 rounded-full bg-surface-highlight/30 flex items-center justify-center mx-auto mb-4"
            aria-hidden="true"
          >
            <svg
              className="size-6 text-text-muted/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
          </div>
          <p className="text-text-muted/80 text-sm">No replies yet.</p>
          {isAuthenticated && (
            <p className="text-text-muted/60 text-xs mt-1">Be the first to reply!</p>
          )}
        </div>
      )}
    </main>
  );
}

/**
 * Thread Item with full interaction surface
 */
interface ThreadItemProps {
  item: FeedItemView;
  isRoot: boolean;
  viewerId: string;
  viewerRole: ReturnType<typeof getUserRole>;
  isAuthenticated: boolean;
  isReplyActive: boolean;
  onReplyToggle: () => void;
  replyComposer: ReturnType<typeof useReplyComposer> | null;
  onEdit: () => void;
  onDelete: () => void;
}

function ThreadItem({
  item,
  isRoot,
  viewerId,
  viewerRole,
  isAuthenticated,
  isReplyActive,
  onReplyToggle,
  replyComposer,
  onEdit,
  onDelete,
}: ThreadItemProps) {
  const name = item.author.displayName ?? item.author.handle ?? item.author.id;
  const handle = item.author.handle
    ? item.author.handle.startsWith("@")
      ? item.author.handle.slice(1)
      : item.author.handle
    : null;

  // Permission checks
  const canEditItem = canEdit(viewerId, item.author.id, viewerRole);
  const canDeleteItem = canDelete(viewerId, item.author.id, viewerRole);

  // Phase D.1: Determine disabled reasons for non-authenticated users
  const editDisabledReason = !isAuthenticated
    ? "Sign in to edit"
    : !canEditItem
    ? "Only the author can edit"
    : undefined;

  const deleteDisabledReason = !isAuthenticated
    ? "Sign in to delete"
    : !canDeleteItem
    ? "Only the author can delete"
    : undefined;

  const replyDisabledReason = !isAuthenticated ? "Sign in to reply" : undefined;

  const isPublishing = replyComposer?.status === "publishing";

  return (
    <article
      className={`
        bg-surface-dark border rounded-2xl p-5 flex gap-4 transition-colors
        ${isRoot
          ? "border-brand-primary/30 shadow-lg shadow-brand-primary/5"
          : "border-surface-highlight/60 hover:border-surface-highlight"
        }
      `}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {item.author.avatarUrl ? (
          <img
            src={item.author.avatarUrl}
            alt={name}
            className={`rounded-full object-cover ${isRoot ? "size-12 ring-2 ring-brand-primary/20" : "size-10 ring-1 ring-surface-highlight/50"}`}
          />
        ) : (
          <div
            className={`rounded-full bg-surface-highlight ${
              isRoot ? "size-12 ring-2 ring-brand-primary/20" : "size-10 ring-1 ring-surface-highlight/50"
            }`}
          />
        )}
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center gap-2 mb-1">
          <span className={`font-semibold text-white truncate ${isRoot ? "text-lg" : ""}`}>
            {name}
          </span>
          {handle && (
            <span className="text-sm text-text-muted truncate">@{handle}</span>
          )}
          <span className="text-xs text-text-muted/60">·</span>
          <time className="text-sm text-text-muted/80 whitespace-nowrap">
            {item.createdAt}
          </time>

          {/* Action menu */}
          <div className="ml-auto">
            <PostActionMenu
              canEdit={canEditItem}
              canDelete={canDeleteItem}
              onEdit={onEdit}
              onDelete={onDelete}
              editDisabledReason={editDisabledReason}
              deleteDisabledReason={deleteDisabledReason}
            />
          </div>
        </header>

        {/* Root indicator */}
        {isRoot && (
          <div className="text-xs text-brand-primary/90 mb-2 font-medium tracking-wide uppercase">
            Thread
          </div>
        )}

        {/* Text */}
        {item.text && (
          <p className={`text-text-body leading-relaxed whitespace-pre-wrap ${
            isRoot ? "text-base mt-1" : "text-sm mt-1"
          }`}>
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
          {/* Reply button with tooltip for disabled state */}
          {replyDisabledReason ? (
            <Tooltip content={replyDisabledReason}>
              <button
                disabled
                className="text-sm text-text-muted/40 cursor-not-allowed"
              >
                Reply
              </button>
            </Tooltip>
          ) : (
            <button
              onClick={onReplyToggle}
              disabled={isPublishing}
              className="text-sm text-text-muted hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-dark rounded-sm"
            >
              {isReplyActive ? "Cancel" : "Reply"}
            </button>
          )}
        </footer>

        {/* Reply composer */}
        {isReplyActive && replyComposer && (
          <div className="mt-4 pt-4 border-t border-surface-highlight/50">
            <ReplyComposer composer={replyComposer} autoFocus />
          </div>
        )}
      </div>
    </article>
  );
}
