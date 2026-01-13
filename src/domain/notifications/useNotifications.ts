/**
 * Phase E.2: useNotifications Hook
 *
 * Manages notification state with cursor pagination.
 * Notifications are delivery artifacts - purely derived from graph events.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Notification } from './types';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from '../../infrastructure/notifications/NotificationsAPI';

export interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook for managing notifications.
 *
 * @returns Notifications state and actions
 */
export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load initial notifications and unread count
  const loadInitial = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [notifResult, count] = await Promise.all([
        fetchNotifications(),
        getUnreadCount(),
      ]);

      setNotifications(notifResult.items);
      setNextCursor(notifResult.nextCursor);
      setHasMore(notifResult.nextCursor !== null);
      setUnreadCount(count);
    } catch (err) {
      if (err instanceof Error && err.message === 'Unauthorized') {
        // Not authenticated - show empty state
        setNotifications([]);
        setUnreadCount(0);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load notifications');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // Load more notifications (pagination)
  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchNotifications(nextCursor);

      setNotifications((prev) => [...prev, ...result.items]);
      setNextCursor(result.nextCursor);
      setHasMore(result.nextCursor !== null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more notifications');
    } finally {
      setIsLoading(false);
    }
  }, [nextCursor, isLoading]);

  // Mark a single notification as read
  const markNotificationRead = useCallback(async (notificationId: string) => {
    try {
      await markAsRead(notificationId);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, read: true, readAt: new Date().toISOString() }
            : n
        )
      );

      // Decrement unread count if it was unread
      setUnreadCount((prev) => {
        const wasUnread = notifications.find((n) => n.id === notificationId && !n.read);
        return wasUnread ? Math.max(0, prev - 1) : prev;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  }, [notifications]);

  // Mark all notifications as read
  const markAllRead = useCallback(async () => {
    try {
      await markAllAsRead();

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as read');
    }
  }, []);

  // Refresh notifications
  const refresh = useCallback(async () => {
    await loadInitial();
  }, [loadInitial]);

  return {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    error,
    loadMore,
    markNotificationRead,
    markAllRead,
    refresh,
  };
}
