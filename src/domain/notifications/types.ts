/**
 * Phase E.2: Notification Types
 *
 * Type definitions for the notifications feature.
 * Notifications are DELIVERY ARTIFACTS - derived from graph events.
 */

/** Notification type */
export type NotificationType = 'reply' | 'reaction';

/** Reaction type for reaction notifications */
export type NotificationReactionType = 'like' | 'acknowledge';

/** Actor who triggered the notification */
export interface NotificationActor {
  id: string;
  name?: string;
  handle?: string;
}

/** A single notification */
export interface Notification {
  id: string;
  recipientId: string;
  actorId: string;
  assertionId: string;
  notificationType: NotificationType;
  reactionType?: NotificationReactionType;
  read: boolean;
  createdAt: string;
  readAt?: string;
  actor?: NotificationActor;
}

/** Response from GET /api/notifications */
export interface NotificationsResponse {
  items: Notification[];
  nextCursor: string | null;
}

/** Response from POST /api/notifications/:id/read */
export interface MarkReadResponse {
  success: boolean;
  alreadyRead?: boolean;
}

/** Response from POST /api/notifications/read-all */
export interface MarkAllReadResponse {
  success: boolean;
  count: number;
}

/** Response from GET /api/notifications/unread-count */
export interface UnreadCountResponse {
  count: number;
}
