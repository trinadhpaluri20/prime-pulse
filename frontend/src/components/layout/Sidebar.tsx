import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Logo from '../Logo.tsx';
import { SystemStatus, UserProfile } from '../../types';
import { 
  LayoutDashboard, 
  Clock, 
  BrainCircuit, 
  MessageSquare, 
  AlertTriangle,
  X
} from 'lucide-react';

interface SidebarProps {
  systemStatus: SystemStatus;
  userProfile: UserProfile;
  isOpen?: boolean;
  onClose?: () => void;
  unreadAlertsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  systemStatus: _systemStatus,
  userProfile,
  isOpen = false,
  onClose,
  unreadAlertsCount = 3,
}) => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/timeline', label: 'Timeline', icon: Clock },
    { path: '/insights', label: 'AI Insights', icon: BrainCircuit },
    { path: '/chat', label: 'AI Chat', icon: MessageSquare },
    { path: '/alerts', label: 'Smart Alerts', icon: AlertTriangle, count: unreadAlertsCount },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 95,
          }}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        
        {/* Top Header: Official Competitive Intern Logo */}
        <div className="sidebar-header" style={{ justifyContent: 'space-between' }}>
          <Logo size="md" showTagline={true} />
          {onClose && (
            <button
              onClick={onClose}
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.25rem',
              }}
              className="mobile-close-btn"
              aria-label="Close navigation sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="sidebar-nav" aria-label="Main Navigation">
          <div 
            style={{ 
              fontSize: '0.66rem', 
              fontWeight: 700, 
              color: 'var(--text-muted)', 
              letterSpacing: '0.08em', 
              textTransform: 'uppercase',
              padding: '0.4rem 0.5rem 0.35rem' 
            }}
          >
            Intelligence Platform
          </div>

          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/dashboard' && location.pathname === '/');
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`nav-item-btn ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <Icon 
                  size={16} 
                  style={{ 
                    color: isActive ? '#00D2FF' : 'var(--text-secondary)',
                    transition: 'color 0.15s ease',
                    flexShrink: 0
                  }} 
                />
                <span style={{ flex: 1, letterSpacing: '-0.01em' }}>{item.label}</span>

                {item.count && item.count > 0 ? (
                  <span 
                    style={{ 
                      fontSize: '0.64rem', 
                      fontWeight: 700,
                      background: 'rgba(244, 63, 94, 0.15)', 
                      color: '#FB7185',
                      border: '1px solid rgba(244, 63, 94, 0.35)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px'
                    }}
                  >
                    {item.count}
                  </span>
                ) : item.badge ? (
                  <span className="nav-badge-pill">{item.badge}</span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section: User Profile */}
        <div className="sidebar-footer">
          {/* User Profile */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '0.55rem 0.7rem', 
              background: 'rgba(7, 11, 27, 0.6)', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: 'var(--radius-md)' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '6px', 
                  background: 'var(--gradient-brand)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  flexShrink: 0
                }}
              >
                {userProfile.initials}
              </div>

              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userProfile.name}
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userProfile.role}
                </div>
              </div>
            </div>
          </div>

        </div>

      </aside>
    </>
  );
};

export default Sidebar;
