import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Calendar, 
  ExternalLink, 
  BrainCircuit, 
  CheckCircle,
  Tag,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../services/api';

export default function CompetitorManager({ onRefreshCompetitors }) {
  const [competitors, setCompetitors] = useState([]);
  const [selectedCompId, setSelectedCompId] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // New Competitor Form State
  const [showCompModal, setShowCompModal] = useState(false);
  const [compForm, setCompForm] = useState({ name: '', description: '', industry: '', website: '' });

  // New Event Form State
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    category: 'product',
    description: '',
    event_date: new Date().toISOString().substring(0, 10),
    importance: 'medium',
  });

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const fetchCompetitors = async () => {
    setLoading(true);
    try {
      const data = await apiService.getCompetitors(1, 100);
      setCompetitors(data.items || []);
      if (data.items && data.items.length > 0 && !selectedCompId) {
        setSelectedCompId(data.items[0].id);
        fetchEvents(data.items[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch competitors.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async (compId) => {
    try {
      const data = await apiService.getCompetitorEvents(compId, 1, 100);
      setEvents(data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectCompetitor = (id) => {
    setSelectedCompId(id);
    fetchEvents(id);
  };

  const handleCreateCompetitor = async (e) => {
    e.preventDefault();
    if (!compForm.name.trim()) return;

    try {
      await apiService.createCompetitor(compForm);
      setSuccessMsg(`Competitor '${compForm.name}' registered successfully!`);
      setCompForm({ name: '', description: '', industry: '', website: '' });
      setShowCompModal(false);
      fetchCompetitors();
      if (onRefreshCompetitors) onRefreshCompetitors();
    } catch (err) {
      setError(err.message || 'Failed to register competitor.');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!selectedCompId || !eventForm.title.trim()) return;

    try {
      const formattedPayload = {
        ...eventForm,
        event_date: new Date(eventForm.event_date).toISOString(),
      };
      await apiService.createEvent(selectedCompId, formattedPayload);
      setSuccessMsg(`Event '${eventForm.title}' recorded and retained in Hindsight persistent memory!`);
      setEventForm({
        title: '',
        category: 'product',
        description: '',
        event_date: new Date().toISOString().substring(0, 10),
        importance: 'medium',
      });
      setShowEventModal(false);
      fetchEvents(selectedCompId);
    } catch (err) {
      setError(err.message || 'Failed to record competitor event.');
    }
  };

  const handleDeleteCompetitor = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete '${name}' and all associated events?`)) return;

    try {
      await apiService.deleteCompetitor(id);
      setSuccessMsg(`Competitor '${name}' deleted successfully.`);
      fetchCompetitors();
      if (onRefreshCompetitors) onRefreshCompetitors();
    } catch (err) {
      setError(err.message || 'Failed to delete competitor.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await apiService.deleteEvent(eventId);
      fetchEvents(selectedCompId);
    } catch (err) {
      setError(err.message || 'Failed to delete event.');
    }
  };

  const selectedComp = competitors.find(c => c.id === selectedCompId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Alert Messages */}
      {successMsg && (
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {error && (
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#fb7185', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Main Grid: Left Panel Competitors, Right Panel Events */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(450px, 2fr)', gap: '1.5rem' }}>
        
        {/* LEFT COLUMN: Competitor Profiles */}
        <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} color="#818cf8" />
              <span>Competitors</span>
            </h3>
            <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setShowCompModal(true)}>
              <Plus size={15} />
              <span>Register</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {competitors.map((comp) => {
              const active = comp.id === selectedCompId;
              return (
                <div 
                  key={comp.id}
                  onClick={() => handleSelectCompetitor(comp.id)}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    background: active ? 'rgba(99, 102, 241, 0.18)' : 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid',
                    borderColor: active ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>
                      {comp.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      {comp.industry || 'Enterprise'}
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCompetitor(comp.id, comp.name);
                    }}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.3rem' }}
                    title="Delete competitor"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Competitor Events & Dual Ingestion */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          {selectedComp ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                    {selectedComp.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                    {selectedComp.description || 'No description provided.'}
                  </p>
                </div>

                <button className="btn-primary" onClick={() => setShowEventModal(true)}>
                  <Plus size={16} />
                  <span>Record Market Event</span>
                </button>
              </div>

              {/* Event Feed */}
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={16} color="#34d399" />
                  <span>Recorded Signals ({events.length})</span>
                </h4>

                {events.length === 0 ? (
                  <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px' }}>
                    No events recorded for {selectedComp.name}. Click "Record Market Event" above to ingest an event into persistent memory.
                  </div>
                ) : (
                  events.map((ev) => (
                    <div key={ev.id} style={{ padding: '1.1rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className={`badge badge-${ev.category}`}>{ev.category}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Importance: <strong className={`importance-${ev.importance}`}>{ev.importance}</strong></span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                            {new Date(ev.event_date).toLocaleDateString()}
                          </span>
                          <button onClick={() => handleDeleteEvent(ev.id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <h5 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
                        {ev.title}
                      </h5>
                      <p style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                        {ev.description}
                      </p>

                      <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.75rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <BrainCircuit size={12} />
                        <span>Hindsight Memory Doc ID: <code>{ev.memory_document_id || `event-${ev.competitor_id}-${ev.id}`}</code></span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              Select or register a competitor on the left to manage events.
            </div>
          )}
        </div>

      </div>

      {/* MODAL 1: REGISTER COMPETITOR */}
      {showCompModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', maxWidth: '500px', width: '100%', background: '#0f172a' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem' }}>Register Tracked Competitor</h3>
            <form onSubmit={handleCreateCompetitor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Competitor Name *</label>
                <input type="text" className="form-input" required value={compForm.name} onChange={(e) => setCompForm({ ...compForm, name: e.target.value })} placeholder="e.g. Microsoft AI" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Industry Sector</label>
                <input type="text" className="form-input" value={compForm.industry} onChange={(e) => setCompForm({ ...compForm, industry: e.target.value })} placeholder="e.g. Enterprise Software" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Official Website</label>
                <input type="url" className="form-input" value={compForm.website} onChange={(e) => setCompForm({ ...compForm, website: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Description</label>
                <textarea className="form-textarea" rows={3} value={compForm.description} onChange={(e) => setCompForm({ ...compForm, description: e.target.value })} placeholder="Brief strategic background..." />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowCompModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Register Entity</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD COMPETITOR EVENT (DUAL PERSISTENCE) */}
      {showEventModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', maxWidth: '550px', width: '100%', background: '#0f172a' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>Record Competitor Event</h3>
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
                    <option value="leadership">Leadership</option>
                    <option value="marketing">Marketing</option>
                    <option value="financial">Financial</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Importance</label>
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
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Description / Market Signal Narrative *</label>
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

    </div>
  );
}
