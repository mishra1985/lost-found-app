import React from 'react';
import { Bell, Search, PackageCheck } from 'lucide-react';
import { Notification } from '../../types';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from '../../utils/formatDate';

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { markAsRead } = useNotifications();

  const handleClick = async () => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // In a real app, we'd navigate to the relevant page/item
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'match':
        return <Search className="w-5 h-5 text-primary-500" />;
      case 'status':
        return <PackageCheck className="w-5 h-5 text-success-500" />;
      case 'system':
        return <Bell className="w-5 h-5 text-warning-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div 
      className={`
        p-3 border-b border-gray-100 cursor-pointer transition-colors
        ${notification.read ? 'bg-white' : 'bg-blue-50'}
        hover:bg-gray-50
      `}
      onClick={handleClick}
    >
      <div className="flex">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${notification.read ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatDistanceToNow(new Date(notification.created_at))}
          </p>
        </div>
        {!notification.read && (
          <div className="ml-2 flex-shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-primary-500"></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;