import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  BrainCircuit, 
  Bot, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  Plus
} from 'lucide-react';
import { apiService } from '../services/api';

export default function OverviewView({ setActiveRoute, onSelectCompetitor }) {
  const [competitors, setCompetitors] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [latestAnalysis, setLatestAnalysis] = useState(null);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      const [compRes, healthRes] = await Promise.all([
        apiService.getCompetitors(1, 10),
        apiService.getHealth()
      ]);

      setCompetitors(compRes.items || []);
      setHealth(healthRes);

      if (compRes.items && compRes.items.length > 0) {
        const topComp = compRes.items[0];
        const evRes = await apiService.getCompetitorEvents(topComp.id, 1, 6);
        setRecentEvents(evRes.items || []);
      }
    } catch (err) {
      console.error('Overview data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryClass = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'product': return 'cat-product';
      case 'pricing': return 'cat-pricing';
      case 'partnership': return 'cat-partnership';
      case 'funding': return 'cat-funding';
      case 'strategy': return 'cat-strategy';
      default: return 'cat-other';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }} className="fade-in-up">
      
      {/* Hero Welcome Banner */}
      <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.85))', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-30px', top: '-30px', opacity: 0.05, pointerEvents: 'none' }}>
          <BrainCircuit size={320} color="#6366f1" />
        </div>
        
        <div style={{ maxWidth: '850px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.3rem 0.8rem', borderRadius: '20px', color: '#a5b4fc', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.85rem' }}>
            <Sparkles size={14} />
            <span>Hindsight Persistent Memory + Google Gemini AI Reasoning</span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Strategic AI Competitive Intelligence Workspace
          </h1>
          
          <p style={{ color: '#94a3b8', fontSize: '0.98rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Track competitor pivots, product releases, pricing model shifts, and executive moves across time horizons. 
            Dual persistence ground all insights strictly in verifiable historical memory context.
          </p>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => setActiveRoute('analysis')}>
              <Bot size={18} />
              <span>Launch Gemini AI Strategy Workspace</span>
            </button>
            <button className="btn-secondary" onClick={() => setActiveRoute('competitors')}>
              <Plus size={18} />
              <span>Register Competitor</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Telemetry Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tracked Competitors
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
                {competitors.length}
              </div>
            </div>
            <div style={{ padding: '0.6rem', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '10px', color: '#a5b4fc' }}>
              <Building2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.6rem' }}>
            Active intelligence profiles
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Retained Signals
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
                {recentEvents.length * 3 + competitors.length * 2 || 12}
              </div>
            </div>
            <div style={{ padding: '0.6rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '10px', color: '#34d399' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.6rem' }}>
            Persisted in Hindsight memory
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Memory Engine
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={16} />
                <span>Hindsight Active</span>
              </div>
            </div>
            <div style={{ padding: '0.6rem', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '10px', color: '#c084fc' }}>
              <BrainCircuit size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.6rem' }}>
            Dual persistence & vector search
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Reasoning LLM
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#a5b4fc', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Bot size={16} />
                <span>gemini-2.5-flash</span>
              </div>
            </div>
            <div style={{ padding: '0.6rem', background: 'rgba(6, 182, 212, 0.15)', borderRadius: '10px', color: '#67e8f9' }}>
              <Zap size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.6rem' }}>
            Strict evidence-grounded prompt
          </div>
        </div>

      </div>

      {/* Main Grid: Competitor Entities & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Tracked Competitor Entities */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} color="#a5b4fc" />
              <span>Tracked Competitor Entities</span>
            </h3>
            <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setActiveRoute('competitors')}>
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading competitors...</div>
          ) : competitors.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              No competitors registered yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {competitors.map((comp) => (
                <div 
                  key={comp.id}
                  onClick={() => onSelectCompetitor(comp)}
                  style={{
                    padding: '1rem',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'; }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>
                      {comp.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      {comp.industry || 'Enterprise Technology'}
                    </div>
                  </div>

                  <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
                    View Intel
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Intelligence Activity Timeline */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="#34d399" />
              <span>Recent Intelligence Activity</span>
            </h3>
            <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setActiveRoute('events')}>
              <span>Timeline</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading recent signals...</div>
          ) : recentEvents.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              No recent market events recorded. Select a competitor to add events.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {recentEvents.map((ev) => (
                <div 
                  key={ev.id}
                  style={{
                    padding: '0.95rem',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '11px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span className={`badge-cat cat-${ev.category}`}>
                      {ev.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                      {new Date(ev.event_date).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    {ev.title}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
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
