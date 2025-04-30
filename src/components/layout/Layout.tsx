import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onChangeView: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {isAuthenticated && (
        <Sidebar 
          isOpen={sidebarOpen} 
          currentView={currentView}
          onChangeView={(view) => {
            onChangeView(view);
            setSidebarOpen(false);
          }}
        />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden lg:pl-64">
        <Header onNavToggle={toggleSidebar} />
        
        <main 
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
          onClick={() => setSidebarOpen(false)}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;