// HomeFeedPage.tsx
import { useEffect, useMemo, useState } from "react";
import { HomeFeedAdapter } from "../domain/feed/HomeFeedAdapter";
import { HomeFeedContainer } from "../components/HomeFeedContainer.tsx";
import { useHomeFeed } from "../domain/feed/useHomeFeed";
import { useComposer } from "../domain/composer/useComposer";
import { ComposerSkeleton } from "../components/ComposerSkeleton";
import { authClient } from "../lib/auth-client";
import { getUserRole } from "../domain/permissions/UserRole";
import { notifyConflict } from "../domain/notifications/notifyConflict";
import { setSentryUser, captureError, addBreadcrumb } from "../components/SentryErrorBoundary";

export function HomeFeedPage() {
  const { data: session, isLoading, isPending } = authClient.useSession();

  // All hooks must be called unconditionally before any early returns
  const viewerId = session?.user?.id ?? "";
  const viewerRole = getUserRole(session); // Phase C: Get user role for permission gating

  // Adapter is created once per page lifecycle
  const adapter = useMemo(() => {
    return new HomeFeedAdapter();
  }, []);

  const { status, items, error, refresh, prepend, addResponse, removeItem } = useHomeFeed(adapter, viewerId);
  const mainComposer = useComposer(viewerId);
  const replyComposer = useComposer(viewerId);

  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [revisingId, setRevisingId] = useState<string | null>(null); // Phase B3.4-B: Track revision target

  // Phase C Hardening: Clear revision state on viewer change
  useEffect(() => {
    setRevisingId(null);
  }, [viewerId]);

  // Phase E.0: Set Sentry user context when session changes
  useEffect(() => {
    if (session?.user) {
      setSentryUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      });
    } else {
      setSentryUser(null);
    }
  }, [session?.user]);

  // Main Composer: Optimistic Prepend + Revision Support + 409 Conflict Handling
  const wrappedMainComposer = useMemo(() => {
    return {
      ...mainComposer,
      publish: async () => {
        const supersededId = revisingId; // Capture for optimistic removal
        try {
          const item = await mainComposer.publish(session?.user, {
            clearDraft: true,
            supersedesId: supersededId || undefined, // Phase B3.4-B: Include revision target
          });
          if (item) {
            prepend(item);
            // Phase C Hardening: Optimistically remove superseded assertion by exact ID
            if (supersededId) {
              removeItem(supersededId);
            }
            setRevisingId(null); // Clear revision state after publish
          }
          refresh(); // Refresh to remove old version
          return item;
        } catch (error: any) {
          // Phase C: Handle 409 Conflict for revisions
          if (error.status === 409 || (error.message && error.message.includes("already been revised"))) {
            notifyConflict("This post has already been edited or deleted.");
            setRevisingId(null); // Clear revision state
            refresh(); // Refresh to show current state
            throw error;
          }
          throw error;
        }
      }
    };
  }, [mainComposer, prepend, removeItem, session?.user, revisingId, refresh]);

  // Reply Composer: Optimistic Response + Close on success
  const wrappedReplyComposer = useMemo(() => {
    return {
      ...replyComposer,
      publish: async () => {
        if (!activeReplyId) return null;

        // Opt-in to "tweet" behavior: clear draft after publish
        const item = await replyComposer.publish(session?.user, { replyTo: activeReplyId, clearDraft: true });
        if (item) {
            addResponse(activeReplyId, item);
            setActiveReplyId(null);
        }
        return item;
      }
    };
  }, [replyComposer, activeReplyId, addResponse, session?.user]);

  // Invariant 1: Auth presence on protected route
  // Wait for session to load (route guard ensures it exists)
  if (isLoading || isPending || !session) {
    return <div>Loading...</div>;
  }

  if (!viewerId) {
    throw new Error("Invariant violation: authenticated route without viewerId");
  }

  // 🟥 Initial Load now handled automatically by useHomeFeed hook
  // (See FEED INITIAL FETCH DIRECTIVE in useHomeFeed.ts)

  const handleRefresh = () => {
    refresh();
  };

  const handleItemPress = (assertionId: string) => {
    console.log("Navigate to assertion:", assertionId);
  };

  const handleAuthorPress = (authorId: string) => {
    console.log("Navigate to author:", authorId);
  };

  // Phase B3.4-B: Minimal revise flow
  const handleEdit = async (assertionId: string) => {
    console.log("[Phase B3.4-B] Revising assertion:", assertionId);

    try {
      // Find the assertion in the feed
      const assertion = items.find(item => item.assertionId === assertionId);
      if (!assertion) {
        alert("Assertion not found in feed");
        return;
      }

      // Phase C Hardening: Prefill main composer with existing content, preserving provenance
      await mainComposer.replaceDraft({
        text: assertion.text,
        media: assertion.media || [],
        // Preserve originPublicationId if present (provenance preservation)
        originPublicationId: (assertion as any).originPublicationId,
      });

      // Set revision target
      setRevisingId(assertionId);

      // Scroll to top to show composer
      window.scrollTo({ top: 0, behavior: 'smooth' });

      console.log("[Phase B3.4-B] Composer prefilled for revision");
    } catch (error) {
      console.error("[Phase B3.4-B] Revise failed:", error);
      alert(`Failed to load for revision: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Phase C: Delete via DELETE endpoint (creates tombstone on backend)
  const handleDelete = async (assertionId: string) => {
    if (!confirm("Delete this post? This action cannot be undone.")) {
      return;
    }

    // Phase E.0: Add breadcrumb for delete attempt
    addBreadcrumb("feed", "Starting delete", { assertionId, viewerId });

    try {
      const response = await fetch(`/api/assertions/${assertionId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to delete" }));

        // Phase C: Handle 409 Conflict (assertion already revised/deleted)
        if (response.status === 409) {
          notifyConflict("This post has already been edited or deleted.");
          refresh(); // Refresh to show current state
          return;
        }

        throw new Error(error.error || "Failed to delete assertion");
      }

      console.log("[Phase C] Deleted assertion via tombstone:", assertionId);
      // Feed refresh will automatically hide tombstone (projection filters it)
      refresh();
    } catch (error) {
      console.error("[Phase C] Delete failed:", error);
      // Phase E.0: Capture delete errors to Sentry
      if (error instanceof Error) {
        captureError(error, {
          operation: "delete",
          assertionId,
          route: "/api/assertions/:id",
        });
      }
      alert(`Failed to delete: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-6" aria-label="Home feed page">
      {/* Composer */}
      <div className="mb-4">
        <ComposerSkeleton
          composer={wrappedMainComposer}
          avatarUrl={session?.user?.image}
        />
      </div>

      {/* Feed */}
      <HomeFeedContainer
        status={status}
        items={items}
        viewerId={viewerId}
        viewerRole={viewerRole}
        error={error}
        onRetry={refresh}
        onItemPress={handleItemPress}
        onAuthorPress={handleAuthorPress}
        activeReplyId={activeReplyId}
        onActiveReplyIdChange={setActiveReplyId}
        replyComposer={wrappedReplyComposer}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </main>
  );
}
