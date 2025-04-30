import React, { useState } from 'react';
import { BellRing, Menu, X, MapPin, LogOut, Package, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import Button from '../common/Button';
import Badge from '../common/Badge';
import NotificationDropdown from '../notifications/NotificationDropdown';

interface HeaderProps {
  onNavToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavToggle }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <header className="bg-white border-b border-gray-200 z-20">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Left side */}
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 mr-2"
              onClick={onNavToggle}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center">
              <MapPin className="w-8 h-8 text-primary-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">Lost & Found</h1>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center">
            {user ? (
              <>
                {/* Notifications */}
                <div className="relative ml-4">
                  <button
                    type="button"
                    className="relative inline-flex items-center justify-center rounded-full p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onClick={toggleNotifications}
                  >
                    <BellRing className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center rounded-full bg-error-500 text-white text-xs">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <NotificationDropdown onClose={() => setShowNotifications(false)} />
                  )}
                </div>

                {/* User menu */}
                <div className="ml-4 flex items-center">
                  <div className="flex items-center">
                    <div className="hidden md:flex flex-col items-end mr-3">
                      <span className="text-sm font-medium text-gray-900">{user.username}</span>
                      <Badge 
                        variant={user.role === 'admin' ? 'primary' : 'gray'}
                        className="mt-0.5"
                      >
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </Badge>
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-semibold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hidden md:flex"
                          onClick={logout}
                        >
                          <LogOut className="h-4 w-4 mr-1" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">Login</Button>
                <Button>Sign Up</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;