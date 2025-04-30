import React from 'react';
import { CheckCheck, X } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import NotificationItem from './NotificationItem';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { notifications, markAllAsRead } = useNotifications();

  const handleMarkAllAsRead = async () => {
    if (user) {
      await markAllAsRead(user.id);
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50 animate-fade-in">
      <div className="p-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
          <div className="flex space-x-2">
            {notifications.filter(n => !n.read).length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1" 
                onClick={handleMarkAllAsRead}
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1" 
              onClick={onClose}
              title="Close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No notifications yet
          </div>
        ) : (
          <div>
            {notifications
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map(notification => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                />
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;