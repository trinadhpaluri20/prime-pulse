import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ArrowLeft, 
  Plus, 
  Bot, 
  Calendar, 
  ExternalLink, 
  BrainCircuit, 
  Trash2,
  Clock,
  Tag,
  Sparkles
} from 'lucide-react';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

export default function CompetitorDetailView({ competitor, onBack, onLaunchAnalysis }) {
  const { addToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Event modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(null);

  const [eventForm, setEventForm] = useState({
    title: '',
    category: 'product',
    description: '',
    event_date: new Date().toISOString().substring(0, 10),
    importance: 'medium',
  });

  useEffect(() => {
    if (competitor) {
      fetchEvents();
    }
  }, [competitor]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await apiService.getCompetitorEvents(competitor.id, 1, 100);
      setEvents(data.items || []);
    } catch (err) {
      addToast('Failed to load competitor events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;

    try {
      const payload = {
        ...eventForm,
        event_date: new Date(eventForm.event_date).toISOString(),
      };
      await apiService.createEvent(competitor.id, payload);
      addToast(`Event '${eventForm.title}' recorded and persisted in Hindsight memory!`, 'success');
      setShowEventModal(false);
      setEventForm({
        title: '',
        category: 'product',
        description: '',
        event_date: new Date().toISOString().substring(0, 10),
        importance: 'medium',
      });
      fetchEvents();
    } catch (err) {
      addToast(err.message || 'Failed to record event', 'error');
    }
  };

  const handleDeleteEventConfirm = async () => {
    if (!deletingEvent) return;
    try {
      await apiService.deleteEvent(deletingEvent.id);
      addToast('Event deleted successfully.', 'success');
      setDeletingEvent(null);
      fetchEvents();
    } catch (err) {
      addToast(err.message || 'Failed to delete event', 'error');
    }
  };

  if (!competitor) return null;

  // Category counts
  const catCounts = events.reduce((acc, ev) => {
    const cat = ev.category?.toLowerCase() || 'other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }} className="fade-in-up">
      
      {/* Back button */}
      <div>
        <button className="btn-secondary" onClick={onBack} style={{ padding: '0.4rem 0.85rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Competitors</span>
        </button>
      </div>

      {/* Header Profile Card */}
      <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(99, 102, 241, 0.12))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
              <Building2 size={24} color="#818cf8" />
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
                {competitor.name}
              </h2>
            </div>
            <div style={{ fontSize: '0.88rem', color: '#a5b4fc', fontWeight: 600, marginBottom: '0.75rem' }}>
              {competitor.industry || 'Enterprise Technology'}
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', maxWidth: '750px', lineHeight: 1.6 }}>
              {competitor.description || 'Dedicated competitor intelligence tracking bank.'}
            </p>

            {competitor.website && (
              <a 
                href={competitor.website} 
                target="_blank" 
                rel="noreferrer"
                style={{ color: '#67e8f9', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.85rem', textDecoration: 'none', fontWeight: 600 }}
              >
                <ExternalLink size={14} />
                <span>{competitor.website}</span>
              </a>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={() => onLaunchAnalysis(competitor)}>
              <Bot size={18} />
              <span>Launch Gemini AI Analysis</span>
            </button>
            <button className="btn-primary" onClick={() => setShowEventModal(true)}>
              <Plus size={18} />
              <span>Record Market Event</span>
            </button>
          </div>

        </div>

        {/* Category Breakdown Pills */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, alignSelf: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Signal Categories:
          </span>
          {Object.entries(catCounts).map(([cat, count]) => (
            <span key={cat} className={`badge-cat cat-${cat}`}>
              {cat} ({count})
            </span>
          ))}
          {Object.keys(catCounts).length === 0 && (
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>No signals recorded yet.</span>
          )}
        </div>
      </div>

      {/* Chronological Event Timeline Section */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="#34d399" />
              <span>Historical Intelligence Event Timeline</span>
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Persisted in relational database & vector search Hindsight persistent memory
            </p>
          </div>

          <span style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 600 }}>
            {events.length} Recorded Signals
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading timeline...</div>
        ) : events.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            No market events recorded for {competitor.name}. Click "Record Market Event" above to ingest signals.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            {events.map((ev) => (
              <div key={ev.id} className="timeline-item">
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '1.1rem' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge-cat cat-${ev.category}`}>
                        {ev.category}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Importance: <strong className={`importance-${ev.importance}`}>{ev.importance}</strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={13} />
                        {new Date(ev.event_date).toLocaleDateString()}
                      </span>
                      <button onClick={() => setDeletingEvent(ev)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
                    {ev.title}
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                    {ev.description}
                  </p>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.75rem', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <BrainCircuit size={13} color="#c084fc" />
                      <span>Hindsight Document ID: <code style={{ color: '#c084fc' }}>{ev.memory_document_id || `event-${ev.competitor_id}-${ev.id}`}</code></span>
                    </span>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* MODAL: RECORD EVENT (DUAL PERSISTENCE) */}
      {showEventModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
              Record Market Signal for {competitor.name}
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Pushes dual persistence into relational database and Hindsight persistent memory.
            </p>

            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Event Title *</label>
                <input type="text" className="form-input" required value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} placeholder="e.g. Copilot Enterprise v2.0 Release" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Category</label>
                  <select className="form-select" value={eventForm.category} onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}>
                    <option value="product">Product</option>
                    <option value="pricing">Pricing</option>
                    <option value="partnership">Partnership</option>
                    <option value="funding">Funding</option>
                    <option value="strategy">Strategy</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Importance Level</label>
                  <select className="form-select" value={eventForm.importance} onChange={(e) => setEventForm({ ...eventForm, importance: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Event Date *</label>
                <input type="date" className="form-input" required value={eventForm.event_date} onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Description / Market Evidence Narrative *</label>
                <textarea className="form-textarea" rows={4} required value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} placeholder="Detailed narrative of what occurred..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowEventModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Record & Retain Memory</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE EVENT MODAL */}
      <ConfirmModal 
        isOpen={!!deletingEvent}
        title="Delete Market Event"
        message={`Are you sure you want to delete the event '${deletingEvent?.title}'?`}
        onConfirm={handleDeleteEventConfirm}
        onCancel={() => setDeletingEvent(null)}
        confirmText="Delete Event"
      />

    </div>
  );
}
