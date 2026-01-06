# Reading Experience Guardrails - Code Review Checklist

## Hybrid v3 Implementation Standards

This document outlines the constraints and best practices for maintaining the Hybrid v3 reading experience. Use this as a checklist during code reviews.

---

## ❌ NEVER Do These Things

### 1. Don't add flex or sidebars inside the article shell

```tsx
// ❌ BAD - Breaks reading flow
<ReadingPageShell>
  <div className="flex gap-4">
    <aside>Sidebar content</aside>
    <ArticleBody>Content</ArticleBody>
  </div>
</ReadingPageShell>

// ✅ GOOD - Keep reading linear
<ReadingPageShell>
  <ArticleBody>Content</ArticleBody>
</ReadingPageShell>
```

### 2. Don't add sticky elements that overlap text

```tsx
// ❌ BAD - Sticky nav interferes with reading
<ReadingPageShell>
  <nav className="sticky top-0">Share buttons</nav>
  <ArticleBody>Content</ArticleBody>
</ReadingPageShell>

// ✅ GOOD - Keep overlays minimal and non-intrusive
// Only ProgressIndicator is allowed to be fixed/sticky
```

### 3. Don't use `prose` without these overrides

```tsx
// ❌ BAD - prose breaks locked rhythm
<div className="prose">
  <ArticleBody>Content</ArticleBody>
</div>

// ✅ GOOD - Use ArticleBody directly
<ArticleBody>Content</ArticleBody>
```

### 4. Don't add inline widgets or interruptions

```tsx
// ❌ BAD - Inline CTAs break reading flow
<ArticleBody>
  <p>First paragraph</p>
  <div className="bg-blue-500 p-4">Subscribe now!</div>
  <p>Second paragraph</p>
</ArticleBody>

// ✅ GOOD - Put engagement after reading
<ArticleBody>
  <p>First paragraph</p>
  <p>Second paragraph</p>
</ArticleBody>
<ArticleFooter />
<EngagementSection />
```

### 5. Don't modify spacing tokens without team approval

```tsx
// ❌ BAD - Custom spacing breaks rhythm
<p className="mb-4">Custom spacing</p>

// ✅ GOOD - Use locked tokens
<ArticleBody>
  <p>Automatic spacing via [&>p]:mb-[1.05em]</p>
</ArticleBody>
```

### 6. Don't use non-semantic headings

```tsx
// ❌ BAD - Styled div pretending to be heading
<div className="text-2xl font-bold">Not a heading</div>

// ✅ GOOD - Semantic HTML
<h2>Real heading</h2>
```

---

## ✅ ALWAYS Do These Things

### 1. Keep reading content within ReadingPageShell

```tsx
// ✅ Correct structure
<ReadingPageShell>
  <ArticleHeader {...metadata} />
  <ArticleBody>{content}</ArticleBody>
  <ArticleFooter />
</ReadingPageShell>
```

### 2. Use ArticleBody for all article text content

```tsx
// ✅ All prose goes inside ArticleBody
<ArticleBody>
  <p>Content</p>
  <h2>Sections</h2>
  <blockquote>Quotes</blockquote>
  <pre>Code</pre>
</ArticleBody>
```

### 3. Always include ArticleFooter as boundary marker

```tsx
// ✅ Mandatory footer separates reading from engagement
<ArticleBody>Content</ArticleBody>
<ArticleFooter />
{/* Engagement UI can go here */}
```

### 4. Follow semantic heading hierarchy

```tsx
// ✅ Proper hierarchy
<h1>Page title</h1>
<h2>Major section</h2>
<h3>Subsection</h3>

// ❌ Skipping levels
<h1>Page title</h1>
<h3>Skipped h2</h3>
```

### 5. Use reading tokens consistently

```tsx
// ✅ Use semantic color tokens
className="text-reading-text bg-reading-bg"
className="text-reading-muted"
className="border-reading-border"

// ❌ Don't use arbitrary colors in reading context
className="text-gray-800 bg-white"
```

---

## Token Reference

### Font Families
- `font-ui` - Sans-serif for UI elements, headings
- `font-body` - Serif for article body text
- `font-mono` - Monospace for code

### Font Sizes
- `text-title` - Main article title (30-44px)
- `text-dek` - Subtitle/description (16-18px)
- `text-meta` - Byline, dates, metadata (13px)
- `text-body` - Body text (17-19px)
- `text-h1` - Article h1 (26-34px)
- `text-h2` - Article h2 (22-28px)
- `text-h3` - Article h3 (18-22px)

### Spacing
- `mb-p` - Paragraph spacing (1.05em)
- `mt-h-top` - Heading top margin (1.6em)
- `mb-h-bot` - Heading bottom margin (0.55em)

### Max Width
- `max-w-reading` - Optimal line length (72ch)
- `max-w-reading-sm` - Narrower variant (66ch)

### Colors
- `bg-reading-bg` - Page background
- `text-reading-text` - Primary text
- `text-reading-muted` - Secondary text
- `text-reading-faint` - Tertiary text
- `border-reading-border` - Borders and dividers
- `text-reading-link` - Link color
- `text-reading-linkHover` - Link hover state

---

## Review Checklist

When reviewing PRs that touch reading pages:

- [ ] No flex layouts or sidebars inside ReadingPageShell
- [ ] No sticky/fixed elements except ProgressIndicator
- [ ] No inline widgets or CTAs within ArticleBody
- [ ] ArticleFooter is present and marks end of content
- [ ] Semantic heading hierarchy is maintained
- [ ] Only approved reading tokens are used
- [ ] No custom spacing values in article content
- [ ] Dark mode support works correctly
- [ ] Line length constrained to max-w-reading
- [ ] Font families are semantic (ui/body/mono)

---

## Extending the System

If you need to add new reading features:

1. **Propose changes in team discussion first**
2. **Add new tokens to `tailwind.config.ts` under `theme.extend`**
3. **Update this document with new patterns**
4. **Never override base Tailwind defaults**
5. **Test in both light and dark modes**

---

## Questions?

If you're unsure whether a change violates these guardrails:

1. Check if it adds anything inside `<ArticleBody>` that isn't semantic content
2. Check if it modifies spacing/rhythm tokens
3. Check if it breaks the linear reading flow
4. When in doubt, ask before merging

**Invariant to remember:** rhythm > density, semantic headings only, no inline widgets.
