/**
 * Thread Page with Full Interaction Surface (Canon-Aligned)
 *
 * Canon compliance:
 * - No client-derived counts (removed reply count display)
 * - isThreadOrigin naming reflects thread structure, not hierarchy
 * - All assertions in thread expose identical interaction surface
 */

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import type { FeedItemView } from "../components/feed/types";
import { authClient } from "../lib/auth-client";
import { getUserRole, canEdit, canDelete } from "../domain/permissions/UserRole";
import { PostActionMenu } from "../components/PostActionMenu";
import { Tooltip } from "../components/Tooltip";
import { ReactionBar } from "../components/ReactionBar";
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
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-[#242938] rounded-xl" />
          <div className="h-24 bg-[#1e2330] rounded-xl" />
          <div className="h-24 bg-[#1e2330] rounded-xl" />
        </div>
      </main>
    );
  }

  if (status === "not_found") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12 text-center">
        <h1 className="text-xl font-bold text-white mb-3">Thread Not Found</h1>
        <p className="text-[#6b7280] mb-6">
          This thread may have been deleted or is not visible to you.
        </p>
        <Link to="/app" className="text-[#3b82f6] hover:text-[#60a5fa]">
          Return to Feed
        </Link>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12 text-center">
        <h1 className="text-xl font-bold text-white mb-3">Error Loading Thread</h1>
        <p className="text-[#6b7280] mb-6">{error}</p>
        <Link to="/app" className="text-[#3b82f6] hover:text-[#60a5fa]">
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
        className="inline-flex items-center gap-2 text-[#6b7280] hover:text-white mb-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/50 rounded"
      >
        <span aria-hidden="true">&larr;</span>
        <span>Back to Feed</span>
      </Link>

      {/* Thread Root - Distinguished styling */}
      <ThreadItem
        item={root}
        isThreadOrigin
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

      {/* Responses Section - Canon: no client-derived counts */}
      {responses.length > 0 && (
        <div className="mt-6">
          <div className="text-[13px] text-[#6b7280] mb-4 flex items-center gap-3">
            <span className="w-6 border-t border-[#2a3142]" aria-hidden="true" />
            <span>Replies</span>
            <span className="flex-1 border-t border-[#2a3142]" aria-hidden="true" />
          </div>

          <div className="space-y-3 border-l border-[#2a3142] pl-4 ml-1">
            {responses.map((response) => (
              <ThreadItem
                key={response.assertionId}
                item={response}
                isThreadOrigin={false}
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
        <div className="mt-8 text-center">
          <div
            className="size-10 rounded-full bg-[#242938] flex items-center justify-center mx-auto mb-3"
            aria-hidden="true"
          >
            <svg
              className="size-5 text-[#4b5563]"
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
          <p className="text-[#6b7280] text-sm">No replies yet.</p>
          {isAuthenticated && (
            <p className="text-[#4b5563] text-xs mt-1">Be the first to reply!</p>
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
  isThreadOrigin: boolean;
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
  isThreadOrigin,
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

  // Determine disabled reasons for non-authenticated users
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
        bg-[#1a1f2e] border rounded-xl p-4 flex gap-3
        ${isThreadOrigin
          ? "border-[#3b82f6]/30"
          : "border-[#2a3142]"
        }
      `}
    >
      {/* Avatar — same size for all items (no visual privilege) */}
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
          <span className="font-semibold text-white text-[15px] truncate">
            {name}
          </span>
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
              canEdit={canEditItem}
              canDelete={canDeleteItem}
              onEdit={onEdit}
              onDelete={onDelete}
              editDisabledReason={editDisabledReason}
              deleteDisabledReason={deleteDisabledReason}
            />
          </div>
        </header>

        {/* Root indicator - removed for cleaner look like screenshot */}

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
          {/* Reply button with tooltip for disabled state */}
          {replyDisabledReason ? (
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
              onClick={onReplyToggle}
              disabled={isPublishing}
              className="text-[#6b7280] hover:text-[#3b82f6] transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/50 rounded"
              aria-label={isReplyActive ? "Cancel reply" : "Reply"}
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
              </svg>
            </button>
          )}

          {/* Phase 12: Reaction buttons — identical surface for all thread items */}
          <ReactionBar
            assertionId={item.assertionId}
            isAuthenticated={isAuthenticated}
            initialCounts={item.reactionCounts}
          />
        </footer>

        {/* Reply composer */}
        {isReplyActive && replyComposer && (
          <div className="mt-3 pt-3 border-t border-[#2a3142]">
            <ReplyComposer composer={replyComposer} autoFocus />
          </div>
        )}
      </div>
    </article>
  );
}
