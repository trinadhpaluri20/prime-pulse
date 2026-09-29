import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import OverviewView from './views/OverviewView';
import CompetitorsView from './views/CompetitorsView';
import CompetitorDetailView from './views/CompetitorDetailView';
import EventsTimelineView from './views/EventsTimelineView';
import AIAnalysisWorkspaceView from './views/AIAnalysisWorkspaceView';
import HistoricalRecallView from './views/HistoricalRecallView';
import AnalyticsView from './views/AnalyticsView';
import SystemHealthView from './views/SystemHealthView';
import LoginView from './views/LoginView';
import SignupView from './views/SignupView';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { apiService } from './services/api';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center text-cyan-400 font-semibold text-sm">
        <div className="flex items-center gap-3">
          <svg className="animate-spin w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Authenticating session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public Route Component (Redirects to dashboard if logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center text-cyan-400 font-semibold text-sm">
        <div className="flex items-center gap-3">
          <svg className="animate-spin w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading platform...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/overview" replace />;
  }

  return children;
}

function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeRoute, setActiveRoute] = useState('overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [health, setHealth] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  
  // Selected competitor for detail view
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);

  // Sync active route with URL path
  useEffect(() => {
    const path = location.pathname.substring(1);
    if (path === 'system-health' || path === 'health') {
      setActiveRoute('health');
    } else if (['overview', 'competitors', 'events', 'analysis', 'recall', 'analytics'].includes(path)) {
      setActiveRoute(path);
    } else if (path === '' || path === 'dashboard') {
      navigate('/overview', { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    fetchHealthData();
    fetchCompetitorList();

    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealthData = async () => {
    try {
      const data = await apiService.getHealth();
      setHealth(data);
    } catch (err) {
      setHealth({ status: 'error', database: 'disconnected', hindsight: 'unknown', gemini: 'unknown' });
    }
  };

  const fetchCompetitorList = async () => {
    try {
      const data = await apiService.getCompetitors(1, 100);
      setCompetitors(data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNavigate = (route) => {
    setSelectedCompetitor(null);
    setActiveRoute(route);
    const targetPath = route === 'health' ? '/system-health' : `/${route}`;
    navigate(targetPath);
  };

  const handleSelectCompetitor = (comp) => {
    setSelectedCompetitor(comp);
    setActiveRoute('competitor_detail');
  };

  const handleLaunchAnalysis = (comp) => {
    setSelectedCompetitor(comp);
    setActiveRoute('analysis');
    navigate('/analysis');
  };

  return (
    <div className="app-shell">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeRoute={activeRoute === 'competitor_detail' ? 'competitors' : activeRoute}
        setActiveRoute={handleNavigate}
        isOpen={isMobileOpen}
        setIsOpen={setIsMobileOpen}
      />

      {/* Main Workspace Area */}
      <div className="main-workspace">
        
        {/* Topbar Telemetry Header */}
        <Topbar 
          activeRoute={activeRoute}
          setActiveRoute={handleNavigate}
          health={health}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* View Workspace */}
        <main className="content-area">
          {activeRoute === 'overview' && (
            <OverviewView 
              setActiveRoute={handleNavigate}
              onSelectCompetitor={handleSelectCompetitor}
            />
          )}

          {activeRoute === 'competitors' && (
            <CompetitorsView 
              onSelectCompetitor={handleSelectCompetitor}
              onLaunchAnalysis={handleLaunchAnalysis}
            />
          )}

          {activeRoute === 'competitor_detail' && (
            <CompetitorDetailView 
              competitor={selectedCompetitor}
              onBack={() => {
                setSelectedCompetitor(null);
                setActiveRoute('competitors');
                navigate('/competitors');
              }}
              onLaunchAnalysis={handleLaunchAnalysis}
            />
          )}

          {activeRoute === 'events' && (
            <EventsTimelineView 
              competitors={competitors}
            />
          )}

          {activeRoute === 'analysis' && (
            <AIAnalysisWorkspaceView 
              initialCompetitor={selectedCompetitor}
              competitors={competitors}
            />
          )}

          {activeRoute === 'recall' && (
            <HistoricalRecallView 
              competitors={competitors}
            />
          )}

          {activeRoute === 'analytics' && (
            <AnalyticsView 
              competitors={competitors}
            />
          )}

          {activeRoute === 'health' && (
            <SystemHealthView />
          )}
        </main>

      </div>

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginView />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignupView />
                </PublicRoute>
              }
            />

            {/* Protected Dashboard Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
