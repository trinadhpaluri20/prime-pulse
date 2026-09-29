import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Calendar, 
  Bot, 
  History, 
  Activity, 
  BrainCircuit,
  BarChart3,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeRoute, setActiveRoute, isOpen, setIsOpen }) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'competitors', label: 'Competitors', icon: Building2 },
    { id: 'events', label: 'Events & Timeline', icon: Calendar },
    { id: 'analysis', label: 'AI Analysis Workspace', icon: Bot, badge: 'Groq LLM' },
    { id: 'recall', label: 'Historical Recall', icon: History },
    { id: 'analytics', label: 'Signal Analytics', icon: BarChart3 },
    { id: 'health', label: 'System Health', icon: Activity },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 99
          }}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        
        {/* Brand Header using Reusable Logo */}
        <div className="sidebar-logo py-4 px-3 border-b border-slate-800/80">
          <Logo size="md" showSubtitle={true} />
        </div>

        {/* Navigation Section */}
        <div className="sidebar-nav flex-1">
          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 0.9rem 0.25rem' }}>
            Main Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveRoute(item.id);
                  setIsOpen(false);
                }}
                className={`nav-item ${active ? 'active' : ''}`}
              >
                <Icon size={18} color={active ? '#a5b4fc' : '#94a3b8'} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Profile & Logout Area */}
        <div style={{ padding: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {user && (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.75rem',
                background: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '0.6rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, overflow: 'hidden' }}>
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    flexShrink: 0
                  }}
                >
                  {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.full_name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.email}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  if (typeof addToast === 'function') addToast('Signed out successfully.', 'info');
                }}
                title="Sign Out"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.2s ease'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

          <div style={{
            padding: '0.75rem',
            background: 'rgba(15, 23, 42, 0.7)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ display: 'flex', items: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <BrainCircuit size={15} color="#34d399" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399' }}>Hindsight Persistent Memory</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.4 }}>
              Dual relational & vector memory bank active
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}
