import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  Tag, 
  BrainCircuit, 
  Layers, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { apiService } from '../services/api';

export default function HistoricalRecall({ selectedCompetitorId, competitors }) {
  const [queryText, setQueryText] = useState('');
  const [competitorId, setCompetitorId] = useState(selectedCompetitorId || '');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recallResult, setRecallResult] = useState(null);

  useEffect(() => {
    if (selectedCompetitorId) {
      setCompetitorId(selectedCompetitorId);
      handleRecallQuery('', selectedCompetitorId);
    }
  }, [selectedCompetitorId]);

  const handleRecallQuery = async (overrideQuery, overrideCompId) => {
    const activeQuery = overrideQuery !== undefined ? overrideQuery : queryText;
    const activeCompId = overrideCompId !== undefined ? overrideCompId : competitorId;

    setLoading(true);
    setError(null);

    try {
      if (activeQuery.trim()) {
        const payload = {
          query: activeQuery,
          competitor_id: activeCompId ? parseInt(activeCompId, 10) : null,
          category: category || null,
        };
        const data = await apiService.queryRecall(payload);
        setRecallResult(data);
      } else if (activeCompId) {
        const data = await apiService.getCompetitorHistory(activeCompId, category || null);
        setRecallResult({
          query: `Competitor #${activeCompId} Historical Timeline`,
          status: 'success',
          competitor: data.competitor,
          date_range: data.date_range,
          events: data.events || [],
          memory_sources: data.memory_sources || [],
          summary: `Retrieved ${data.total_events || data.events?.length || 0} historical events.`,
        });
      } else {
        // Default query across all
        const payload = { query: "What events have been recorded recently?" };
        const data = await apiService.queryRecall(payload);
        setRecallResult(data);
      }
    } catch (err) {
      setError(err.message || 'Recall query failed.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: '', label: 'All Categories' },
    { id: 'product', label: 'Product' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'partnership', label: 'Partnership' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'financial', label: 'Financial' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header Panel */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '10px', color: '#c084fc' }}>
            <History size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
              Historical Intelligence Recall Engine
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Semantic & temporal retrieval combining relational event records with Hindsight persistent memory
            </p>
          </div>
        </div>

        {/* Query Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
          
          <div>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Target Competitor
            </label>
            <select 
              className="form-select"
              value={competitorId}
              onChange={(e) => {
                setCompetitorId(e.target.value);
                handleRecallQuery(queryText, e.target.value);
              }}
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
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
              }}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Natural Language Question / Date Range
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text"
                className="form-input"
                placeholder="e.g. What product releases occurred in the last 60 days?"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRecallQuery()}
              />
              <button 
                className="btn-primary" 
                onClick={() => handleRecallQuery()}
                disabled={loading}
                style={{ padding: '0.6rem 1.2rem' }}
              >
                <Search size={16} />
                <span>Recall</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185' }}>
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          <History size={36} color="#c084fc" className="animate-pulse-glow" style={{ margin: '0 auto 0.75rem' }} />
          <div>Querying Hindsight Memory Bank & Event Timeline...</div>
        </div>
      )}

      {/* Timeline Results */}
      {recallResult && !loading && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                {recallResult.competitor?.name ? `${recallResult.competitor.name} Timeline` : 'Historical Recall Results'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                {recallResult.summary || `Retrieved ${recallResult.events?.length || 0} chronological events.`}
              </p>
            </div>
            <span style={{ fontSize: '0.78rem', background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc', padding: '0.3rem 0.7rem', borderRadius: '6px', fontWeight: 600 }}>
              {recallResult.events?.length || 0} Events Found
            </span>
          </div>

          {/* Timeline View */}
          {recallResult.events && recallResult.events.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              {recallResult.events.map((ev, idx) => (
                <div key={idx} className="timeline-item">
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '1.1rem' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`badge badge-${ev.category}`}>
                          {ev.category}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                          Importance: <span className={`importance-${ev.importance}`}>{ev.importance}</span>
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={13} />
                        <span>{new Date(ev.date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
                      {ev.title}
                    </h4>
                    <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                      {ev.summary}
                    </p>

                    <div style={{ display: 'flex', gap: '0.85rem', marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.75rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <BrainCircuit size={12} color="#c084fc" />
                        <span>Doc ID: <code style={{ color: '#c084fc' }}>{ev.memory_document_id || `event-${ev.competitor_id}-${ev.event_id}`}</code></span>
                      </span>
                      <span>Source: {ev.source_name || 'Relational Event & Hindsight Memory'}</span>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              No historical events found matching your query or filters.
            </div>
          )}

        </div>
      )}

    </div>
  );
}
