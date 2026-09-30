import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Bot, 
  Activity, 
  BrainCircuit, 
  LogOut, 
  ChevronDown, 
  User as UserIcon, 
  Settings 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Topbar({ activeRoute, setActiveRoute, health, setIsMobileOpen }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setDropdownOpen(false);
    logout();
    addToast('Signed out successfully.', 'info');
    navigate('/login', { replace: true });
  };

  const getPageTitle = () => {
    switch (activeRoute) {
      case 'overview': return { title: 'Dashboard Overview', sub: 'High-level competitive signals, memory stats & strategic metrics' };
      case 'timeline': 
      case 'events': return { title: 'Historical Timeline', sub: 'Chronological market events dual-persisted across DB and Hindsight memory' };
      case 'insights': 
      case 'analysis': return { title: 'AI Insights / Pattern Detection', sub: 'Automated pattern detection & evidence-grounded strategic reasoning' };
      case 'chat': return { title: 'AI Chat with Hindsight Memory', sub: 'Conversational strategic Q&A with dual vector and relational memory grounding' };
      case 'alerts': return { title: 'Smart Alerts', sub: 'Real-time threat monitoring, price drop alerts & watchlist triggers' };
      default: return { title: 'Competitive Intern', sub: 'AI Strategic Intelligence Platform' };
    }
  };

  const pageInfo = getPageTitle();
  const overallStatus = health?.status || 'loading';

  const userInitial = user?.full_name ? user.full_name[0].toUpperCase() : 'U';

  return (
    <header className="topbar">
      
      {/* Left: Mobile Toggle & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          className="btn-secondary" 
          style={{ padding: '0.4rem', display: 'none' }}
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
            {pageInfo.title}
          </h1>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'none', minWidth: '400px' }}>
            {pageInfo.sub}
          </p>
        </div>
      </div>

      {/* Right: Telemetry Controls & User Profile Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        
        {/* Telemetry Status Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(15, 23, 42, 0.7)', padding: '0.25rem 0.5rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.78rem' }}>
          
          {/* 1. System Health Control */}
          <button 
            className="telemetry-btn"
            onClick={() => setActiveRoute('health')}
            title="Click to view System Health & Telemetry"
          >
            <span className={`status-pill ${overallStatus}`}>
              {overallStatus === 'healthy' ? 'System Healthy' : overallStatus === 'degraded' ? 'Degraded' : 'Checking'}
            </span>
          </button>

          <span style={{ color: '#475569', fontSize: '0.75rem' }}>|</span>

          {/* 2. Hindsight Memory Control */}
          <button 
            className="telemetry-btn"
            onClick={() => setActiveRoute('recall')}
            title="Click to view Historical Recall & Hindsight Memory"
            style={{ color: health?.hindsight === 'connected' ? '#34d399' : '#fbbf24', fontWeight: 600 }}
          >
            <BrainCircuit size={13} />
            <span>Hindsight</span>
          </button>

          <span style={{ color: '#475569', fontSize: '0.75rem' }}>|</span>

          {/* 3. Groq AI Control */}
          <button 
            className="telemetry-btn"
            onClick={() => setActiveRoute('analysis')}
            title="Click to launch Groq AI Strategy Workspace"
            style={{ color: (health?.groq === 'configured' || health?.groq === 'connected') ? '#818cf8' : '#fbbf24', fontWeight: 600 }}
          >
            <Bot size={13} />
            <span>Groq</span>
          </button>

        </div>

        {/* 4. AI Analysis CTA Button */}
        {activeRoute !== 'analysis' && (
          <button className="btn-primary" onClick={() => setActiveRoute('analysis')} title="Launch Groq AI Strategy Workspace">
            <Bot size={16} />
            <span>AI Analysis</span>
          </button>
        )}

        {/* 5. Authenticated User Profile Dropdown */}
        {user && (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid var(--border-light)',
                borderRadius: '10px',
                padding: '0.35rem 0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title="User Account & Settings"
            >
              <div 
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '7px',
                  background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  flexShrink: 0,
                }}
              >
                {userInitial}
              </div>
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.2 }}>
                  {user.full_name || 'Analyst'}
                </span>
              </div>
              <ChevronDown size={14} color="#94a3b8" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
            </button>

            {/* Profile Dropdown Menu */}
            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: '240px',
                  background: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '0.65rem',
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.6)',
                  zIndex: 1000,
                  animation: 'fadeInSlide 0.2s ease-out',
                }}
              >
                {/* User Identity Info */}
                <div style={{ padding: '0.5rem 0.6rem 0.65rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '0.4rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', wordBreak: 'break-word' }}>
                    {user.full_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '1px', wordBreak: 'break-all' }}>
                    {user.email}
                  </div>
                </div>

                {/* Menu Items */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setActiveRoute('health');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.65rem',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#cbd5e1',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Settings size={15} color="#94a3b8" />
                  <span>Account & Infrastructure</span>
                </button>

                <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '0.35rem 0' }} />

                <button
                  onClick={handleSignOut}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.65rem',
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                    borderRadius: '8px',
                    color: '#fb7185',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'}
                >
                  <LogOut size={15} color="#fb7185" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>

    </header>
  );
}
