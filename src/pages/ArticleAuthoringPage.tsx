// import { useMemo } from "react";
import { useComposer } from "../domain/composer/useComposer";
import { authClient } from "../lib/auth-client";
import { ArticleComposer } from "../components/ArticleComposer";

export function ArticleAuthoringPage() {
  const { data: session } = authClient.useSession();
  const viewerId = session?.user.id ?? null;

  // Use the shared composer hook. 
  // Draft scoping: "Single draft slot per user".
  // So this loads the same draft as Home. 
  // If user switches context, they see the same content (which satisfies "Memory").
  const composer = useComposer(viewerId || "");

  // Wrap publish to ensure it knows it's an article
  // const wrappedComposer = useMemo(() => {
  //     // We don't strictly *need* to wrap since ArticleComposer calls publish with { articleTitle: ... }
  //     // But we can ensure clearDraft defaults if we want.
  //     return {
  //         ...composer,
  //         // We can just pass composer down directly if ArticleComposer handles the args
  //     };
  // }, [composer]);

  if (!viewerId) return null; // Or redirect/loading

  return (
    <div className="min-h-screen bg-bg-canvas text-text-primary">
      <ArticleComposer composer={composer} />
    </div>
  );
}
