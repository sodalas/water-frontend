#!/bin/bash
# canonical-enforcement-check.sh
#
# Verifies that Article Reading UI follows canonical enforcement rules.
# This script ensures no inline reading layout or typography exists in pages.
#
# Usage: ./canonical-enforcement-check.sh
# Exit 0 = all checks pass
# Exit 1 = violations detected

echo "🔍 Checking canonical enforcement..."

VIOLATIONS=0

# Check for inline reading layout in pages
echo "  → Checking for inline reading layout..."
if grep -r "mx-auto max-w-reading" src/pages/*.tsx 2>/dev/null; then
    echo "  ❌ VIOLATION: Inline reading layout found in pages"
    echo "     Fix: Use <ReadingPageShell> instead"
    VIOLATIONS=$((VIOLATIONS + 1))
fi

# Check for duplicated rhythm rules in pages
echo "  → Checking for duplicated rhythm rules..."
if grep -r "\[&>p\]:mb-\[1\.05em\]" src/pages/*.tsx 2>/dev/null; then
    echo "  ❌ VIOLATION: Duplicated rhythm rules found in pages"
    echo "     Fix: Use <ArticleBody> instead"
    VIOLATIONS=$((VIOLATIONS + 1))
fi

# Check for inline article headers
echo "  → Checking for inline article headers..."
if grep -r 'className="font-ui text-title' src/pages/*.tsx 2>/dev/null; then
    echo "  ❌ VIOLATION: Inline article header found in pages"
    echo "     Fix: Use <ArticleHeader> instead"
    VIOLATIONS=$((VIOLATIONS + 1))
fi

# Check for mandatory invariant comment
echo "  → Checking for mandatory invariant comment..."
if ! head -1 src/pages/ArticleReadingPage.tsx 2>/dev/null | grep -q "Invariant.*Article reading pages MUST compose"; then
    echo "  ❌ VIOLATION: Mandatory invariant comment missing"
    echo "     Fix: Add invariant comment at top of file"
    VIOLATIONS=$((VIOLATIONS + 1))
fi

# Check that reading components are imported
echo "  → Checking for canonical component imports..."
if ! grep -q 'from.*components/reading' src/pages/ArticleReadingPage.tsx 2>/dev/null; then
    echo "  ❌ VIOLATION: Canonical components not imported"
    echo "     Fix: Import from '../components/reading'"
    VIOLATIONS=$((VIOLATIONS + 1))
fi

# Check for PostArticleCTA placement (must be after ArticleFooter in component tree)
echo "  → Checking PostArticleCTA placement..."
if grep -q "PostArticleCTA" src/pages/ArticleReadingPage.tsx 2>/dev/null; then
    # Check that PostArticleCTA appears after </ArticleFooter> or ArticleFooter />
    FOOTER_LINE=$(grep -n "<ArticleFooter" src/pages/ArticleReadingPage.tsx | tail -1 | cut -d: -f1)
    CTA_LINE=$(grep -n "<PostArticleCTA" src/pages/ArticleReadingPage.tsx | tail -1 | cut -d: -f1)

    if [ -n "$FOOTER_LINE" ] && [ -n "$CTA_LINE" ] && [ "$CTA_LINE" -lt "$FOOTER_LINE" ]; then
        echo "  ❌ VIOLATION: PostArticleCTA must appear after ArticleFooter"
        echo "     Fix: Move PostArticleCTA after ArticleFooter in component tree"
        VIOLATIONS=$((VIOLATIONS + 1))
    fi
fi

# Check for feed/composer imports in reading pages (forbidden)
echo "  → Checking for stream/editor contamination..."
if grep -E "from.*(feed|composer|stream|editor)" src/pages/ArticleReadingPage.tsx 2>/dev/null | grep -v "// "; then
    echo "  ❌ VIOLATION: Feed/composer imports found in reading page"
    echo "     Fix: Remove stream/editor imports from reading pages"
    VIOLATIONS=$((VIOLATIONS + 1))
fi

# Summary
echo ""
if [ $VIOLATIONS -eq 0 ]; then
    echo "✅ All canonical enforcement checks passed"
    exit 0
else
    echo "❌ $VIOLATIONS violation(s) detected"
    echo ""
    echo "Canonical components enforce reading invariants structurally."
    echo "Pages must compose them, never inline layout or typography."
    exit 1
fi
