# Phase C (Edit/Delete UI Enablement) - Completion Summary

**Date**: 2026-01-10
**Directive**: Enable Canon B-safe Edit/Delete UI with minimal temporary affordances

## Overview

Phase C implements minimal UI affordances for editing and deleting posts while maintaining strict Canon B invariants:

- **Edit ≠ mutate**: Creates new assertion via revision
- **Delete ≠ remove**: Creates tombstone assertion
- **UI never guesses**: Backend resolution is authoritative
- **Role-based visibility**: Edit/Delete buttons shown only to author/admin

All changes are frontend-only. No new backend endpoints added.

---

## Objectives Completed

### ✅ Objective A: Visibility & Permission Gating (Frontend Only)

**UserRole Type** (`src/domain/permissions/UserRole.ts`):
```typescript
export type UserRole = "guest" | "user" | "admin" | "super-admin";
```

**Permission Functions**:
- `getUserRole(session)`: Returns role from session (currently "guest" or "user")
- `canEdit(viewerId, authorId, viewerRole)`: Check edit permission
- `canDelete(viewerId, authorId, viewerRole)`: Check delete permission

**Rules Implemented**:
- Edit/Delete visible if **viewer is author** OR **viewer role is admin/super-admin**
- Guests never see Edit or Delete buttons
- Backend remains authoritative (these are UI hints only)

---

### ✅ Objective B: Temporary Action Menu (Minimal)

**Component** (`src/components/PostActionMenu.tsx`):

**Features**:
- Dropdown menu with Edit/Delete options
- Triggered by three-dot "more_horiz" icon
- No animations, no nesting, minimal styling
- Closes on click outside
- Only renders if canEdit or canDelete is true

**Integration**:
- Added to `FeedItemCard` header (right-aligned)
- Replaced inline Edit/Delete buttons from Phase B3
- Receives `canEdit` and `canDelete` props from permission checks

---

### ✅ Objective C: Edit Flow (Revision Canon B)

**Edit Action Behavior**:
1. User clicks "Edit" from action menu
2. `handleEdit` finds assertion in feed
3. Main composer prefilled with existing content:
   ```typescript
   await mainComposer.replaceDraft({
     text: assertion.text,
     media: assertion.media || [],
   });
   ```
4. `revisingId` state set to target assertion ID
5. Page scrolls to composer (smooth scroll)
6. User modifies content
7. Click "Publish"
8. `wrappedMainComposer.publish()` includes `supersedesId: revisingId`
9. Backend creates revision (new assertion)
10. Feed refresh removes old version, shows new version

**File Modified**: `src/pages/HomeFeedPage.tsx` (lines 90-119)

**Canon B Compliance**:
- ✅ No in-place editing
- ✅ No overwriting original content
- ✅ Creates new assertion with `supersedesId`
- ✅ Feed replaces old item automatically via projection

---

### ✅ Objective D: Delete Flow (Tombstone)

**Delete Action Behavior**:
1. User clicks "Delete" from action menu
2. Confirmation dialog: "Delete this post? This action cannot be undone."
3. On confirm: Call `DELETE /api/assertions/:id`
4. Backend creates tombstone assertion (Phase B3.4-A)
5. Feed refresh hides both original and tombstone (projection filters)

**File Modified**: `src/pages/HomeFeedPage.tsx` (lines 121-145)

**Canon B Compliance**:
- ✅ Delete creates tombstone assertion
- ✅ Original assertion remains in graph (history preserved)
- ✅ Projection layer filters tombstones
- ✅ No client-side removal logic

---

### ✅ Objective E: Feed Update Rules (Critical)

**Enforced Rules**:
- ✅ **Do not manually remove items** - Feed refresh handles removal
- ✅ **Do not re-sort feed** - Backend projection determines order
- ✅ **Do not detect revisions client-side** - Backend resolves versions

**Allowed**:
- ✅ **Prepend returned assertion** - Optimistic UI for responsiveness
- ✅ **Rely on feed refresh** - Backend projection is source of truth

**Implementation**:
- Edit flow: Prepend new assertion + refresh (old version removed by projection)
- Delete flow: Refresh only (tombstone filtered by projection)
- No client-side version detection or manual DOM manipulation

---

### ✅ Objective F: Failure Handling (Minimal)

**409 Conflict Handling**:

**Edit Flow** (`wrappedMainComposer.publish`):
```typescript
catch (error: any) {
  if (error.status === 409 || error.message.includes("already been revised")) {
    alert("This post has already been edited or deleted.");
    setRevisingId(null);
    refresh();
    throw error;
  }
  throw error;
}
```

**Delete Flow** (`handleDelete`):
```typescript
if (response.status === 409) {
  alert("This post has already been edited or deleted.");
  refresh();
  return;
}
```

**401/403 Handling**:
- Permission checks happen at UI level (buttons hidden)
- If backend returns 401/403, error surfaces to user via alert
- No retry logic, no reconciliation

**Toast Message**:
- Uses browser `alert()` for simplicity
- Message: "This post has already been edited or deleted."
- No retry button, user must refresh manually

---

## Files Modified

### New Files Created

1. **`src/domain/permissions/UserRole.ts`** (new)
   - UserRole type definition
   - getUserRole(), canEdit(), canDelete() functions

2. **`src/components/PostActionMenu.tsx`** (new)
   - Dropdown menu component for Edit/Delete
   - Minimal styling, no animations

### Modified Files

3. **`src/components/FeedItemCard.tsx`**
   - Added UserRole import and permission checks
   - Replaced inline Edit/Delete buttons with PostActionMenu
   - Added viewerRole prop to component signature
   - Passed viewerRole to nested responses

