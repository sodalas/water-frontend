/**
 * ExampleReadingPage - Demonstration of Hybrid v3 reading components
 *
 * This page demonstrates proper usage of all reading components
 * with realistic content.
 */

import {
  ReadingPageShell,
  ArticleHeader,
  ArticleBody,
  ArticleFooter,
} from '../components/reading';

export function ExampleReadingPage() {
  return (
    <ReadingPageShell>
      <ArticleHeader
        title="The Hybrid v3 Reading Experience"
        dek="A demonstration of rhythm-first article layout with locked tokens and semantic constraints"
        author="Water Team"
        publishedAt="Jan 5, 2026"
        readingTime="5 min read"
      />

      <ArticleBody>
        <p>
          This page demonstrates the Hybrid v3 reading experience, designed to
          prioritize rhythm over density. Every spacing decision is intentional,
          and the tokens are locked to prevent regression.
        </p>

        <p>
          The reading experience uses fluid typography that scales smoothly across
          viewports, maintaining optimal readability on all devices. Line lengths
          are constrained to 72 characters maximum, proven to be ideal for
          comfortable reading.
        </p>

        <h2>Semantic Typography</h2>

        <p>
          Headings follow a clear hierarchy using the font-ui family for contrast
          with the serif body text. This creates natural visual breaks while
          maintaining reading flow.
        </p>

        <h3>Subheadings Create Structure</h3>

        <p>
          Level three headings provide additional structure without overwhelming
          the reader. Notice how the spacing creates breathing room around each
          section.
        </p>

        <p>
          Multiple paragraphs flow naturally with consistent spacing. The 1.05em
          margin between paragraphs creates rhythm without feeling cramped or
          wasteful.
        </p>

        <blockquote>
          Blockquotes receive special treatment with a left border and muted text
          color. They stand out visually while remaining part of the reading flow.
        </blockquote>

        <p>
          Links are styled with a subtle underline and change color on hover,
          providing clear affordance without being distracting. <a href="#">Try
          hovering over this link</a> to see the interaction.
        </p>

        <h2>Code and Technical Content</h2>

        <p>
          Code blocks are formatted with generous padding and a subtle border,
          making them easy to scan while maintaining visual hierarchy:
        </p>

        <pre>
{`function example() {
  return "Code blocks have their own spacing";
}`}
        </pre>

        <p>
          Inline code elements blend naturally with the text flow, providing
          technical detail without disrupting the reading experience.
        </p>

        <h2>Design Constraints</h2>

        <p>
          The system enforces several critical invariants:
        </p>

        <p>
          First, rhythm takes precedence over density. White space is intentional
          and protected. Second, only semantic heading elements are used—never
          styled divs or spans pretending to be headings.
        </p>

        <p>
          Third, no inline widgets or interruptions appear within the article body.
          All engagement elements live outside the reading flow, typically after
          the ArticleFooter component.
        </p>

        <h3>Dark Mode Support</h3>

        <p>
          The color system automatically adapts to system preferences. Try switching
          your device to dark mode to see the carefully calibrated color palette
          that maintains readability while reducing eye strain.
        </p>

        <p>
          All color tokens use semantic naming (reading-bg, reading-text, etc.)
          rather than specific color values, making the system easy to maintain
          and extend.
        </p>

        <h2>Conclusion</h2>

        <p>
          This implementation makes it difficult to regress on reading quality.
          The tokens are locked, the components enforce constraints, and the
          guardrails are clear.
        </p>

        <p>
          By using these components consistently, you ensure that every article
          provides the same high-quality reading experience that users have come
          to expect.
        </p>
      </ArticleBody>

      <ArticleFooter />
    </ReadingPageShell>
  );
}
