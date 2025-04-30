import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { notificationStorage } from '../utils/supabaseStorage';
import { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  getUserNotifications: (user_id: string) => Notification[];
  markAsRead: (notificationId: string) => Promise<Notification | null>;
  markAllAsRead: (user_id: string) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode; userId: string | null }> = ({ children, userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!userId) {
        setNotifications([]);
        setUnreadCount(0);
        setIsLoading(false);
        return;
      }
      try {
        const userNotifications = await notificationStorage.getByUserId(userId);
        setNotifications(userNotifications);
        setUnreadCount(userNotifications.filter(n => !n.read).length);
      } catch (err) {
        console.error('❌ Failed to load notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };
    loadNotifications();
  }, [userId]);

  const getUserNotifications = (user_id: string): Notification[] => {
    return notifications.filter(n => n.user_id === user_id);
  };

  const markAsRead = async (notificationId: string): Promise<Notification | null> => {
    setIsLoading(true);
    try {
      const updated = await notificationStorage.markAsRead(notificationId);
      if (updated) {
        setNotifications(prev =>
          prev.map(n => (n.id === notificationId ? updated : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return updated;
    } catch (err) {
      console.error('❌ Failed to mark notification as read:', err);
      setError('Failed to mark as read');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async (user_id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await notificationStorage.markAllAsRead(user_id);
      if (result) {
        const updated = await notificationStorage.getByUserId(user_id);
        setNotifications(updated);
        setUnreadCount(0);
      }
      return result;
    } catch (err) {
      console.error('❌ Failed to mark all notifications as read:', err);
      setError('Failed to mark all as read');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        getUserNotifications,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
