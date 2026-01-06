/**
 * ArticleBody - Canonical article body container
 *
 * Enforces locked reading rhythm via Tailwind arbitrary variants:
 * - Paragraph spacing: mb-[1.05em]
 * - Heading spacing: mt-[1.6em] mb-[0.55em]
 * - Link styles: underline with hover state
 * - Blockquote, pre, code formatting
 * - List styles: ul, ol, li
 * - Inline code formatting
 *
 * 🟥 INVARIANT: rhythm > density, semantic headings only, no inline widgets
 */

interface ArticleBodyProps {
  children: React.ReactNode;
}

export function ArticleBody({ children }: ArticleBodyProps) {
  return (
    <div
      className="
        font-body text-body
        [&>p]:mb-[1.05em]
        [&>h2]:font-ui [&>h2]:text-h2 [&>h2]:mt-[1.6em] [&>h2]:mb-[0.55em]
        [&>h3]:font-ui [&>h3]:text-h3 [&>h3]:mt-[1.4em] [&>h3]:mb-[0.5em]
        [&>a]:underline [&>a]:underline-offset-2
        [&>a:hover]:text-reading-linkHover
        [&>blockquote]:my-8 [&>blockquote]:pl-6 [&>blockquote]:border-l-4 [&>blockquote]:border-reading-border [&>blockquote]:text-reading-muted
        [&>pre]:my-8 [&>pre]:rounded-xl [&>pre]:border [&>pre]:border-reading-border [&>pre]:p-6 [&>pre]:overflow-x-auto
        [&>ul]:my-6 [&>ul]:pl-6 [&>ul]:list-disc
        [&>ol]:my-6 [&>ol]:pl-6 [&>ol]:list-decimal
        [&>li]:mb-2
        [&_code]:font-mono [&_code]:text-sm [&_code]:bg-reading-border [&_code]:px-1 [&_code]:rounded
        [&>pre_code]:bg-transparent [&>pre_code]:p-0
      "
    >
      {children}
    </div>
  );
}
