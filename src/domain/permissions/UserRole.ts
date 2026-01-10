/**
 * Phase C: User Role Definitions (Frontend Model Only)
 *
 * These roles are UI hints for visibility gating.
 * Backend remains authoritative for actual permission enforcement.
 */

export type UserRole = "guest" | "user" | "admin" | "super-admin";

/**
 * Get user role from session
 * For now, returns "user" for authenticated, "guest" for unauthenticated
 * Future: Parse from session.user.role when backend provides it
 */
export function getUserRole(session: any): UserRole {
  if (!session?.user) return "guest";

  // TODO: Once backend adds role field, use: session.user.role
  // For now, all authenticated users are "user"
  return "user";
}

/**
 * Check if user can edit a post
 *
 * Rules:
 * - Viewer is the author
 * - OR viewer role is admin/super-admin
 */
export function canEdit(
  viewerId: string | undefined,
  authorId: string,
  viewerRole: UserRole
): boolean {
  if (!viewerId) return false; // Guests cannot edit
  if (viewerId === authorId) return true; // Author can always edit
  if (viewerRole === "admin" || viewerRole === "super-admin") return true; // Admins can edit
  return false;
}

/**
 * Check if user can delete a post
 *
 * Rules: Same as canEdit
 */
export function canDelete(
  viewerId: string | undefined,
  authorId: string,
  viewerRole: UserRole
): boolean {
  return canEdit(viewerId, authorId, viewerRole);
}
