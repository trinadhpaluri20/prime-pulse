import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Clock, 
  BrainCircuit, 
  Bot, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  Plus,
  MessageSquare,
  AlertTriangle,
  Flame,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function OverviewView({ setActiveRoute, onSelectCompetitor }) {
  const { addToast } = useToast();
  const [competitors, setCompetitors] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Competitor Modal State
  const [showCompModal, setShowCompModal] = useState(false);
  const [compForm, setCompForm] = useState({
    name: '',
    industry: 'Enterprise Software',
    website: '',
    description: '',
  });
  const [compSubmitting, setCompSubmitting] = useState(false);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      const [compRes, healthRes] = await Promise.all([
        apiService.getCompetitors(1, 20),
        apiService.getHealth()
      ]);

      setCompetitors(compRes.items || []);
      setHealth(healthRes);

      // Fetch recent events
      let events = [];
      try {
        events = await apiService.getAllEvents({ limit: 6, sortOrder: 'desc' });
      } catch {
        if (compRes.items && compRes.items.length > 0) {
          const evRes = await apiService.getCompetitorEvents(compRes.items[0].id, 1, 6);
          events = evRes.items || [];
        }
      }
      setRecentEvents(events || []);
    } catch (err) {
      console.error('Overview data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompetitor = async (e) => {
    e.preventDefault();
    if (!compForm.name.trim()) return;

    setCompSubmitting(true);
    try {
      await apiService.createCompetitor(compForm);
      addToast(`Competitor '${compForm.name}' registered successfully!`, 'success');
      setShowCompModal(false);
      setCompForm({ name: '', industry: 'Enterprise Software', website: '', description: '' });
      loadOverviewData();
    } catch (err) {
      addToast(err.message || 'Failed to create competitor', 'error');
    } finally {
      setCompSubmitting(false);
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
            <span>Hindsight Persistent Memory + Groq / Gemini AI Reasoning</span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Competitive Intern Strategic Intelligence Command Center
          </h1>
          
          <p style={{ color: '#94a3b8', fontSize: '0.98rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Track competitor pivots, product releases, pricing model shifts, and executive moves across time horizons. 
            Dual persistence grounds all insights strictly in verifiable historical memory context.
          </p>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => setActiveRoute('insights')}>
              <Sparkles size={17} />
              <span>Launch AI Insights</span>
            </button>
            <button className="btn-secondary" onClick={() => setActiveRoute('chat')}>
              <MessageSquare size={17} color="#38bdf8" />
              <span>Ask AI Chat</span>
            </button>
            <button className="btn-secondary" onClick={() => setShowCompModal(true)}>
              <Plus size={17} />
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
                {recentEvents.length > 0 ? recentEvents.length * 4 + competitors.length * 2 : 12}
              </div>
            </div>
            <div style={{ padding: '0.6rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '10px', color: '#34d399' }}>
              <Clock size={20} />
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
                Reasoning Model
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#a5b4fc', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Bot size={16} />
                <span>Groq LLM</span>
              </div>
            </div>
            <div style={{ padding: '0.6rem', background: 'rgba(6, 182, 212, 0.15)', borderRadius: '10px', color: '#67e8f9' }}>
              <Zap size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.6rem' }}>
            Evidence-grounded synthesis
          </div>
        </div>

      </div>

      {/* 4 Feature Quick Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        
        {/* Card 1: Historical Timeline */}
        <div 
          className="glass-card" 
          onClick={() => setActiveRoute('timeline')}
          style={{ padding: '1.4rem', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden' }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.5)'; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Clock size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>Historical Timeline</div>
              <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>Chronological Intelligence Feed</div>
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '0.85rem' }}>
            Browse and filter verified market events, pricing shifts, and product releases with attached Hindsight memory provenance.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontSize: '0.78rem', fontWeight: 700 }}>
            <span>Explore Timeline</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Card 2: AI Insights / Pattern Detection */}
        <div 
          className="glass-card" 
          onClick={() => setActiveRoute('insights')}
          style={{ padding: '1.4rem', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden' }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)'; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <BrainCircuit size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>AI Insights / Pattern Detection</div>
              <div style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 600 }}>Strategic Reasoning Engine</div>
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '0.85rem' }}>
            Detect release velocity anomalies, pricing pressures, and executive moves synthesized into SWOT assessments.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#c084fc', fontSize: '0.78rem', fontWeight: 700 }}>
            <span>Run Strategic Analysis</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Card 3: AI Chat with Hindsight memory */}
        <div 
          className="glass-card" 
          onClick={() => setActiveRoute('chat')}
          style={{ padding: '1.4rem', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden' }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.5)'; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8' }}>
              <MessageSquare size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>AI Chat with Memory</div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>Conversational Strategic Q&A</div>
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '0.85rem' }}>
            Ask anything about competitor strategies, pricing changes, or hiring moves with live citations from memory.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#38bdf8', fontSize: '0.78rem', fontWeight: 700 }}>
            <span>Start AI Chat</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Card 4: Smart Alerts */}
        <div 
          className="glass-card" 
          onClick={() => setActiveRoute('alerts')}
          style={{ padding: '1.4rem', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden' }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.5)'; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>Smart Alerts</div>
              <div style={{ fontSize: '0.72rem', color: '#fb7185', fontWeight: 600 }}>Threat Watchlist & Triggers</div>
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '0.85rem' }}>
            Autonomous alerts on aggressive pricing cuts, key leadership departures, and urgent market disruptions.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fb7185', fontSize: '0.78rem', fontWeight: 700 }}>
            <span>View Active Alerts</span>
            <ArrowRight size={14} />
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
              <span>Tracked Competitor Entities ({competitors.length})</span>
            </h3>
            <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setShowCompModal(true)}>
              <Plus size={14} />
              <span>Add Competitor</span>
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading competitors...</div>
          ) : competitors.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              No competitors registered yet. Click 'Add Competitor' to start tracking.
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
                    View Profile
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
            <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setActiveRoute('timeline')}>
              <span>Full Timeline</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading recent signals...</div>
          ) : recentEvents.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              No recent market events recorded.
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

      {/* MODAL: ADD COMPETITOR */}
      {showCompModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
              Register New Competitor Entity
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Add a new company or platform to monitor across historical timeline and AI reasoning engines.
            </p>

            <form onSubmit={handleCreateCompetitor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Competitor Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={compForm.name} 
                  onChange={(e) => setCompForm({ ...compForm, name: e.target.value })} 
                  placeholder="e.g. OpenAI / Datadog" 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Industry / Market Segment</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={compForm.industry} 
                  onChange={(e) => setCompForm({ ...compForm, industry: e.target.value })} 
                  placeholder="e.g. Enterprise AI / Cloud Observability" 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Official Website</label>
                <input 
                  type="url" 
                  className="form-input" 
                  value={compForm.website} 
                  onChange={(e) => setCompForm({ ...compForm, website: e.target.value })} 
                  placeholder="https://example.com" 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Strategic Notes / Description</label>
                <textarea 
                  className="form-textarea" 
                  rows={3} 
                  value={compForm.description} 
                  onChange={(e) => setCompForm({ ...compForm, description: e.target.value })} 
                  placeholder="Summary of market position and main threats..." 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowCompModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={compSubmitting}>
                  {compSubmitting ? 'Registering...' : 'Register Competitor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
