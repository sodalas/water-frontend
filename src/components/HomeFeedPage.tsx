// HomeFeedPage.tsx
import React, { useEffect, useMemo } from "react";
import { HomeFeedAdapter } from "../domain/feed/HomeFeedAdapter";
import { HomeFeedContainer } from "../components/HomeFeedContainer";

export function HomeFeedPage() {
  // Adapter is created once per page lifecycle
  const adapter = useMemo(() => {
    return new HomeFeedAdapter();
  }, []);

  // Explicit lifecycle ownership
  useEffect(() => {
    adapter.fetch();
  }, [adapter]);

  const handleRefresh = () => {
    adapter.refresh();
  };

  const handleItemPress = (assertionId: string) => {
    // Navigation logic belongs here (or higher)
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
        adapter={adapter}
        onItemPress={handleItemPress}
        onAuthorPress={handleAuthorPress}
      />
    </main>
  );
}
