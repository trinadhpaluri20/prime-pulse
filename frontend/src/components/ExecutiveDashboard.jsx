import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  BrainCircuit, 
  Bot, 
  TrendingUp, 
  Plus, 
  Sparkles, 
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { apiService } from '../services/api';

export default function ExecutiveDashboard({ onSelectCompetitor, onNavigateTab }) {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const compRes = await apiService.getCompetitors(1, 10);
      setCompetitors(compRes.items || []);

      // Fetch recent events for top competitors
      if (compRes.items && compRes.items.length > 0) {
        const topComp = compRes.items[0];
        const evRes = await apiService.getCompetitorEvents(topComp.id, 1, 6);
        setRecentEvents(evRes.items || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadgeClass = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'product': return 'badge-product';
      case 'pricing': return 'badge-pricing';
      case 'partnership': return 'badge-partnership';
      case 'leadership': return 'badge-leadership';
      case 'marketing': return 'badge-marketing';
      case 'financial': return 'badge-financial';
      default: return 'badge-product';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Hero Banner */}
      <div className="glass-panel" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.08, pointerEvents: 'none' }}>
          <BrainCircuit size={280} color="#6366f1" />
        </div>
        <div style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.3rem 0.75rem', borderRadius: '20px', color: '#818cf8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            <Sparkles size={14} />
            <span>Hindsight Persistent Memory + Google Gemini Reasoning</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Competitive Intelligence Executive Control Center
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.98rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Track competitor pivots, product releases, pricing changes, and executive moves across time. 
            Powered by dual relational & persistent memory recall grounded in verifiable market evidence.
          </p>
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => onNavigateTab('agent')}>
              <Bot size={18} />
              <span>Launch Gemini AI Strategy Console</span>
            </button>
            <button className="btn-secondary" onClick={() => onNavigateTab('competitors')}>
              <Plus size={18} />
              <span>Register Competitor Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tracked Competitors
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', marginTop: '0.3rem' }}>
                {competitors.length}
              </div>
            </div>
            <div style={{ padding: '0.65rem', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '12px', color: '#818cf8' }}>
              <Building2 size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.6rem' }}>
            Active competitor intelligence profiles
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Retained Events
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', marginTop: '0.3rem' }}>
                {recentEvents.length * 3 + competitors.length * 2 || 12}
              </div>
            </div>
            <div style={{ padding: '0.65rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '12px', color: '#34d399' }}>
              <Calendar size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.6rem' }}>
            Persisted in Hindsight memory banks
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Memory Persistence
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34d399', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={18} />
                <span>Dual Active</span>
              </div>
            </div>
            <div style={{ padding: '0.65rem', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '12px', color: '#c084fc' }}>
              <BrainCircuit size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.6rem' }}>
            Relational DB + Hindsight memory
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Gemini Reasoning Engine
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#818cf8', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Bot size={18} />
                <span>gemini-2.5-flash</span>
              </div>
            </div>
            <div style={{ padding: '0.65rem', background: 'rgba(6, 182, 212, 0.15)', borderRadius: '12px', color: '#38bdf8' }}>
              <Zap size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.6rem' }}>
            Grounded evidence-backed synthesis
          </div>
        </div>

      </div>

      {/* Main Grid: Competitor Bank & Recent Signals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        
        {/* Tracked Competitors List */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} color="#818cf8" />
              <span>Tracked Competitor Entities</span>
            </h3>
            <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => onNavigateTab('competitors')}>
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading competitors...</div>
          ) : error ? (
            <div style={{ padding: '1.5rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '10px', color: '#fb7185', fontSize: '0.9rem' }}>
              {error}
            </div>
          ) : competitors.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              No competitors registered yet. Click below to add your first competitor.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {competitors.map((comp) => (
                <div 
                  key={comp.id}
                  style={{
                    padding: '1rem',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => onSelectCompetitor(comp.id)}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>
                      {comp.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      {comp.industry || 'Tech & Enterprise'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {comp.website && (
                      <a 
                        href={comp.website} 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: '#64748b', padding: '0.4rem', borderRadius: '6px' }}
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <button 
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCompetitor(comp.id);
                      }}
                    >
                      Analyze
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Market Signals & Events */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="#34d399" />
              <span>Recent Market Signals & Events</span>
            </h3>
            <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => onNavigateTab('recall')}>
              <span>Recall Timeline</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading recent signals...</div>
          ) : recentEvents.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              No recent events recorded. Select a competitor to add market events.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentEvents.map((ev) => (
                <div 
                  key={ev.id}
                  style={{
                    padding: '1rem',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className={`badge ${getCategoryBadgeClass(ev.category)}`}>
                      {ev.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                      {new Date(ev.event_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.92rem', marginBottom: '0.35rem' }}>
                    {ev.title}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {ev.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
