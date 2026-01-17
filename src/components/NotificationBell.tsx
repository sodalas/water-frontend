/**
 * NotificationBell.tsx
 *
 * Phase 8: Minimal notification surface (bell + badge).
 *
 * Displays a bell icon with an unread count badge.
 * Uses backend-authoritative unreadCount from useNotifications.
 *
 * Canon constraints:
 * - No client-derived counts
 * - Badge hidden if count unavailable, zero, or loading (fail silently)
 * - No click handler (out of scope)
 * - UI does not imply ordering, importance, or urgency
 */

import { useNotifications } from "../domain/notifications/useNotifications";

export function NotificationBell() {
  const { unreadCount, isLoading } = useNotifications();

  // Show badge only if:
  // - Not loading (no stale data as authoritative)
  // - Count is greater than 0
  const showBadge = !isLoading && unreadCount > 0;

  return (
    <div className="relative" aria-label="Notifications">
      {/* Bell icon - simple outline style */}
      <svg
        className="w-6 h-6 text-[#8b949e]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
        />
      </svg>

      {/* Badge - only shown when count > 0 and not loading */}
      {showBadge && (
        <span
          className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-medium text-white bg-[#3b82f6] rounded-full"
          aria-label={`${unreadCount} unread notifications`}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </div>
  );
}
