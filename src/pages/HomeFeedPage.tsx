// HomeFeedPage.tsx
import { useEffect, useMemo } from "react";
import { HomeFeedAdapter } from "../domain/feed/HomeFeedAdapter";
import { HomeFeedContainer } from "../components/HomeFeedContainer.tsx";
import { useHomeFeed } from "../domain/feed/useHomeFeed";
import { authClient } from "../lib/auth-client";

export function HomeFeedPage() {
  const { data: session } = authClient.useSession();
  const viewerId = session?.user.id ?? null;

  // Adapter is created once per page lifecycle
  const adapter = useMemo(() => {
    return new HomeFeedAdapter();
  }, []);

  const { status, items, error, load, refresh } = useHomeFeed(adapter, viewerId || ""); 
  // Hook expects string. Logic: if !viewerId, hook returns idle.
  // Wait, hook takes string. passing "" if null is safe for my hook logic (if (!viewerId) return).

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
      <button type="button" onClick={handleRefresh}>
        Refresh
      </button>

      <HomeFeedContainer
        status={status}
        items={items}
        error={error}
        onRetry={refresh}
        onItemPress={handleItemPress}
        onAuthorPress={handleAuthorPress}
      />
    </main>
  );
}
