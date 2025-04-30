import React from 'react';
import { Package, Search, Home, User, Bell, Settings, List, BarChart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  currentView: string;
  onChangeView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  currentView, 
  onChangeView 
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const userNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { id: 'report-lost', label: 'Report Lost Item', icon: <Package className="w-5 h-5" /> },
    { id: 'report-found', label: 'Report Found Item', icon: <Search className="w-5 h-5" /> },
    { id: 'my-items', label: 'My Items', icon: <List className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  const adminNavItems = [
    { id: 'admin-dashboard', label: 'Admin Dashboard', icon: <BarChart className="w-5 h-5" /> },
    { id: 'admin-items', label: 'All Items', icon: <Package className="w-5 h-5" /> },
    { id: 'admin-matches', label: 'Review Matches', icon: <Search className="w-5 h-5" /> },
    { id: 'admin-users', label: 'Manage Users', icon: <User className="w-5 h-5" /> },
    { id: 'admin-settings', label: 'System Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-20 w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 h-16 flex items-center px-4 border-b border-gray-200">
          <div className="flex items-center">
            {/* Logo is in the Header component */}
          </div>
        </div>
        
        <nav className="flex-1 mt-5 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`
                w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                ${currentView === item.id
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
              onClick={() => onChangeView(item.id)}
            >
              <span className="mr-3 text-gray-500">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;