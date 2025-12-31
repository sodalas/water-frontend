import { useComposer } from "../domain/composer/useComposer";
// import { ComposerSkeleton } from "./ComposerSkeleton"; // We might reuse parts or build fresh? 
// Directive says "MUST NOT reuse reading components... Authoring-only UI components".
// Plan says "NEW ArticleComposer.tsx - Dedicated UI".
// So we build fresh, maybe mimicking ComposerSkeleton's status bar but with different layout.

type ArticleComposerProps = {
  composer: ReturnType<typeof useComposer>;
};

export function ArticleComposer({ composer }: ArticleComposerProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Top Bar: Status + Actions */}
      <div className="flex justify-between items-center mb-8 font-sans text-sm text-text-muted">
         <div className="flex items-center gap-4">
            {/* Status Indicators from ComposerSkeleton logic */}
            {composer.isRestored && (
                <span className="text-green-400">Draft restored</span>
            )}
            {!composer.isRestored && composer.draft.originPublicationId && (
                <span className="text-blue-400">Revising published article</span>
            )}
            
            {/* Save Status */}
            {composer.saveStatus === "saving" && <span>Saving...</span>}
            {composer.saveStatus === "saved" && <span>Saved</span>}
         </div>

         <div className="flex items-center gap-4">
             <button
                type="button"
                className="text-red-500 hover:text-red-400 transition-colors"
                onClick={() => {
                    if (window.confirm("This will permanently delete your draft.")) {
                        composer.clear();
                    }
                }}
             >
                 Clear
             </button>
             
             <button
                type="button"
                disabled={composer.status === "publishing" || !composer.draft.title?.trim() || !composer.draft.text.trim()}
                onClick={() => composer.publish(undefined, { articleTitle: composer.draft.title })}
                className="bg-brand-primary text-white px-4 py-2 rounded-full font-medium disabled:opacity-50 hover:bg-opacity-90 transition-all"
             >
                 {composer.status === "publishing" ? "Publishing..." : "Publish"}
             </button>
         </div>
      </div>

      {/* Editor Canvas */}
      <div className="flex flex-col gap-6">
        {/* Title Input: H1 styling, Hybrid/Serif per desktop rule, but plan says "Structured Title input (H1-sized)" */}
        <input
            type="text"
            placeholder="Title"
            value={composer.draft.title || ""}
            onChange={(e) => composer.setTitle(e.target.value)}
            className="w-full bg-transparent text-4xl font-serif font-bold placeholder-text-muted/30 outline-none border-none p-0"
            autoFocus
        />
        
        {/* Body Input: Serif body */}
        <textarea
            placeholder="Tell your story..."
            value={composer.draft.text}
            onChange={(e) => composer.setText(e.target.value)}
            className="w-full min-h-[60vh] bg-transparent text-lg font-serif leading-relaxed placeholder-text-muted/30 outline-none border-none resize-none p-0"
        />
        
        {/* Error State */}
        {composer.status === "error" && (
            <div className="text-red-500 text-sm mt-4">
                {composer.error || "Failed to publish"}
            </div>
        )}
      </div>
    </div>
  );
}
