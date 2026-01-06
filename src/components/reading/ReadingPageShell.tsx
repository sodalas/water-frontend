/**
 * ReadingPageShell - Canonical page wrapper for reading experience
 *
 * Enforces Hybrid v3 reading constraints:
 * - min-h-screen container with reading colors
 * - max-w-reading constraint (72ch)
 * - Proper spacing (padding responsive)
 */

interface ReadingPageShellProps {
  children: React.ReactNode;
}

export function ReadingPageShell({ children }: ReadingPageShellProps) {
  return (
    <div className="min-h-screen bg-reading-bg text-reading-text">
      <article className="mx-auto max-w-reading px-4 sm:px-6 pt-6 sm:pt-10 pb-16">
        {children}
      </article>
    </div>
  );
}
