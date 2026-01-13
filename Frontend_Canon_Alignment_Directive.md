# 📜 Frontend Canon Alignment Directive — Assertion Parity & Truth Separation

> **Scope:** This directive realigns the frontend UI with the Water canon.
> It removes implicit semantics, restores assertion parity, and decouples delivery from truth.
>
> This is a **corrective alignment**, not a feature expansion.

---

## Canon References (Binding)

- `claude.md` — Water Canon & Constitution
- Phase C — Feed & Thread Canon
- Phase E.1 — Reactions (Canon-Guarded)
- Phase E.2 — Notifications (Canon-Guarded, Parity-Enforced)

Any deviation from these documents is invalid.

---

## Objective

Eliminate frontend-introduced meaning that is **not derivable from backend contracts**, specifically:

1. Root / reply privilege
2. Implicit importance from counts
3. Coupling delivery state to truth

This directive intentionally prefers **removal of meaning** over invention.

---

## Canon Violations Being Addressed

### 🔴 CV-1: Assertion Hierarchy Invented by UI
- Replies treated as terminal
- Reply / thread affordances hidden for replies

### 🔴 CV-2: Importance Inferred from Client-Derived Counts
- `responses.length` used as semantic signal
- Feed and thread UI implying activity or importance

### 🔴 CV-3: Delivery State Treated as Truth
- Optimistic feed insertion shown as authoritative
- Client-fabricated assertion shape shown as real

---

## Required Changes (Exact & Minimal)

---

## 1️⃣ Restore Assertion Parity (Remove `isResponse` Gating)

### File
`src/components/FeedItemCard.tsx`

### BEFORE (Violation)
```tsx
const isResponse = item.assertionType === 'response';

{!isResponse && onActiveReplyIdChange && (
  <button onClick={() => onActiveReplyIdChange(item.assertionId)}>
    Reply
  </button>
)}

{!isResponse && (
  <Link to="/thread/$assertionId" params={{ assertionId: item.assertionId }}>
    View thread
  </Link>
)}
```

### AFTER (Canon-Aligned)
```tsx
{onActiveReplyIdChange && (
  <button onClick={() => onActiveReplyIdChange(item.assertionId)}>
    Reply
  </button>
)}

<Link to="/thread/$assertionId" params={{ assertionId: item.assertionId }}>
  View thread
</Link>
```

### Canon Justification
- Replies are assertions
- UI must not invent reply termination rules
- Backend already supports nested replies

---

## 2️⃣ Remove Client-Derived Reply Counts

### Files
- `src/components/FeedItemCard.tsx`
- `src/pages/ThreadPage.tsx`

### BEFORE (Violation)
```tsx
const replyCount = item.responses?.length ?? 0;
Reply {replyCount > 0 ? `(${replyCount})` : ''}
```

```tsx
{responses.length} {responses.length === 1 ? 'reply' : 'replies'}
```

### AFTER (Canon-Aligned)
```tsx
Reply
```

```tsx
Replies
```

> ⚠️ If reply counts matter in the future, they must be provided as
> backend-authoritative `responseCount`. Client derivation is forbidden.

### Canon Justification
- Counts imply importance
- Feed projections are partial by design
- UI must not infer global truth from local slices

---

## 3️⃣ Decouple Optimistic Delivery from Truth

### Files
- `src/pages/App.tsx`
- `src/domain/feed/useHomeFeed.ts`

### BEFORE (Violation)
```ts
prepend(item);
```

Item shape constructed client-side and treated as authoritative.

---

### AFTER (Canon-Aligned)

#### A) Mark Optimistic Items as Provisional
```ts
prepend({ ...item, isPending: true });
```

#### B) Update FeedItem Rendering
```tsx
{item.isPending && (
  <span className="text-xs opacity-60 ml-2">(sending…)</span>
)}
```

#### C) Reconcile on Authoritative Fetch
On next `refresh()`:
- Replace provisional items with backend-provided assertions
- Remove any `isPending` entries that fail to reconcile

### Canon Justification
- Delivery ≠ Truth
- Backend defines canonical assertion shape
- UI must acknowledge provisional state

---

## 4️⃣ Naming Hygiene (Advisory)

### File
`src/pages/ThreadPage.tsx`

### BEFORE
```ts
function ThreadItem({ item, isRoot }: { ... })
```

### SUGGESTED
```ts
function ThreadItem({ item, isThreadOrigin }: { ... })
```

This change is **recommended but not required**.

---

## Explicit Non-Goals / Refusals

- ❌ Do not add new UI features
- ❌ Do not introduce counts or ranking
- ❌ Do not add canReply heuristics
- ❌ Do not infer backend semantics
- ❌ Do not block nested replies

Any of the above requires a new canon phase.

---

## Verification Checklist

This directive is complete only when:

- [ ] Replies and roots expose identical affordances
- [ ] No UI derives semantic counts from partial data
- [ ] Optimistic items are visually provisional
- [ ] Backend refresh reconciles UI truth
- [ ] Removing notifications does not affect UI correctness

---

## Canon Reminder

> *The UI reflects truth.  
> It does not invent it.*

This alignment restores that principle.

---

_End of Frontend Canon Alignment Directive._
