// HomeFeedPage.tsx
import { useEffect, useMemo } from "react";
import { HomeFeedAdapter } from "../domain/feed/HomeFeedAdapter";
import { HomeFeedContainer } from "../components/HomeFeedContainer.tsx";
import { useHomeFeed } from "../domain/feed/useHomeFeed";

export function HomeFeedPage() {
  const viewerId = "demo-user";

  // Adapter is created once per page lifecycle
  const adapter = useMemo(() => {
    return new HomeFeedAdapter();
  }, []);

  const { status, items, error, load, refresh } = useHomeFeed(adapter, viewerId);

  // Initial Load
  useEffect(() => {
    load();
  }, [load]);

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
