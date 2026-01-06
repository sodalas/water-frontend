#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Checking Article Reading Canon (🟥)…"

# ---- CONFIG ----
READING_PAGE="src/pages/ArticleReadingPage.tsx"
READING_COMPONENT_DIR="src/components/reading"

# Forbidden client-side renderers
FORBIDDEN_MARKDOWN_LIBS=(
  "react-markdown"
  "remark"
  "remark-gfm"
  "marked"
  "mdx"
  "@mdx-js"
)

# Forbidden imports in reading page
FORBIDDEN_IMPORTS=(
  "useComposer"
  "HomeFeed"
  "Feed"
  "Composer"
)

# Required canonical components
REQUIRED_COMPONENTS=(
  "ReadingPageShell"
  "ArticleHeader"
  "ArticleBody"
  "ArticleFooter"
)

# ---- CHECKS ----

# 1. Reading page must exist
if [[ ! -f "$READING_PAGE" ]]; then
  echo "❌ Missing ArticleReadingPage.tsx"
  exit 1
fi

# 2. Forbidden markdown libs must not appear anywhere in reading
# Check only if directory exists to avoid error loops
if [[ -d "$READING_COMPONENT_DIR" ]]; then
    for lib in "${FORBIDDEN_MARKDOWN_LIBS[@]}"; do
      if grep -R "$lib" "$READING_PAGE" "$READING_COMPONENT_DIR" >/dev/null 2>&1; then
        echo "❌ Forbidden markdown renderer detected: $lib"
        echo "   Client-side markdown violates Article Reading Canon (🟥)"
        exit 1
      fi
    done
else
    # Fallback to checking just the page
    for lib in "${FORBIDDEN_MARKDOWN_LIBS[@]}"; do
      if grep "$lib" "$READING_PAGE" >/dev/null 2>&1; then
        echo "❌ Forbidden markdown renderer detected: $lib"
        echo "   Client-side markdown violates Article Reading Canon (🟥)"
        exit 1
      fi
    done
fi

# 3. Forbidden imports must not appear in reading page
for imp in "${FORBIDDEN_IMPORTS[@]}"; do
  if grep "$imp" "$READING_PAGE" >/dev/null 2>&1; then
    echo "❌ Forbidden import in ArticleReadingPage: $imp"
    echo "   Reading must not depend on feed/composer state (🟥)"
    exit 1
  fi
done

# 4. Canonical components must be composed
for comp in "${REQUIRED_COMPONENTS[@]}"; do
  if ! grep "$comp" "$READING_PAGE" >/dev/null 2>&1; then
    echo "❌ Missing canonical component in ArticleReadingPage: $comp"
    echo "   Reading pages must compose canonical components (🟥)"
    exit 1
  fi
done

# 5. No inline article layout allowed
if grep -E "max-w-reading|font-body|text-body" "$READING_PAGE" >/dev/null 2>&1; then
  echo "❌ Inline reading typography/layout detected in ArticleReadingPage"
  echo "   Typography must live in canonical components only (🟥)"
  exit 1
fi

echo "✅ Article Reading Canon enforced successfully"
