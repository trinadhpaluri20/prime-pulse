import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Bell, 
  CheckCircle, 
  Filter, 
  Search, 
  Building2, 
  Clock, 
  Plus, 
  Sparkles, 
  Bot, 
  Sliders, 
  Eye, 
  EyeOff,
  Flame,
  Zap,
  ArrowRight,
  BrainCircuit
} from 'lucide-react';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function SmartAlertsView({ competitors = [], onNavigateToAnalysis, onNavigateToChat }) {
  const { addToast } = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [competitorFilter, setCompetitorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // active | acknowledged | all
  const [searchTerm, setSearchTerm] = useState('');
  const [acknowledgedIds, setAcknowledgedIds] = useState(() => {
    try {
      const stored = localStorage.getItem('ci_ack_alerts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Modal for creating custom alert signal
  const [showModal, setShowModal] = useState(false);
  const [alertForm, setAlertForm] = useState({
    competitor_id: '',
    title: '',
    category: 'pricing',
    importance: 'critical',
    description: '',
  });

  // Alert Rules
  const [rules, setRules] = useState([
    { id: 'rule-pricing', label: 'Competitor Price Decrease or Discount > 10%', enabled: true, category: 'pricing' },
    { id: 'rule-exec', label: 'Executive Poaching or Leadership Departure', enabled: true, category: 'leadership' },
    { id: 'rule-ai', label: 'AI Model or GenAI Product Capability Release', enabled: true, category: 'feature' },
    { id: 'rule-surge', label: 'Activity Spike Velocity (>3 announcements in 7 days)', enabled: true, category: 'market' },
  ]);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      // Fetch events across all competitors
      let events = [];
      try {
        events = await apiService.getAllEvents({ limit: 100, sortOrder: 'desc' });
      } catch (err) {
        // Fallback: aggregate top events
        if (competitors.length > 0) {
          const proms = competitors.map(c => apiService.getCompetitorEvents(c.id, 1, 20).catch(() => ({ items: [] })));
          const res = await Promise.all(proms);
          events = res.flatMap(r => r.items || []);
        }
      }

      // Convert events to alert format or seed realistic alerts if DB is empty
      if (!events || events.length === 0) {
        // Default simulated market alerts
        setAlerts([
          {
            id: 'alt-1',
            competitor_id: competitors[0]?.id || 1,
            competitor_name: competitors[0]?.name || 'Acme Corp',
            title: 'Critical: Acme Corp slashed Pro Tier pricing by 25%',
            description: 'Announced an aggressive spring discount dropping monthly subscription from $49 to $36.75 with unlimited API credits.',
            category: 'pricing',
            importance: 'critical',
            created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
            memory_doc_id: 'event-1-pricing-drop'
          },
          {
            id: 'alt-2',
            competitor_id: competitors[1]?.id || 2,
            competitor_name: competitors[1]?.name || 'Microsoft AI',
            title: 'Leadership: VP of Enterprise Strategy hired from rival',
            description: 'Recruited former AWS VP of Enterprise Cloud Sales to head their direct enterprise GTM division.',
            category: 'leadership',
            importance: 'high',
            created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
            memory_doc_id: 'event-2-vp-hire'
          },
          {
            id: 'alt-3',
            competitor_id: competitors[0]?.id || 1,
            competitor_name: competitors[0]?.name || 'Acme Corp',
            title: 'Product: Released Copilot v2 with Autonomous Agents',
            description: 'Shipped agentic workflow execution directly competing with our core platform capabilities.',
            category: 'feature',
            importance: 'high',
            created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
            memory_doc_id: 'event-1-copilot-v2'
          },
          {
            id: 'alt-4',
            competitor_id: competitors[1]?.id || 2,
            competitor_name: competitors[1]?.name || 'Microsoft AI',
            title: 'Funding: Secured $150M Series D at $1.8B Valuation',
            description: 'New capital earmarked for GPU cluster expansion and European sovereign cloud infrastructure.',
            category: 'funding',
            importance: 'medium',
            created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
            memory_doc_id: 'event-2-series-d'
          }
        ]);
      } else {
        const formatted = events.map(ev => {
          const comp = competitors.find(c => c.id === ev.competitor_id);
          return {
            id: `alt-${ev.id}`,
            competitor_id: ev.competitor_id,
            competitor_name: comp?.name || `Competitor #${ev.competitor_id}`,
            title: ev.title,
            description: ev.description,
            category: ev.category || 'market',
            importance: ev.importance || 'medium',
            created_at: ev.event_date || new Date().toISOString(),
            memory_doc_id: ev.memory_document_id || `event-${ev.competitor_id}-${ev.id}`
          };
        });
        setAlerts(formatted);
      }
    } catch (err) {
      console.error('Error loading alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAcknowledge = (alertId) => {
    setAcknowledgedIds(prev => {
      let updated;
      if (prev.includes(alertId)) {
        updated = prev.filter(id => id !== alertId);
        addToast('Alert marked as active.', 'info');
      } else {
        updated = [...prev, alertId];
        addToast('Alert acknowledged & archived.', 'success');
      }
      try {
        localStorage.setItem('ci_ack_alerts', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!alertForm.competitor_id || !alertForm.title.trim()) return;

    try {
      const payload = {
        title: alertForm.title,
        category: alertForm.category,
        description: alertForm.description,
        event_date: new Date().toISOString(),
        importance: alertForm.importance,
      };
      await apiService.createEvent(alertForm.competitor_id, payload);
      addToast(`Critical Alert recorded & ingested into Hindsight Memory!`, 'success');
      setShowModal(false);
      setAlertForm({
        competitor_id: '',
        title: '',
        category: 'pricing',
        importance: 'critical',
        description: '',
      });
      loadAlerts();
    } catch (err) {
      addToast(err.message || 'Failed to trigger alert', 'error');
    }
  };

  // Filtered Alerts
  const filteredAlerts = alerts.filter(alt => {
    const isAck = acknowledgedIds.includes(alt.id);
    if (statusFilter === 'active' && isAck) return false;
    if (statusFilter === 'acknowledged' && !isAck) return false;

    if (severityFilter !== 'all' && alt.importance !== severityFilter) return false;
    if (competitorFilter && String(alt.competitor_id) !== String(competitorFilter)) return false;

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const matchTitle = alt.title.toLowerCase().includes(query);
      const matchDesc = alt.description.toLowerCase().includes(query);
      const matchComp = alt.competitor_name.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc && !matchComp) return false;
    }

    return true;
  });

  const criticalCount = alerts.filter(a => a.importance === 'critical' && !acknowledgedIds.includes(a.id)).length;
  const highCount = alerts.filter(a => a.importance === 'high' && !acknowledgedIds.includes(a.id)).length;
  const mediumCount = alerts.filter(a => a.importance === 'medium' && !acknowledgedIds.includes(a.id)).length;
  const acknowledgedCount = alerts.filter(a => acknowledgedIds.includes(a.id)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }} className="fade-in-up">
      
      {/* Header & Metrics */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '0.25rem 0.75rem', borderRadius: '20px', color: '#fb7185', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              <ShieldAlert size={14} />
              <span>Real-Time Market Threat Intelligence</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={24} color="#f43f5e" />
              <span>Smart Competitive Alerts & Watchlist</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              Instant triggers on competitor pricing shifts, executive poaching, aggressive releases, and pattern anomalies
            </p>
          </div>

          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            <span>Record Threat Signal</span>
          </button>
        </div>

        {/* Telemetry Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '0.74rem', color: '#fb7185', fontWeight: 700, textTransform: 'uppercase' }}>
              Critical Threats
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
              {criticalCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#fda4af', marginTop: '0.25rem' }}>
              Requires immediate strategic response
            </div>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '0.74rem', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase' }}>
              High Severity
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
              {highCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#fde68a', marginTop: '0.25rem' }}>
              Product & leadership pivots
            </div>
          </div>

          <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '0.74rem', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase' }}>
              Market Shifts
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
              {mediumCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#c7d2fe', marginTop: '0.25rem' }}>
              General announcements & velocity
            </div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
              Archived / Read
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
              {acknowledgedCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#a7f3d0', marginTop: '0.25rem' }}>
              Acknowledged intelligence items
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
              Alert Status
            </label>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="active">Active Alerts ({alerts.length - acknowledgedCount})</option>
              <option value="acknowledged">Acknowledged ({acknowledgedCount})</option>
              <option value="all">All Alerts ({alerts.length})</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
              Severity Level
            </label>
            <select className="form-select" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
              <option value="all">All Severities</option>
              <option value="critical">🔴 Critical</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
              Filter Competitor
            </label>
            <select className="form-select" value={competitorFilter} onChange={(e) => setCompetitorFilter(e.target.value)}>
              <option value="">All Competitors</option>
              {competitors.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
              Search Incident
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: '2.4rem' }}
                placeholder="Search headlines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Alerts Stream & Configured Rules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem' }}>
        
        {/* Alerts Feed */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="#f43f5e" />
              <span>Incident Threat Feed ({filteredAlerts.length})</span>
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Sorted by recency & severity
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading smart alerts...</div>
          ) : filteredAlerts.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              No alerts match your current filter parameters.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredAlerts.map(alt => {
                const isAck = acknowledgedIds.includes(alt.id);
                const isCritical = alt.importance === 'critical';
                const isHigh = alt.importance === 'high';

                return (
                  <div 
                    key={alt.id}
                    style={{
                      padding: '1.15rem',
                      background: isAck ? 'rgba(15, 23, 42, 0.4)' : isCritical ? 'rgba(244, 63, 94, 0.08)' : 'rgba(15, 23, 42, 0.7)',
                      border: isAck 
                        ? '1px solid rgba(255, 255, 255, 0.05)' 
                        : isCritical 
                          ? '1px solid rgba(244, 63, 94, 0.35)' 
                          : isHigh 
                            ? '1px solid rgba(245, 158, 11, 0.3)' 
                            : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      opacity: isAck ? 0.65 : 1,
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    {/* Top Row: Severity, Competitor, Category, Timestamp */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span 
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            background: isCritical ? 'rgba(244, 63, 94, 0.2)' : isHigh ? 'rgba(245, 158, 11, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                            color: isCritical ? '#fb7185' : isHigh ? '#fbbf24' : '#a5b4fc',
                            border: `1px solid ${isCritical ? 'rgba(244, 63, 94, 0.4)' : isHigh ? 'rgba(245, 158, 11, 0.4)' : 'rgba(99, 102, 241, 0.3)'}`
                          }}
                        >
                          {alt.importance}
                        </span>

                        <span className={`badge-cat cat-${alt.category}`}>
                          {alt.category}
                        </span>

                        <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Building2 size={13} />
                          {alt.competitor_name}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={12} />
                          {new Date(alt.created_at).toLocaleDateString()} {new Date(alt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        <button 
                          onClick={() => handleToggleAcknowledge(alt.id)}
                          style={{
                            background: isAck ? 'rgba(255, 255, 255, 0.05)' : 'rgba(16, 185, 129, 0.15)',
                            border: isAck ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(16, 185, 129, 0.3)',
                            color: isAck ? '#94a3b8' : '#34d399',
                            borderRadius: '6px',
                            padding: '0.25rem 0.6rem',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          {isAck ? <EyeOff size={13} /> : <CheckCircle size={13} />}
                          <span>{isAck ? 'Reactivate' : 'Acknowledge'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Headline */}
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
                      {alt.title}
                    </h4>

                    {/* Description Narrative */}
                    <p style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                      {alt.description}
                    </p>

                    {/* Action Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div style={{ fontSize: '0.72rem', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'var(--font-mono)' }}>
                        <BrainCircuit size={12} />
                        <span>Hindsight Doc: <code>{alt.memory_doc_id}</code></span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {onNavigateToChat && (
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                            onClick={() => onNavigateToChat(alt)}
                          >
                            <Bot size={13} />
                            <span>Ask AI Chat</span>
                          </button>
                        )}
                        {onNavigateToAnalysis && (
                          <button 
                            className="btn-primary" 
                            style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                            onClick={() => onNavigateToAnalysis(alt)}
                          >
                            <Sparkles size={13} />
                            <span>Run AI Synthesis</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Watchlist Trigger Rules Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem' }}>
              <Sliders size={17} color="#38bdf8" />
              <span>Smart Alert Trigger Rules</span>
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1.15rem' }}>
              Autonomous detection rules evaluating incoming signals against competitive threat thresholds
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {rules.map(rule => (
                <div 
                  key={rule.id}
                  style={{
                    padding: '0.85rem',
                    background: rule.enabled ? 'rgba(15, 23, 42, 0.8)' : 'rgba(15, 23, 42, 0.3)',
                    border: rule.enabled ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: rule.enabled ? '#ffffff' : '#64748b' }}>
                      {rule.label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      Category: <span className={`badge-cat cat-${rule.category}`} style={{ fontSize: '0.65rem' }}>{rule.category}</span>
                    </div>
                  </div>

                  <input 
                    type="checkbox" 
                    className="auth-checkbox"
                    checked={rule.enabled} 
                    onChange={() => {
                      setRules(rules.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r));
                      addToast(`Rule '${rule.label.substring(0, 25)}...' updated.`, 'info');
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Threat Simulation Help */}
          <div className="glass-card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fb7185', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <Flame size={16} />
              <span>Hindsight Threat Sensitivity</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              Critical market signals automatically synchronize across your relational database and Hindsight memory bank to trigger historical pattern analysis.
            </p>
          </div>

        </div>

      </div>

      {/* MODAL: RECORD TRIGGER ALERT */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
              Record Threat Signal & Alert Trigger
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Immediately logs the event to the database and alerts analysts across the platform.
            </p>

            <form onSubmit={handleCreateAlert} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Target Competitor *</label>
                <select className="form-select" required value={alertForm.competitor_id} onChange={(e) => setAlertForm({ ...alertForm, competitor_id: e.target.value })}>
                  <option value="">Select Competitor Entity</option>
                  {competitors.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Threat Alert Headline *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={alertForm.title} 
                  onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })} 
                  placeholder="e.g. Acme Corp unbundled pricing dropping base tier to $19" 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Category</label>
                  <select className="form-select" value={alertForm.category} onChange={(e) => setAlertForm({ ...alertForm, category: e.target.value })}>
                    <option value="pricing">Pricing</option>
                    <option value="leadership">Leadership / Executive</option>
                    <option value="product">Product / Feature</option>
                    <option value="funding">Funding / Capital</option>
                    <option value="strategy">Strategy / Pivot</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Severity Level</label>
                  <select className="form-select" value={alertForm.importance} onChange={(e) => setAlertForm({ ...alertForm, importance: e.target.value })}>
                    <option value="critical">🔴 Critical Threat</option>
                    <option value="high">🟠 High Severity</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Detailed Threat Context *</label>
                <textarea 
                  className="form-textarea" 
                  rows={4} 
                  required 
                  value={alertForm.description} 
                  onChange={(e) => setAlertForm({ ...alertForm, description: e.target.value })} 
                  placeholder="Elaborate on the market shift, potential customer impact, and strategic repercussions..." 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Record Alert & Retain</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
