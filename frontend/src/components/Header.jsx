import React from 'react';
import { 
  BarChart3, 
  Bot, 
  History, 
  Building2, 
  BrainCircuit, 
  ShieldCheck, 
  Activity,
  Zap
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, health }) {
  const tabs = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: BarChart3 },
    { id: 'agent', label: 'AI Strategy Console', icon: Bot, badge: 'Gemini AI' },
    { id: 'recall', label: 'Historical Recall', icon: History },
    { id: 'competitors', label: 'Competitors & Signals', icon: Building2 },
    { id: 'memory', label: 'Memory Explorer', icon: BrainCircuit, badge: 'Hindsight' },
  ];

  const overallStatus = health?.status || 'loading';

  return (
    <header className="header-bar">
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
          }}>
            <Zap size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', background: 'linear-gradient(135deg, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Competitive Intelligence Agent
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
              Persistent Memory Intelligence Platform
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', padding: '0.2rem' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-tab ${isActive ? 'active' : ''}`}
              >
                <Icon size={17} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                    color: isActive ? '#ffffff' : '#818cf8',
                    fontWeight: 700
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Health Interactive Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(15, 23, 42, 0.8)', padding: '0.25rem 0.5rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.78rem' }}>
          
          <button 
            className="telemetry-btn"
            onClick={() => setActiveTab('health')}
            title="Click to view System Health & Telemetry"
          >
            <span className={`status-dot ${overallStatus}`} />
            <span style={{ color: '#cbd5e1', fontWeight: 600 }}>
              {overallStatus === 'healthy' ? 'System Healthy' : overallStatus === 'degraded' ? 'Degraded Mode' : 'Connecting...'}
            </span>
          </button>

          <span style={{ color: '#475569', fontSize: '0.75rem' }}>|</span>

          <button 
            className="telemetry-btn"
            onClick={() => setActiveTab('recall')}
            title="Click to view Historical Recall & Hindsight Memory"
            style={{ color: health?.hindsight === 'connected' ? '#34d399' : '#fbbf24', fontWeight: 600 }}
          >
            <BrainCircuit size={13} />
            <span>Hindsight: <strong>{health?.hindsight || 'checking'}</strong></span>
          </button>

          <span style={{ color: '#475569', fontSize: '0.75rem' }}>|</span>

          <button 
            className="telemetry-btn"
            onClick={() => setActiveTab('agent')}
            title="Click to launch Gemini AI Strategy Console"
            style={{ color: health?.gemini === 'configured' ? '#818cf8' : '#fbbf24', fontWeight: 600 }}
          >
            <Bot size={13} />
            <span>Gemini: <strong>{health?.gemini || 'checking'}</strong></span>
          </button>
        </div>

      </div>
    </header>
  );
}