4. **`src/components/HomeFeedList.tsx`**
   - Added UserRole import
   - Added viewerRole prop to interface
   - Passed viewerRole to FeedItemCard

5. **`src/components/HomeFeedContainer.tsx`**
   - Added UserRole import
   - Added viewerRole prop to interface
   - Passed viewerRole to HomeFeedList

6. **`src/pages/HomeFeedPage.tsx`**
   - Added getUserRole import
   - Calculate viewerRole from session
   - Updated wrappedMainComposer with 409 Conflict handling
   - Updated handleDelete with 409 Conflict handling
   - Passed viewerRole to HomeFeedContainer
   - Edit/Delete handlers already implemented (Phase B3.4-B)

---

## Completion Checklist

### Visibility & Permissions

- ✅ **Edit button visible only for author/admin**
  - Permission check: `canEdit(viewerId, authorId, viewerRole)`
  - Guests never see button

- ✅ **Delete button visible only for author/admin**
  - Permission check: `canDelete(viewerId, authorId, viewerRole)`
  - Same rules as Edit

### Edit Flow

- ✅ **Edit creates revision (new assertion)**
  - Calls `/api/publish` with `supersedesId`
  - Backend creates new assertion
  - Original remains in graph

- ✅ **Old post disappears from feed**
  - Projection layer filters superseded assertions
  - Feed refresh removes old version

### Delete Flow

- ✅ **Delete creates tombstone**
  - Calls `DELETE /api/assertions/:id`
  - Backend creates tombstone assertion (Phase B3.4-A)
  - Original remains in graph

- ✅ **Old post disappears from feed**
  - Projection layer filters tombstones
  - Feed refresh removes deleted assertion

### Canon B Compliance

- ✅ **No Canon B violations introduced**
  - Edit creates new assertion (no mutation)
  - Delete creates tombstone (no removal)
  - Feed relies on projection (no client-side version logic)

- ✅ **No frontend branching or mutation logic**
  - No manual item removal
  - No client-side version detection
  - No re-sorting or reconciliation

### Failure Handling

- ✅ **409 Conflict returns clean error**
  - Edit flow: Alert + clear revision state + refresh
  - Delete flow: Alert + refresh
  - Message: "This post has already been edited or deleted."

- ✅ **No retry logic**
  - User sees error, must refresh manually
  - No automatic reconciliation

---

## Testing Verification

### Manual Test Scenarios

**Test 1: Edit Own Post**:
1. Create a post as authenticated user
2. Action menu (three dots) should appear
3. Click Edit
4. Composer prefills with post content
5. Modify text
6. Click Publish
7. Old version disappears, new version appears
8. Verify history endpoint shows both versions

**Test 2: Delete Own Post**:
1. Create a post as authenticated user
2. Click Delete from action menu
3. Confirm dialog appears
4. Confirm deletion
5. Post disappears from feed
6. Verify tombstone exists in backend (history endpoint)

**Test 3: Edit Conflict (409)**:
1. Open post in two tabs
2. Edit in Tab A, publish
3. Edit same post in Tab B, publish
4. Tab B shows: "This post has already been edited or deleted."
5. Feed refreshes to show Tab A's version

**Test 4: Delete Conflict (409)**:
1. Open post in two tabs
2. Delete in Tab A
3. Delete in Tab B
4. Tab B shows: "This post has already been edited or deleted."
5. Feed refreshes (post already gone)

**Test 5: Guest User**:
1. Log out (become guest)
2. View feed
3. No action menu appears on any posts

**Test 6: Admin User** (when backend adds role):
1. Log in as admin
2. View other users' posts
3. Action menu appears (can edit/delete others' posts)

---

## Architecture Notes

### Permission Model

**Current State** (Phase C):
- Frontend-only role model
- `getUserRole()` returns "guest" or "user"
- Admin/super-admin not yet available (backend TODO)

**Future State**:
- Backend adds `role` field to session.user
- `getUserRole()` reads `session.user.role`
- Admin/super-admin can edit/delete others' posts

### Feed Update Strategy

**Optimistic UI**:
- Edit: Prepend new assertion immediately
- Delete: No optimistic removal (wait for refresh)

**Source of Truth**:
- Backend projection resolves all version conflicts
- Client never guesses which version is head
- Feed refresh always authoritative

### Error Handling Philosophy

**Minimal Failure Surface**:
- 409 Conflict: Show message, refresh, move on
- No retry loops (user can retry manually)
- No optimistic conflict resolution
- No client-side reconciliation

**Trust Backend**:
- Constraint violations handled by database
- Projection layer resolves versions
- Client displays results, doesn't compute them

---

## Guardrails Maintained

- ✅ **No new backend endpoints** - Uses existing /publish and DELETE /assertions/:id
- ✅ **No new feed projection logic** - Existing projection filters tombstones
- ✅ **No full role system** - Minimal frontend-only role model
- ✅ **No optimistic conflict resolution** - 409 = error, refresh, done
- ✅ **No version browsing UI** - History endpoint exists but no UI for it
- ✅ **No menu system expansion** - Single dropdown per post, that's it

---

## Phase C Complete ✅

**Canon B Invariants Maintained**:
- Edit creates revision (immutable assertions)
- Delete creates tombstone (no removal)
- Feed shows heads only (projection layer authoritative)
- UI never guesses (backend resolution final)

**Temporary UI Enabled**:
- Action menu with Edit/Delete
- Role-based visibility
- Canon B-compliant flows
- Minimal failure handling

Phase C successfully enables Edit/Delete UI while maintaining strict Canon B compliance.
