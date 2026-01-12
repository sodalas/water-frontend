# 📜 Water Doctrine — Canonical Guarantees & Non‑Negotiables

This document codifies what the Water system **guarantees** after completion of Phases A–E.0.
It is not aspirational. It is a statement of **truths the system now enforces**.

Any future work (features, refactors, scale) must preserve these guarantees.

---

## 1. Canonical Truths

### 1.1 Graph Is the Source of Truth
All meaning in Water originates from the graph.

- Assertions, replies, revisions, and visibility are graph facts
- The UI is a projection of graph truth
- The backend enforces graph semantics
- No layer may invent meaning

**Guarantee:** If the graph is correct, the system is correct.

---

### 1.2 Identity Is Stable
Every assertion has:

- A stable `assertionId`
- A single author identity
- An immutable creation time

Edits do not mutate identity — they create new versions.

**Guarantee:** Content identity is never ambiguous.

---

### 1.3 Revisions Preserve Reachability
Revision is modeled via `supersedesId`.

- Superseded assertions are hidden
- Descendants of superseded assertions remain reachable
- Threads never fragment due to edits

**Guarantee:** Editing cannot erase conversation structure.

---

### 1.4 Threads Are First‑Class
Threads are explicit, not emergent.

- Threads are anchored at root assertions
- Replies are connected via `RESPONDS_TO`
- Nested replies are supported
- Thread read endpoints are authoritative

**Guarantee:** Conversations are navigable and complete.

---

### 1.5 Feed Promotes Threads, Never Replies
The feed is a **thread index**, not a message stream.

- Only root assertions appear in the feed
- Replies never appear as feed roots
- Navigation from feed → thread is always possible

**Guarantee:** The feed cannot misrepresent conversation structure.

---

## 2. UX Truthfulness

### 2.1 UI Must Not Lie
The UI may be incomplete, but it must never be misleading.

- Actions shown are valid
- Disabled actions explain why
- Errors are explicit
- Empty states are honest

**Guarantee:** Users are never misled about system capability.

---

### 2.2 Permissions Are Explicit
The UI mirrors backend permission rules exactly.

- Edit/Delete shown only when valid
- Superseded content is never actionable
- Unauthorized actions fail loudly, not silently

**Guarantee:** Power is visible only where it exists.

---

## 3. Contracts & Guards

### 3.1 Contracts Are Explicit
Frontend ↔ backend contracts are enforced.

- Invalid shapes fail fast
- Silent fallback is forbidden
- Contract drift is observable

**Guarantee:** Mismatches surface immediately.

---

### 3.2 Invariants Are Enforced, Not Assumed
Invariants are:

- Checked
- Logged
- Monitored

Near‑misses are treated as signals, not ignored.

**Guarantee:** Structural risk is visible before failure.

---

## 4. Operational Guarantees

### 4.1 Failures Are Observable
All core failures are:

- Captured
- Contextualized
- Diagnosable

No silent corruption paths exist.

**Guarantee:** Unknown failure modes are unacceptable.

---

### 4.2 Errors Are Typed and Honest
Errors communicate intent.

- Validation vs permission vs conflict vs internal
- User‑safe messaging
- Developer‑useful context

**Guarantee:** Errors improve understanding, not confusion.

---

## 5. What Water Will Not Do

These are **explicit refusals**:

- Infer semantics from partial data
- Treat replies as feed roots
- Hide failure states
- Trade correctness for convenience
- Allow UI to paper over backend truth

Violating these is a bug, not a tradeoff.

---

## 6. Canon Lock

This doctrine is **canon‑locked** at the end of Phase E.0.

Future phases may:
- Extend capability
- Add semantics
- Improve scale

They may **not** weaken or contradict the guarantees above.

---

_End of Water Doctrine._
