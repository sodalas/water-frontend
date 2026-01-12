# 📜 Phase E.1 — Reactions (Canon-Guarded)

## Role
You are acting as a **senior full-stack engineer introducing the first social signal** into a canon-locked system.

## Canon Reference
This phase is governed by:
- `Water_Canon_Doctrine.md`
- Phase E.0 guarantees (instrumentation, observability, typed errors)

No change may weaken any existing guarantee.

---

## Objective

Introduce **reactions** as the first social capability, adding *lightweight social signal* without altering:

- conversation topology
- thread semantics
- feed semantics
- revision semantics

Reactions must be **purely additive**.

---

## Core Concept

A **reaction** is an expression by an identity *about* an assertion.

It does **not**:
- create content
- change ordering
- affect visibility
- propagate implicitly

---

## Graph Semantics

### New Edge
```
(Identity)-[:REACTED_TO { type, createdAt }]->(Assertion)
```

### Allowed Reaction Types (Initial)
- `like`
- `acknowledge`

(Reaction types are enumerable and explicit.)

---

## Canon Invariants (Non-Negotiable)

### Invariant E.1.1 — Reactions Are Non-Structural
- Reactions do not affect:
  - thread shape
  - reply reachability
  - feed ordering
- Removing all reactions must not change any read path.

---

### Invariant E.1.2 — One Reaction per User per Type
- An identity may have **at most one reaction of a given type** per assertion.
- Reactions are **idempotent**:
  - repeated requests do not create duplicates
  - toggling removes the edge

---

### Invariant E.1.3 — Visibility Gating
- A user may react **only if** they can see the assertion.
- Reactions on hidden, tombstoned, or superseded assertions are forbidden.

---

### Invariant E.1.4 — Reactions Are Not Versions
- Reactions do not participate in revision history.
- Editing an assertion does not migrate or alter reactions.
- Superseding an assertion leaves reactions attached to the superseded version only.

---

### Invariant E.1.5 — Reactions Are Honest in UX
- Reaction UI reflects backend truth exactly.
- No optimistic UI without reconciliation.
- Errors are explicit and user-safe.

---

## API Surface (Minimal)

### Allowed Operations
- `POST /api/reactions` (add or toggle)
- `DELETE /api/reactions/:id` (explicit removal, optional)

No bulk operations.
No derived counts endpoint yet.

---

## UX Requirements

- Reaction controls appear only when:
  - assertion is visible
  - assertion is not superseded
  - user is authenticated
- Disabled states explain *why* (tooltip or label).
- Reaction counts (if shown):
  - are derived
  - never cached client-side as truth
  - may lag but must not lie

---

## Instrumentation Requirements (Required)

All reaction operations must:

- add breadcrumbs:
  - assertionId
  - reactionType
  - operation (add/remove)
- capture errors with:
  - userId
  - assertionId
  - violation type (permission, conflict, invariant)
- log near-misses for:
  - duplicate reaction attempts
  - reactions to superseded assertions
  - visibility mismatches

---

## Explicit Non-Goals / Refusals

- ❌ No feed ranking changes
- ❌ No notifications
- ❌ No reaction-based permissions
- ❌ No reaction propagation across revisions
- ❌ No schema changes beyond the reaction edge

Violating these requires a new phase.

---

## Verification Checklist

Phase E.1 is complete only when:

- [ ] Reactions can be added and removed idempotently
- [ ] Duplicate reactions are impossible
- [ ] Reactions never affect threads or feeds
- [ ] UX states are truthful and permission-aware
- [ ] All failures are observable in Sentry
- [ ] Removing reactions does not alter any other behavior

---

## Transition

After Phase E.1, the system is ready for:

- **Phase E.2 — Notifications (Derived Signals)**, or
- **Phase E.x — Additional Social Signals**, each canon-guarded

---

_End of Phase E.1 directive._
