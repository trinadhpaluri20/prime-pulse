import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  Tag, 
  BrainCircuit, 
  Clock, 
  Building2,
  Layers
} from 'lucide-react';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function HistoricalRecallView({ competitors }) {
  const { addToast } = useToast();
  const [queryText, setQueryText] = useState('What pricing changes happened recently?');
  const [selectedCompId, setSelectedCompId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [recallResult, setRecallResult] = useState(null);

  useEffect(() => {
    handleExecuteRecall('What pricing changes happened recently?');
  }, []);

  const handleExecuteRecall = async (overrideQuery) => {
    const activeQuery = overrideQuery !== undefined ? overrideQuery : queryText;
    setLoading(true);

    try {
      if (activeQuery.trim()) {
        const payload = {
          query: activeQuery,
          competitor_id: selectedCompId ? parseInt(selectedCompId, 10) : null,
          category: selectedCategory || null,
        };
        const data = await apiService.queryRecall(payload);
        setRecallResult(data);
      } else if (selectedCompId) {
        const data = await apiService.getCompetitorHistory(selectedCompId, selectedCategory || null);
        setRecallResult({
          query: `Competitor #${selectedCompId} Timeline`,
          status: 'success',
          competitor: data.competitor,
          date_range: data.date_range,
          events: data.events || [],
          memory_sources: data.memory_sources || [],
          summary: `Retrieved ${data.total_events || data.events?.length || 0} events.`,
        });
      }
    } catch (err) {
      addToast(err.message || 'Recall query failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: '', label: 'All Categories' },
    { id: 'product', label: 'Product' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'partnership', label: 'Partnership' },
    { id: 'funding', label: 'Funding' },
    { id: 'strategy', label: 'Strategy' },
    { id: 'other', label: 'Other' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }} className="fade-in-up">
      
      {/* Header Search Panel */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ padding: '0.6rem', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '12px', color: '#c084fc' }}>
            <History size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              Historical Intelligence Recall Engine
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Execute temporal, semantic & entity search queries across long-term persistent memory banks
            </p>
          </div>
        </div>

        {/* Input Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          
          <div>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Target Competitor
            </label>
            <select 
              className="form-select"
              value={selectedCompId}
              onChange={(e) => setSelectedCompId(e.target.value)}
            >
              <option value="">All Competitors</option>
              {competitors.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Event Category Filter
            </label>
            <select 
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Natural Language Recall Query
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text"
                className="form-input"
                placeholder="e.g. What pricing changes happened recently?"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExecuteRecall()}
              />
              <button 
                className="btn-primary" 
                onClick={() => handleExecuteRecall()}
                disabled={loading}
                style={{ padding: '0.65rem 1.25rem' }}
              >
                <Search size={16} />
                <span>Search Memory</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          <BrainCircuit size={44} color="#c084fc" className="spin" style={{ margin: '0 auto 1rem' }} />
          <div>Recalling memories & building timeline...</div>
        </div>
      )}

      {/* Recall Search Result Timeline */}
      {recallResult && !loading && (
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                {recallResult.competitor?.name ? `${recallResult.competitor.name} Timeline` : 'Retrieved Historical Memories'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                {recallResult.summary}
              </p>
            </div>
            <span style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc', fontWeight: 600 }}>
              {recallResult.events?.length || 0} Memories Recalled
            </span>
          </div>

          {/* Timeline Events List */}
          {recallResult.events && recallResult.events.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              {recallResult.events.map((ev, idx) => (
                <div key={idx} className="timeline-item">
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '1.1rem' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`badge-cat cat-${ev.category}`}>
                          {ev.category}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#a5b4fc', fontWeight: 600 }}>
                          {ev.competitor_name || `Competitor #${ev.competitor_id}`}
                        </span>
                      </div>

                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={13} />
                        {new Date(ev.date).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
                      {ev.title}
                    </h4>
                    <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                      {ev.summary}
                    </p>

                    <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.75rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <BrainCircuit size={13} />
                      <span>Memory Provenance Document ID: <code>{ev.memory_document_id || `event-${ev.competitor_id}-${ev.event_id}`}</code></span>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              No historical memories found matching your query.
            </div>
          )}

        </div>
      )}

    </div>
  );
}
