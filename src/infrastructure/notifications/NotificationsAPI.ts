/**
 * Phase E.2: Notifications API Adapter
 *
 * Provides fetch-based API calls for notification operations.
 */

import type {
  NotificationsResponse,
  MarkReadResponse,
  MarkAllReadResponse,
  UnreadCountResponse,
} from '../../domain/notifications/types';

const API_BASE = '/api';

/**
 * Fetch notifications for the authenticated user.
 *
 * @param cursor - Optional cursor for pagination
 * @param limit - Optional limit (default 20)
 */
export async function fetchNotifications(
  cursor?: string,
  limit: number = 20
): Promise<NotificationsResponse> {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  if (limit !== 20) params.set('limit', String(limit));

  const queryString = params.toString();
  const url = `${API_BASE}/notifications${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url, {
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error(`Failed to fetch notifications: ${res.status}`);
  }

  return res.json();
}

/**
 * Mark a notification as read.
 */
export async function markAsRead(notificationId: string): Promise<MarkReadResponse> {
  const res = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error(`Failed to mark notification as read: ${res.status}`);
  }

  return res.json();
}

/**
 * Mark all notifications as read.
 */
export async function markAllAsRead(): Promise<MarkAllReadResponse> {
  const res = await fetch(`${API_BASE}/notifications/read-all`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error(`Failed to mark all notifications as read: ${res.status}`);
  }

  return res.json();
}

/**
 * Get unread notification count.
 */
export async function getUnreadCount(): Promise<number> {
  const res = await fetch(`${API_BASE}/notifications/unread-count`, {
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 401) {
      // Return 0 for unauthorized users
      return 0;
    }
    throw new Error(`Failed to get unread count: ${res.status}`);
  }

  const data: UnreadCountResponse = await res.json();
  return data.count;
}
