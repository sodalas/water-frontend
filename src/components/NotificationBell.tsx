/**
 * NotificationBell.tsx
 *
 * Phase 10: Notification bell with dropdown panel.
 * Design from 21st.dev MCP.
 *
 * Displays a bell icon with an unread count badge.
 * Clicking opens the NotificationPanel dropdown.
 * Uses backend-authoritative data from useNotifications.
 *
 * Canon constraints:
 * - No client-derived counts
 * - Badge hidden if count unavailable, zero, or loading (fail silently)
 * - UI does not imply ordering, importance, or urgency
 */

import { useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "../domain/notifications/useNotifications";
import { NotificationPanel } from "./NotificationPanel";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    loadMore,
    markNotificationRead,
    markAllRead,
  } = useNotifications();

  // Show badge only if:
  // - Not loading (no stale data as authoritative)
  // - Count is greater than 0
  const showBadge = !isLoading && unreadCount > 0;

  const handleBellClick = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative" aria-label="Notifications">
      {/* Bell button */}
      <button
        onClick={handleBellClick}
        className="relative p-2 rounded-md hover:bg-[#21262d] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#58a6ff]"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Bell className="size-5 text-[#8b949e]" />

        {/* Badge - only shown when count > 0 and not loading */}
        {showBadge && (
          <span
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-medium text-white bg-[#238636] rounded-full"
            aria-label={`${unreadCount} unread notifications`}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification panel dropdown */}
      <NotificationPanel
        isOpen={isOpen}
        onClose={handleClose}
        notifications={notifications}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onMarkAllRead={markAllRead}
        onMarkRead={markNotificationRead}
      />
    </div>
  );
}
