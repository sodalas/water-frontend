import type { useComposer } from "../domain/composer/useComposer";

type Composer = ReturnType<typeof useComposer>;

export function ComposerSkeleton({ composer }: { composer: Composer }) {
  return (
    <div style={{ padding: "1rem", borderBottom: "1px solid #333" }}>
      <textarea
        value={composer.text}
        onChange={(e) => composer.setText(e.target.value)}
        placeholder="What's happening?"
        disabled={composer.status === "publishing"}
        style={{ width: "100%", height: "80px", marginBottom: "0.5rem", display: "block" }}
      />
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          {composer.status === "error" && (
            <span style={{ color: "red", fontSize: "0.875rem" }}>
              {composer.error || "Error publishing"}
            </span>
          )}
          {composer.status === "success" && (
            <span style={{ color: "green", fontSize: "0.875rem" }}>
              Posted!
            </span>
          )}
        </div>
        
        <button 
          type="button" 
          onClick={() => composer.publish()}
          disabled={composer.status === "publishing" || !composer.text.trim()}
        >
          {composer.status === "publishing" ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}
