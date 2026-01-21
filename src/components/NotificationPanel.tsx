/**
 * NotificationPanel.tsx
 *
 * Phase 10: Notification dropdown panel.
 * Design from 21st.dev MCP, adapted for Water's Notification type.
 *
 * Canon constraints:
 * - UI reflects backend truth; does not invent it
 * - No client-derived semantic counts
 * - Layout does not imply importance or prioritization
 */

import { Bell, Loader2, Check } from "lucide-react";
import type { Notification } from "../domain/notifications/types";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { NotificationItem } from "./NotificationItem";

export interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
}

/**
 * Empty state when no notifications exist.
 */
function EmptyState() {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="relative mb-2">
        <div className="flex size-12 items-center justify-center rounded-lg border border-[#30363d] bg-[#21262d] text-[#8b949e] shadow-sm">
          <Bell className="size-6" />
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-base font-medium text-[#e6edf3]">No notifications</div>
        <p className="text-sm text-[#8b949e]">
          You're all caught up! Check back later for updates.
        </p>
      </div>
    </div>
  );
}

/**
 * Loading state with spinner.
 */
function LoadingState() {
  return (
    <div className="flex min-h-[200px] items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-6 animate-spin text-[#8b949e]" />
        <p className="text-sm text-[#8b949e]">Loading notifications...</p>
      </div>
    </div>
  );
}

export function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  isLoading,
  hasMore,
  onLoadMore,
  onMarkAllRead,
  onMarkRead,
}: NotificationPanelProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for click-outside-to-close */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="absolute right-0 top-full mt-2 z-50 w-[400px] rounded-lg border border-[#30363d] bg-[#161b22] shadow-lg shadow-black/20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#30363d] p-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[#e6edf3]">Notifications</h3>
            {unreadCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-[#238636] text-xs font-medium text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onMarkAllRead}
                className="h-8 text-xs text-[#8b949e] hover:text-[#e6edf3]"
              >
                <Check className="mr-1 size-3.5" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[400px] overflow-hidden">
          {isLoading && notifications.length === 0 ? (
            <LoadingState />
          ) : notifications.length === 0 ? (
            <EmptyState />
          ) : (
            <ScrollArea className="h-full max-h-[400px]">
              <div className="space-y-1 p-2">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={onMarkRead}
                  />
                ))}
                {hasMore && (
                  <Button
                    variant="ghost"
                    className="w-full text-[#58a6ff] hover:text-[#79c0ff]"
                    onClick={onLoadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load more"
                    )}
                  </Button>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </>
  );
}
