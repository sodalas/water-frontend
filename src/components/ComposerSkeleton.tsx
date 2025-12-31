import type { useComposer } from "../domain/composer/useComposer";

type Composer = ReturnType<typeof useComposer>;

export function ComposerSkeleton({ composer, autoFocus }: { composer: Composer; autoFocus?: boolean }) {
  return (
    <div style={{ padding: "1rem", borderBottom: "1px solid #333" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.75rem", color: "#888" }}>
        <div style={{ display: "flex", gap: "1rem" }}>
          {/* Draft Restored Indicator */}
          {composer.isRestored && (
            <span style={{ color: "#4ade80" }}>Draft restored</span>
          )}

          {/* Revision Context */}
          {!composer.isRestored && composer.draft.originPublicationId && (
             <span style={{ color: "#60a5fa" }}>Revising published note</span>
          )}
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
           {/* Save State (Error hidden per directive) */}
           {composer.saveStatus === "saving" && <span>Saving...</span>}
           {composer.saveStatus === "saved" && <span>Saved</span>}
           
           {/* Explicit Clear */}
           <button
             type="button"
             onClick={() => {
                if(window.confirm("This will permanently delete your draft.")) {
                    composer.clear();
                }
             }}
             style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 0 }}
           >
             Clear
           </button>
        </div>
      </div>

      <textarea
        autoFocus={autoFocus}
        value={composer.draft.text}
        onChange={(e) => composer.setText(e.target.value)}
        placeholder="What's happening?"
        disabled={composer.status === "publishing"}
        style={{ width: "100%", height: "80px", marginBottom: "0.5rem", display: "block" }}
      />
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {/* Media Actions */}
          <button
            type="button"
            onClick={() => {
                const url = prompt("Enter image URL");
                if (url) composer.addMedia({ type: "image", src: url });
            }}
            disabled={composer.status === "publishing"}
            style={{ fontSize: "0.875rem", color: "#ccc" }}
          >
            Add Image
          </button>
          
           <button
            type="button"
            onClick={() => {
                const url = prompt("Enter link URL");
                if (url) composer.addMedia({ type: "link", src: url });
            }}
            disabled={composer.status === "publishing"}
            style={{ fontSize: "0.875rem", color: "#ccc" }}
          >
            Add Link
          </button>

          {composer.status === "error" && (
            <span style={{ color: "red", fontSize: "0.875rem", marginLeft: "8px" }}>
              {composer.error || "Error publishing"}
            </span>
          )}
          {composer.status === "success" && (
            <span style={{ color: "green", fontSize: "0.875rem", marginLeft: "8px" }}>
              Posted!
            </span>
          )}
        </div>
        
        <button 
          type="button" 
          onClick={() => composer.publish()}
          disabled={composer.status === "publishing" || (!composer.draft.text.trim() && (composer.draft.media.length === 0))}
        >
          {composer.status === "publishing" ? "Posting..." : "Post"}
        </button>
      </div>
      
      {/* Media Previews */}
      {composer.draft.media && composer.draft.media.length > 0 && (
          <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {composer.draft.media.map((m: any) => (
                  <div key={m.id} style={{ position: "relative", width: "60px", height: "60px", background: "#333", borderRadius: "4px", overflow: "hidden" }}>
                      {m.type === "image" ? (
                          <img src={m.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                          <div style={{ padding: "4px", fontSize: "0.7rem", color: "#ccc" }}>Link</div>
                      )}
                      <button 
                        onClick={() => composer.removeMedia(m.id)}
                        style={{ position: "absolute", top: 0, right: 0, background: "rgba(0,0,0,0.5)", color: "white", border: "none", cursor: "pointer", padding: "0 4px" }}
                      >
                          &times;
                      </button>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
}
