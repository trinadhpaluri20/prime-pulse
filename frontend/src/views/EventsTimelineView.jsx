import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  BrainCircuit, 
  Trash2, 
  Clock, 
  Building2,
  Tag
} from 'lucide-react';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

export default function EventsTimelineView({ competitors }) {
  const { addToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCompId, setSelectedCompId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(null);

  const [form, setForm] = useState({
    competitor_id: '',
    title: '',
    category: 'product',
    description: '',
    event_date: new Date().toISOString().substring(0, 10),
    importance: 'medium',
  });

  const [selectedImportance, setSelectedImportance] = useState('');

  useEffect(() => {
    fetchAllEvents();
  }, [selectedCompId]);

  const fetchAllEvents = async () => {
    setLoading(true);
    try {
      let items = [];
      try {
        items = await apiService.getAllEvents({ 
          competitorId: selectedCompId || undefined, 
          limit: 200, 
          sortOrder: 'desc' 
        });
      } catch {
        if (selectedCompId) {
          const data = await apiService.getCompetitorEvents(selectedCompId, 1, 100);
          items = data.items || [];
        } else if (competitors && competitors.length > 0) {
          const proms = competitors.map(c => apiService.getCompetitorEvents(c.id, 1, 20).catch(() => ({ items: [] })));
          const results = await Promise.all(proms);
          items = results.flatMap(r => r.items || []);
          items.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
        }
      }
      setEvents(items || []);
    } catch (err) {
      console.error(err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!form.competitor_id || !form.title.trim()) return;

    try {
      const payload = {
        title: form.title,
        category: form.category,
        description: form.description,
        event_date: new Date(form.event_date).toISOString(),
        importance: form.importance,
      };
      await apiService.createEvent(form.competitor_id, payload);
      addToast(`Event '${form.title}' recorded & persisted in Hindsight memory!`, 'success');
      setShowModal(false);
      setForm({
        competitor_id: '',
        title: '',
        category: 'product',
        description: '',
        event_date: new Date().toISOString().substring(0, 10),
        importance: 'medium',
      });
      fetchAllEvents();
    } catch (err) {
      addToast(err.message || 'Failed to create event', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEvent) return;
    try {
      await apiService.deleteEvent(deletingEvent.id);
      addToast('Event deleted successfully.', 'success');
      setDeletingEvent(null);
      fetchAllEvents();
    } catch (err) {
      addToast(err.message || 'Failed to delete event', 'error');
    }
  };

  const categories = [
    { id: '', label: 'All Categories' },
    { id: 'product', label: 'Product & Features' },
    { id: 'pricing', label: 'Pricing & Packaging' },
    { id: 'hiring', label: 'Hiring & Talent' },
    { id: 'leadership', label: 'Leadership Moves' },
    { id: 'partnership', label: 'Partnership' },
    { id: 'funding', label: 'Funding & Capital' },
    { id: 'strategy', label: 'Strategy & Pivot' },
    { id: 'other', label: 'Other' },
  ];

  const filteredEvents = events.filter((ev) => {
    const matchesCat = !selectedCategory || ev.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesImp = !selectedImportance || ev.importance?.toLowerCase() === selectedImportance.toLowerCase();
    const matchesSearch = !searchTerm || 
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ev.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesImp && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }} className="fade-in-up">
      
      {/* Header & Filter Controls */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={22} color="#34d399" />
              <span>Historical Intelligence Timeline</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Chronological market events dual-persisted across relational DB & Hindsight memory banks
            </p>
          </div>

          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            <span>Record Market Event</span>
          </button>
        </div>

        {/* Filters bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          
          <div>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Filter Competitor
            </label>
            <select className="form-select" value={selectedCompId} onChange={(e) => setSelectedCompId(e.target.value)}>
              <option value="">All Competitors</option>
              {competitors.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Filter Category
            </label>
            <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Importance Level
            </label>
            <select className="form-select" value={selectedImportance} onChange={(e) => setSelectedImportance(e.target.value)}>
              <option value="">All Importance Levels</option>
              <option value="critical">🔴 Critical</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Search Keywords
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Search event titles, descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Events List Timeline */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading timeline events...</div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            No intelligence events found matching your selected filters.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredEvents.map((ev) => (
              <div key={ev.id} className="timeline-item">
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '1.1rem' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge-cat cat-${ev.category}`}>
                        {ev.category}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#a5b4fc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Building2 size={13} />
                        {competitors.find(c => c.id === ev.competitor_id)?.name || `Competitor #${ev.competitor_id}`}
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

                  <h4 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
                    {ev.title}
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                    {ev.description}
                  </p>

                  <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.75rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <BrainCircuit size={13} />
                    <span>Memory Provenance Doc ID: <code>{ev.memory_document_id || `event-${ev.competitor_id}-${ev.id}`}</code></span>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* MODAL: RECORD EVENT */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
              Record Market Signal & Ingest Memory
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Dual persistence into relational database and Hindsight persistent memory.
            </p>

            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Target Competitor *</label>
                <select className="form-select" required value={form.competitor_id} onChange={(e) => setForm({ ...form, competitor_id: e.target.value })}>
                  <option value="">Select Competitor Entity</option>
                  {competitors.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Event Title *</label>
                <input type="text" className="form-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Copilot Enterprise v2.0 Release" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Category</label>
                  <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
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
                  <select className="form-select" value={form.importance} onChange={(e) => setForm({ ...form, importance: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Event Date *</label>
                <input type="date" className="form-input" required value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Description Narrative *</label>
                <textarea className="form-textarea" rows={4} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detailed narrative of event..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Record & Retain Memory</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal 
        isOpen={!!deletingEvent}
        title="Delete Market Event"
        message={`Are you sure you want to delete '${deletingEvent?.title}'?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingEvent(null)}
        confirmText="Delete Event"
      />

    </div>
  );
}
