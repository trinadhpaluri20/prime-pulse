import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardView from './views/DashboardView';
import TimelineView from './views/TimelineView';
import InsightsView from './views/InsightsView';
import ChatView from './views/ChatView';
import AlertsView from './views/AlertsView';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { mockSystemStatus, mockUserProfile, mockSmartAlerts } from './mock/mockData';

// Route configuration mapping
const ROUTE_METADATA: Record<string, { title: string; description: string }> = {
  '/dashboard': {
    title: 'Competitive Intelligence',
    description: 'Monitor your competitive landscape and discover meaningful patterns.',
  },
  '/timeline': {
    title: 'Historical Timeline',
    description: 'Explore competitor activity and historical events across your competitive landscape.',
  },
  '/insights': {
    title: 'AI Insights',
    description: 'Discover patterns and signals hidden within historical competitor activity.',
  },
  '/chat': {
    title: 'AI Intelligence Chat',
    description: 'Ask questions about competitor activity, historical patterns, and strategic signals.',
  },
  '/alerts': {
    title: 'Smart Alerts',
    description: 'Important competitive signals detected across your monitored landscape.',
  },
};

const MainShell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Active route metadata
  const currentPath = location.pathname === '/' ? '/dashboard' : location.pathname;
  const pageMeta = ROUTE_METADATA[currentPath] || {
    title: 'Competitive Intern',
    description: 'AI Strategic Intelligence Platform',
  };

  const unreadAlertsCount = mockSmartAlerts.filter(a => !a.isAcknowledged).length;

  return (
    <div className="app-layout">
      {/* Reusable Left Sidebar — Official Logo, 5 Strict Nav Items, System Telemetry & User Profile */}
      <Sidebar
        systemStatus={mockSystemStatus}
        userProfile={mockUserProfile}
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        unreadAlertsCount={unreadAlertsCount}
      />

      {/* Main Workspace Area */}
      <div className="main-workspace">
        {/* Reusable Top Header */}
        <Header
          title={pageMeta.title}
          description={pageMeta.description}
          userProfile={mockUserProfile}
          systemStatus={mockSystemStatus}
          unreadCount={unreadAlertsCount}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onOpenNotifications={() => navigate('/alerts')}
        />

        {/* View Workspace - Exactly 5 routes + default redirect */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ErrorBoundary>
            <Routes>
              <Route path="/dashboard" element={<DashboardView />} />
              <Route path="/timeline" element={<TimelineView />} />
              <Route path="/insights" element={<InsightsView />} />
              <Route path="/chat" element={<ChatView />} />
              <Route path="/alerts" element={<AlertsView />} />

              {/* Default Route: Dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MainShell />
    </BrowserRouter>
  );
};

export default App;
