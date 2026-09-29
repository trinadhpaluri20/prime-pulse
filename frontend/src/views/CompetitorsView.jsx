import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Bot, 
  Calendar, 
  ChevronRight,
  Sparkles,
  Filter
} from 'lucide-react';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

export default function CompetitorsView({ onSelectCompetitor, onLaunchAnalysis }) {
  const { addToast } = useToast();
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingComp, setEditingComp] = useState(null);

  // Delete modal state
  const [deletingComp, setDeletingComp] = useState(null);

  // Form states
  const [form, setForm] = useState({ name: '', description: '', industry: '', website: '' });

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const fetchCompetitors = async () => {
    setLoading(true);
    try {
      const data = await apiService.getCompetitors(1, 100);
      setCompetitors(data.items || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch competitors');
      addToast(err.message || 'Failed to fetch competitors', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    try {
      await apiService.createCompetitor(form);
      addToast(`Competitor '${form.name}' registered successfully!`, 'success');
      setForm({ name: '', description: '', industry: '', website: '' });
      setShowAddModal(false);
      fetchCompetitors();
    } catch (err) {
      addToast(err.message || 'Failed to register competitor', 'error');
    }
  };

  const handleEditOpen = (comp, e) => {
    e.stopPropagation();
    setEditingComp(comp);
    setForm({
      name: comp.name || '',
      description: comp.description || '',
      industry: comp.industry || '',
      website: comp.website || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingComp || !form.name.trim()) return;

    try {
      await apiService.updateCompetitor(editingComp.id, form);
      addToast(`Competitor '${form.name}' updated successfully!`, 'success');
      setShowEditModal(false);
      setEditingComp(null);
      fetchCompetitors();
    } catch (err) {
      addToast(err.message || 'Failed to update competitor', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingComp) return;
    try {
      await apiService.deleteCompetitor(deletingComp.id);
      addToast(`Competitor '${deletingComp.name}' deleted successfully.`, 'success');
      setDeletingComp(null);
      fetchCompetitors();
    } catch (err) {
      addToast(err.message || 'Failed to delete competitor', 'error');
    }
  };

  // Filter & Sort
  const filtered = competitors.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.industry && c.industry.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'industry') return (a.industry || '').localeCompare(b.industry || '');
    return 0;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }} className="fade-in-up">
      
      {/* Action Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Search & Sort */}
        <div style={{ display: 'flex', gap: '0.85rem', flex: 1, maxWidth: '600px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search competitors by name or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select className="form-select" style={{ width: '160px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Sort by Name</option>
            <option value="industry">Sort by Industry</option>
          </select>
        </div>

        <button className="btn-primary" onClick={() => {
          setForm({ name: '', description: '', industry: '', website: '' });
          setShowAddModal(true);
        }}>
          <Plus size={16} />
          <span>Add Competitor Profile</span>
        </button>
      </div>

      {/* Grid of Competitors */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading competitors...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          No competitors found matching your criteria. Click "Add Competitor Profile" above.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((comp) => (
            <div 
              key={comp.id}
              className="glass-card"
              onClick={() => onSelectCompetitor(comp)}
              style={{
                padding: '1.35rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                      {comp.name}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: '#a5b4fc', fontWeight: 600, marginTop: '0.15rem' }}>
                      {comp.industry || 'Enterprise Technology'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem' }} onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={(e) => handleEditOpen(comp, e)}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.3rem' }}
                      title="Edit"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingComp(comp);
                      }}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.3rem' }}
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {comp.description || 'Dedicated competitive intelligence tracking bank.'}
                </p>
              </div>

              <div style={{ paddingTop: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {comp.website ? (
                  <a 
                    href={comp.website}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}
                  >
                    <ExternalLink size={13} />
                    <span>Website</span>
                  </a>
                ) : <span />}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn-secondary"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onLaunchAnalysis(comp);
                    }}
                  >
                    <Bot size={13} />
                    <span>Analyze</span>
                  </button>

                  <button 
                    className="btn-primary"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                    onClick={() => onSelectCompetitor(comp)}
                  >
                    <span>View Intel</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: ADD COMPETITOR */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem' }}>
              Register Tracked Competitor Entity
            </h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Competitor Name *</label>
                <input type="text" className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Microsoft AI" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Industry Sector</label>
                <input type="text" className="form-input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="e.g. Enterprise Software" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Official Website</label>
                <input type="url" className="form-input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Strategic Description</label>
                <textarea className="form-textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Key strategic context..." />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Register Entity</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT COMPETITOR */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem' }}>
              Edit Competitor Profile
            </h3>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Competitor Name *</label>
                <input type="text" className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Industry Sector</label>
                <input type="text" className="form-input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Official Website</label>
                <input type="url" className="form-input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Strategic Description</label>
                <textarea className="form-textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal 
        isOpen={!!deletingComp}
        title="Delete Competitor Entity"
        message={`Are you sure you want to delete '${deletingComp?.name}'? This will permanently delete all associated events and Hindsight persistent memories.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingComp(null)}
        confirmText="Delete Competitor"
      />

    </div>
  );
}
