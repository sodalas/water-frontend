/**
 * Phase E.2: NotificationItem Component
 *
 * Displays a single notification with:
 * - What happened (reply or reaction)
 * - Who acted
 * - Link to the assertion
 */

import { useNavigate } from 'react-router-dom';
import type { Notification } from '../domain/notifications/types';

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
    navigate(`/thread/${notification.assertionId}`);
  };

  const actorName = notification.actor?.name || notification.actor?.handle || 'Someone';
  const message = getNotificationMessage(notification, actorName);
  const timeAgo = formatTimeAgo(notification.createdAt);

  return (
    <button
      onClick={handleClick}
      className={`
        w-full text-left px-4 py-3 flex items-start gap-3 transition-colors
        ${notification.read
          ? 'bg-transparent hover:bg-[#f3f4f6]'
          : 'bg-[#eff6ff] hover:bg-[#dbeafe]'
        }
        border-b border-[#e5e7eb] last:border-b-0
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3b82f6]
      `}
    >
      {/* Unread indicator */}
      <div className="flex-shrink-0 pt-1.5">
        {!notification.read && (
          <div className="size-2 rounded-full bg-[#3b82f6]" />
        )}
        {notification.read && (
          <div className="size-2" /> // Spacer
        )}
      </div>

      {/* Icon */}
      <div className="flex-shrink-0 pt-0.5">
        <NotificationIcon type={notification.notificationType} reactionType={notification.reactionType} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] text-[#1f2937] leading-snug">
          <span className="font-medium">{actorName}</span>{' '}
          {message}
        </p>
        <p className="text-[12px] text-[#6b7280] mt-0.5">{timeAgo}</p>
      </div>
    </button>
  );
}

function NotificationIcon({
  type,
  reactionType,
}: {
  type: 'reply' | 'reaction';
  reactionType?: string;
}) {
  if (type === 'reply') {
    return (
      <svg
        className="size-5 text-[#6b7280]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
        />
      </svg>
    );
  }

  // Reaction icon - show like or acknowledge
  if (reactionType === 'like') {
    return (
      <svg
        className="size-5 text-[#3b82f6]"
        fill="currentColor"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
        />
      </svg>
    );
  }

  // Acknowledge
  return (
    <svg
      className="size-5 text-[#10b981]"
      fill="currentColor"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

function getNotificationMessage(notification: Notification, actorName: string): string {
  if (notification.notificationType === 'reply') {
    return 'replied to your post';
  }

  if (notification.reactionType === 'like') {
    return 'liked your post';
  }

  if (notification.reactionType === 'acknowledge') {
    return 'acknowledged your post';
  }

  return 'reacted to your post';
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
