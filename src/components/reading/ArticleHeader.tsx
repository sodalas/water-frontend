/**
 * ArticleHeader - Canonical header for reading pages
 *
 * Includes:
 * - Title (font-ui, text-title, tracking-tight)
 * - Optional dek/subtitle
 * - Meta information (author, date, reading time)
 */

interface ArticleHeaderProps {
  title: string;
  dek?: string;
  author?: string;
  publishedAt?: string;
  readingTime?: string;
}

export function ArticleHeader({
  title,
  dek,
  author,
  publishedAt,
  readingTime,
}: ArticleHeaderProps) {
  return (
    <header>
      <h1 className="font-ui text-title tracking-tight mb-3">
        {title}
      </h1>

      {dek && (
        <p className="font-ui text-dek text-reading-muted mb-8">
          {dek}
        </p>
      )}

      {(author || publishedAt || readingTime) && (
        <div className="flex items-center gap-3 font-ui text-meta text-reading-faint mb-8">
          {author && <span>{author}</span>}
          {author && (publishedAt || readingTime) && <span>·</span>}
          {publishedAt && <time>{publishedAt}</time>}
          {publishedAt && readingTime && <span>·</span>}
          {readingTime && <span>{readingTime}</span>}
        </div>
      )}
    </header>
  );
}
