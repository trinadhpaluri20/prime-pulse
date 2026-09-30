import React from 'react';
import { UserProfile, SystemStatus } from '../../types';
import { Search, Bell, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  description?: string;
  userProfile: UserProfile;
  systemStatus?: SystemStatus;
  unreadCount?: number;
  onOpenMobileMenu?: () => void;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  description,
  userProfile,
  systemStatus,
  unreadCount = 0,
  onOpenMobileMenu,
  onOpenNotifications,
}) => {
  return (
    <header className="app-header">
      {/* Left: Mobile Navigation Button & Page Title / Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              padding: '0.35rem',
              borderRadius: '6px',
            }}
            className="md-mobile-menu-btn"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
        )}

        <div>
          <h1
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-0.015em',
              lineHeight: 1.25,
            }}
          >
            {title}
          </h1>
          {description && (
            <p
              style={{
                fontSize: '0.76rem',
                color: 'var(--text-secondary)',
                marginTop: '1px',
                lineHeight: 1.3,
              }}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Right Controls: Telemetry Status, Search, Notifications, User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        
        {/* System Status: ● Intelligence Agent Active */}
        <div
          className="lg-header-status"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.3rem 0.7rem',
            borderRadius: '20px',
            background: 'rgba(0, 210, 255, 0.08)',
            border: '1px solid rgba(0, 210, 255, 0.22)',
          }}
          title="Intelligence Agent Active"
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#00D2FF',
              boxShadow: '0 0 8px rgba(0, 210, 255, 0.8)',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 600,
              color: '#F1F5F9',
              letterSpacing: '0.01em',
            }}
          >
            Intelligence Agent Active
          </span>
        </div>

        {/* Minimal Search Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(7, 13, 36, 0.75)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.42rem 0.75rem',
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease',
          }}
          tabIndex={0}
          role="button"
          aria-label="Search signals"
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
        >
          <Search size={14} color="#00D2FF" />
          <span className="md-search-text" style={{ display: 'none' }}>
            Search signals...
          </span>
          <span
            style={{
              fontSize: '0.66rem',
              fontFamily: 'var(--font-mono)',
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '0.1rem 0.35rem',
              borderRadius: '4px',
              color: 'var(--text-muted)',
              marginLeft: '0.25rem',
            }}
          >
            ⌘K
          </span>
        </div>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          style={{
            background: 'rgba(7, 13, 36, 0.75)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.45rem',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 0.15s ease, color 0.15s ease',
          }}
          aria-label={`Notifications (${unreadCount} unread)`}
          title="Notifications & Alerts"
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-hover)';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F43F5E, #D946EF)',
                color: '#FFFFFF',
                fontSize: '0.6rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 6px rgba(244, 63, 94, 0.6)',
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            paddingLeft: '0.5rem',
            borderLeft: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.78rem',
              boxShadow: '0 2px 8px rgba(0, 210, 255, 0.25)',
              flexShrink: 0,
            }}
            aria-label={userProfile.name}
          >
            {userProfile.initials}
          </div>

          <div className="md-user-info" style={{ display: 'none' }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#FFFFFF',
                display: 'block',
                lineHeight: 1.2,
              }}
            >
              {userProfile.name}
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                color: 'var(--text-muted)',
              }}
            >
              {userProfile.role}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
