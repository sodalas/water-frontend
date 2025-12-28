// HomeFeedPage.tsx
import { useEffect, useMemo, useState } from "react";
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

  const { status, items, error, load, refresh, prepend, addResponse } = useHomeFeed(adapter, viewerId || ""); 
  const mainComposer = useComposer(viewerId || "");
  const replyComposer = useComposer(viewerId || "");
  
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  // Main Composer: Optimistic Prepend
  const wrappedMainComposer = useMemo(() => {
    return {
      ...mainComposer,
      publish: async () => {
        const item = await mainComposer.publish(session?.user);
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
        
        const item = await replyComposer.publish(session?.user, { replyTo: activeReplyId });
        if (item) {
          addResponse(activeReplyId, item);
          setActiveReplyId(null);
        }
        return item;
      }
    };
  }, [replyComposer, activeReplyId, addResponse, session?.user]);

  // Initial Load
  useEffect(() => {
    if (viewerId) load();
  }, [load, viewerId]);

  const handleRefresh = () => {
    refresh();
  };

  const handleItemPress = (assertionId: string) => {
    console.log("Navigate to assertion:", assertionId);
  };

  const handleAuthorPress = (authorId: string) => {
    console.log("Navigate to author:", authorId);
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
      />
    </main>
  );
}
