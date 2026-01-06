# Reading Components - Usage Guide

## Hybrid v3 Implementation

These components enforce the approved Hybrid v3 reading experience at the token level, making it hard to regress.

## Basic Usage

```tsx
import {
  ReadingPageShell,
  ArticleHeader,
  ArticleBody,
  ArticleFooter,
  ProgressIndicator,
} from '@/components/reading';

export function ArticlePage() {
  return (
    <ReadingPageShell>
      <ArticleHeader
        title="Your Article Title"
        dek="Optional subtitle or description"
        author="Author Name"
        publishedAt="Jan 5, 2026"
        readingTime="7 min read"
      />

      <ArticleBody>
        <p>Your article content goes here...</p>
        <h2>Section Heading</h2>
        <p>More content...</p>
      </ArticleBody>

      <ArticleFooter />
    </ReadingPageShell>
  );
}
```

## With Progress Indicator

```tsx
import { useState, useEffect } from 'react';

export function ArticlePageWithProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
      setProgress(scrollPercent);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <ProgressIndicator progress={progress} />
      <ReadingPageShell>
        {/* content */}
      </ReadingPageShell>
    </>
  );
}
```

## Rendering Dynamic Content

For content from a CMS or markdown:

```tsx
export function DynamicArticle({ article }) {
  return (
    <ReadingPageShell>
      <ArticleHeader
        title={article.title}
        dek={article.subtitle}
        author={article.author.name}
        publishedAt={article.publishedAt}
        readingTime={article.readingTimeMinutes + ' min read'}
      />

      <ArticleBody>
        <div dangerouslySetInnerHTML={{ __html: article.htmlContent }} />
      </ArticleBody>

      <ArticleFooter />
    </ReadingPageShell>
  );
}
```

## Guardrails

### ❌ DON'T

- Add flex or sidebars inside the article shell
- Add sticky elements that overlap text
- Use `prose` class without these overrides
- Add inline widgets or interruptions in ArticleBody
- Modify spacing tokens without team approval

### ✅ DO

- Keep reading content within ReadingPageShell
- Use ArticleBody for all article text content
- Always include ArticleFooter as boundary marker
- Extend tokens only for reading pages
- Follow semantic heading hierarchy (h1 → h2 → h3)

## Components

### ReadingPageShell

Wraps the entire reading experience with proper constraints.

**Props:** `{ children: ReactNode }`

### ArticleHeader

Displays article metadata in canonical format.

**Props:**
- `title: string` (required)
- `dek?: string`
- `author?: string`
- `publishedAt?: string`
- `readingTime?: string`

### ArticleBody

Enforces locked reading rhythm for article content.

**Props:** `{ children: ReactNode }`

**Invariant:** rhythm > density, semantic headings only, no inline widgets

### ArticleFooter

Signals end of article and separates from engagement UI.

**Props:** `{ children?: ReactNode }`

### ProgressIndicator

Optional reading progress bar (canon-safe).

**Props:** `{ progress: number }` (0-100)
