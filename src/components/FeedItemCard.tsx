// FeedItemCard now uses FeedItemView
import type { FeedItemView } from "./feed/types";

export function FeedItemCard({ item }: { item: FeedItemView }) {
  return (
    <article
      className="
        bg-surface-dark border border-surface-highlight
        rounded-2xl p-5
        flex gap-4
      "
    >
      {/* Avatar */}
      <div className="shrink-0">
        {item.avatarUrl ? (
          <img
            src={item.avatarUrl}
            alt={item.authorName}
            className="size-11 rounded-full object-cover"
          />
        ) : (
          <div className="size-11 rounded-full bg-surface-highlight" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-white truncate">
            {item.authorName}
          </span>
          <span className="text-sm text-text-muted truncate">
            @{item.authorHandle}
          </span>
          <span className="text-sm text-text-muted">·</span>
          <time className="text-sm text-text-muted whitespace-nowrap">
            {item.createdAt}
          </time>
        </header>

        {/* Text */}
        {item.text && (
          <p className="text-text-body leading-relaxed whitespace-pre-wrap mb-3">
            {item.text}
          </p>
        )}

        {/* Media */}
        {item.media?.length ? (
          <div className="mt-2 space-y-3">
            {item.media.map((m, i) => {
              if (m.type === "image") {
                return (
                  <img
                    key={i}
                    src={m.src}
                    alt={m.title ?? ""}
                    className="
                      w-full rounded-xl
                      border border-surface-highlight
                      object-cover
                    "
                  />
                );
              }

              if (m.type === "link") {
                return (
                  <a
                    key={i}
                    href={m.src}
                    className="
                      block p-4 rounded-xl
                      bg-surface-highlight/30
                      border border-surface-highlight
                      hover:bg-surface-highlight/50
                      transition
                    "
                  >
                    <div className="text-sm font-medium text-white truncate">
                      {m.title ?? m.domain ?? m.src}
                    </div>
                    {m.domain && (
                      <div className="text-xs text-text-muted mt-1">
                        {m.domain}
                      </div>
                    )}
                  </a>
                );
              }

              return null;
            })}
          </div>
        ) : null}

        {/* Footer actions (placeholder) */}
        <footer className="mt-4">
          <div className="size-5 rounded bg-surface-highlight/60" />
        </footer>
      </div>
    </article>
  );
}
