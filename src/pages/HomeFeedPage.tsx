// HomeFeedPage.tsx
import { useMemo, useState } from "react";
import { HomeFeedAdapter } from "../domain/feed/HomeFeedAdapter";
import { HomeFeedContainer } from "../components/HomeFeedContainer.tsx";
import { useHomeFeed } from "../domain/feed/useHomeFeed";
import { useComposer } from "../domain/composer/useComposer";
import { ComposerSkeleton } from "../components/ComposerSkeleton";
import { authClient } from "../lib/auth-client";

export function HomeFeedPage() {
  const { data: session } = authClient.useSession();
  const viewerId = session?.user.id ?? null;

  // Adapter is created once per page lifecycle
  const adapter = useMemo(() => {
    return new HomeFeedAdapter();
  }, []);

  const { status, items, error, refresh, prepend, addResponse } = useHomeFeed(adapter, viewerId || ""); 
  const mainComposer = useComposer(viewerId || "");
  const replyComposer = useComposer(viewerId || "");
  
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  // Main Composer: Optimistic Prepend
  const wrappedMainComposer = useMemo(() => {
    return {
      ...mainComposer,
      publish: async () => {
        // Opt-in to "tweet" behavior: clear draft after publish ONLY if not revising
        // If revising, we retain the draft to allow for further edits loop.
        const isRevising = !!mainComposer.draft.originPublicationId;
        const item = await mainComposer.publish(session?.user, { clearDraft: !isRevising });
        if (item) {
          prepend(item);
        }
        return item;
      }
    };
  }, [mainComposer, prepend, session?.user]);

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

  // Initial Load handled internally by useComposer now.
  // useEffect(() => {
  //   if (viewerId) load();
  // }, [load, viewerId]);

  const handleRefresh = () => {
    refresh();
  };

  const handleItemPress = (assertionId: string) => {
    console.log("Navigate to assertion:", assertionId);
  };

  const handleAuthorPress = (authorId: string) => {
    console.log("Navigate to author:", authorId);
  };

  // Revise Flow: Fork publication into draft
  const handleRevise = async (item: any) => {
    // We only support revising notes for now (text/media)
    const draft = {
        text: item.text ?? "",
        media: item.media ?? [],
        originPublicationId: item.assertionId
    };
    await mainComposer.replaceDraft(draft);
    
    // Scroll to top to see composer (simple implementation)
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Focus logic would ideally go here if we exposed a ref
  };

  return (
    <main aria-label="Home feed page">
      <ComposerSkeleton composer={wrappedMainComposer} />
      
      <button type="button" onClick={handleRefresh}>
        Refresh
      </button>

      <HomeFeedContainer
        status={status}
        items={items}
        viewerId={viewerId || undefined}
        error={error}
        onRetry={refresh}
        onItemPress={handleItemPress}
        onAuthorPress={handleAuthorPress}
        activeReplyId={activeReplyId}
        onActiveReplyIdChange={setActiveReplyId}
        replyComposer={wrappedReplyComposer}
        onRevise={handleRevise}
      />
    </main>
  );
}
