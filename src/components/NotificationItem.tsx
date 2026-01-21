/**
 * NotificationItem.tsx
 *
 * Phase 10: Individual notification item component.
 * Design from 21st.dev MCP, adapted for Water's Notification type.
 *
 * Canon constraints:
 * - UI reflects backend truth; does not invent it
 * - Visual distinction between read/unread without implying importance
 */

import { useNavigate } from "@tanstack/react-router";
import { MessageSquare, ThumbsUp, CheckCircle, Check } from "lucide-react";
import type { Notification } from "../domain/notifications/types";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Mark as read if unread
    if (!notification.read) {
      onMarkRead(notification.id);
    }

    // Navigate to the assertion
    navigate({ to: `/thread/${notification.assertionId}` });
  };

  const actorName = notification.actor?.name || notification.actor?.handle || "Someone";
  const message = getNotificationMessage(notification);
  const timeAgo = formatTimeAgo(notification.createdAt);

  return (
    <div
      className={cn(
        "group relative flex gap-3 rounded-lg border border-[#30363d] bg-[#0d1117] p-3 transition-colors hover:bg-[#161b22] cursor-pointer",
        !notification.read && "border-l-4 border-l-[#58a6ff]"
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Icon */}
      <div className="flex-shrink-0 pt-0.5">
        <NotificationIcon
          type={notification.notificationType}
          reactionType={notification.reactionType}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm leading-tight">
            <span className={cn("font-medium", notification.read ? "text-[#8b949e]" : "text-[#e6edf3]")}>
              {actorName}
            </span>{" "}
            <span className="text-[#8b949e]">{message}</span>
          </p>
          {!notification.read && (
            <div className="size-2 shrink-0 rounded-full bg-[#58a6ff] mt-1.5" />
          )}
        </div>
        <p className="text-xs text-[#484f58]">{timeAgo}</p>
      </div>

      {/* Mark read button on hover */}
      {!notification.read && (
        <Button
          size="icon"
          variant="ghost"
          className="size-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(notification.id);
          }}
        >
          <Check className="size-4 text-[#8b949e]" />
        </Button>
      )}
    </div>
  );
}

function NotificationIcon({
  type,
  reactionType,
}: {
  type: "reply" | "reaction";
  reactionType?: string;
}) {
  if (type === "reply") {
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-[#21262d]">
        <MessageSquare className="size-4 text-[#8b949e]" />
      </div>
    );
  }

  // Reaction icons
  if (reactionType === "like") {
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-[#388bfd]/10">
        <ThumbsUp className="size-4 text-[#58a6ff]" />
      </div>
    );
  }

  // Acknowledge
  return (
    <div className="flex size-8 items-center justify-center rounded-full bg-[#238636]/10">
      <CheckCircle className="size-4 text-[#3fb950]" />
    </div>
  );
}

function getNotificationMessage(notification: Notification): string {
  if (notification.notificationType === "reply") {
    return "replied to your post";
  }

  if (notification.reactionType === "like") {
    return "liked your post";
  }

  if (notification.reactionType === "acknowledge") {
    return "acknowledged your post";
  }

  return "reacted to your post";
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
