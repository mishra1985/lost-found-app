import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ItemProvider } from './contexts/ItemContext';
import { MatchProvider } from './contexts/MatchContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/layout/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ReportItem from './pages/ReportItem';
import MyItems from './pages/MyItems';
import AdminDashboard from './pages/AdminDashboard';
import AdminItems from './pages/AdminItems';
import AdminMatches from './pages/AdminMatches';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  // Reset view to dashboard when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      // Set different dashboard based on user role
      setCurrentView(user?.role === 'admin' ? 'admin-dashboard' : 'dashboard');
    }
  }, [isAuthenticated, user]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <Auth />;
  }

  // Render the appropriate view based on currentView state
  const renderView = () => {
    // User views
    if (user?.role === 'user') {
      switch (currentView) {
        case 'dashboard':
          return <Dashboard />;
        case 'report-lost':
          return <ReportItem type="lost" />;
        case 'report-found':
          return <ReportItem type="found" />;
        case 'my-items':
          return <MyItems />;
        default:
          return <Dashboard />;
      }
    }
    
    // Admin views
    if (user?.role === 'admin') {
      switch (currentView) {
        case 'admin-dashboard':
          return <AdminDashboard />;
        case 'admin-items':
          return <AdminItems />;
        case 'admin-matches':
          return <AdminMatches />;
        default:
          return <AdminDashboard />;
      }
    }
    
    // Fallback view
    return <Dashboard />;
  };

  return (
    <ItemProvider currentUser={user}>
      <MatchProvider>
        <NotificationProvider userId={user?.id || null}>
          <Layout currentView={currentView} onChangeView={setCurrentView}>
            {renderView()}
          </Layout>
        </NotificationProvider>
      </MatchProvider>
    </ItemProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;