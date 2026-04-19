// src/services/notification.service.ts
import { databases, ID } from '@/lib/appwrite';
import { Query, Models } from 'appwrite';

const DATABASE_ID            = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const NOTIFICATIONS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!;

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | 'appointment_confirmed'
  | 'appointment_cancelled';

export type NotificationDocument = Models.Document & {
  userId:    string;
  title:     string;
  message:   string;
  type:      NotificationType;
  read:      boolean;
  link:      string;
  createdAt: string;
};

export interface Notification {
  $id:       string;
  userId:    string;
  title:     string;
  message:   string;
  type:      NotificationType;
  read:      boolean;
  link:      string;
  createdAt: string;
  $createdAt: string;
  $updatedAt: string;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapNotification(doc: NotificationDocument): Notification {
  return {
    $id:        doc.$id,
    userId:     doc.userId,
    title:      doc.title,
    message:    doc.message,
    type:       doc.type,
    read:       doc.read,
    link:       doc.link,
    createdAt:  doc.createdAt,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

class NotificationService {
  /**
   * Create a new in-app notification for a user.
   */
  async createNotification(
    userId:  string,
    title:   string,
    message: string,
    type:    NotificationType,
    link:    string
  ): Promise<Notification> {
    try {
      const doc = await databases.createDocument<NotificationDocument>(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION,
        ID.unique(),
        {
          userId,
          title,
          message,
          type,
          read:      false,
          link,
          createdAt: new Date().toISOString(),
        }
      );
      return mapNotification(doc);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  /**
   * Get all notifications for a user, newest first (limit 20).
   */
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const response = await databases.listDocuments<NotificationDocument>(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION,
        [
          Query.equal('userId', userId),
          Query.orderDesc('createdAt'),
          Query.limit(20),
        ]
      );
      return response.documents.map(mapNotification);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  /**
   * Mark a single notification as read.
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const doc = await databases.updateDocument<NotificationDocument>(
        DATABASE_ID,
        NOTIFICATIONS_COLLECTION,
        notificationId,
        { read: true }
      );
      return mapNotification(doc);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  /**
   * Mark all notifications as read for a user.
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const notifications = await this.getUserNotifications(userId);
      const unread = notifications.filter((n) => !n.read);

      await Promise.all(
        unread.map((n) =>
          databases.updateDocument(
            DATABASE_ID,
            NOTIFICATIONS_COLLECTION,
            n.$id,
            { read: true }
          )
        )
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }
}

export const notificationService = new NotificationService();