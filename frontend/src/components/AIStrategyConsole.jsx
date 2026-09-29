import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Eye, 
  Lightbulb, 
  ShieldAlert, 
  BrainCircuit, 
  Database,
  Building2,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../services/api';

export default function AIStrategyConsole({ selectedCompetitorId, competitors }) {
  const [query, setQuery] = useState('');
  const [competitorId, setCompetitorId] = useState(selectedCompetitorId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeResultTab, setActiveResultTab] = useState('summary');

  useEffect(() => {
    if (selectedCompetitorId) {
      setCompetitorId(selectedCompetitorId);
    }
  }, [selectedCompetitorId]);

  const presetQueries = [
    "What has Microsoft AI done in the last 90 days and what patterns can be observed?",
    "Analyze pricing and subscription model shifts across all tracked competitors.",
    "Summarize product releases and strategic partnerships in the last 6 months.",
    "Detect strategic pivots and market posture changes.",
  ];

  const handleRunAnalysis = async (customQuery) => {
    const textToQuery = customQuery || query;
    if (!textToQuery.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        query: textToQuery,
        competitor_id: competitorId ? parseInt(competitorId, 10) : null,
      };

      const data = await apiService.analyzeIntelligence(payload);
      setResult(data);
    } catch (err) {
      setError(err.message || 'AI Agent synthesis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(99, 102, 241, 0.15))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '10px', color: '#818cf8' }}>
            <Bot size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
              Gemini AI Strategy Reasoning Console
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Strict evidence grounding over Hindsight persistent memory & relational competitor events
            </p>
          </div>
        </div>

        {/* Input Form */}
        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            
            {/* Target Competitor Select */}
            <div style={{ minWidth: '220px' }}>
              <select 
                className="form-select"
                value={competitorId}
                onChange={(e) => setCompetitorId(e.target.value)}
              >
                <option value="">All Competitors (Auto-resolve)</option>
                {competitors.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Query Text Box */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <input 
                type="text"
                className="form-input"
                placeholder="Ask a strategic query (e.g. What has Microsoft AI done in the last 90 days?)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunAnalysis()}
              />
            </div>

            <button 
              className="btn-primary" 
              onClick={() => handleRunAnalysis()}
              disabled={loading || !query.trim()}
              style={{ minWidth: '140px', justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-pulse-glow" />
                  <span>Reasoning...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Analyze</span>
                </>
              )}
            </button>

          </div>

          {/* Preset Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Preset Prompts:</span>
            {presetQueries.map((p, idx) => (
              <button 
                key={idx}
                onClick={() => {
                  setQuery(p);
                  handleRunAnalysis(p);
                }}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => { e.target.style.color = '#ffffff'; e.target.style.borderColor = 'rgba(99, 102, 241, 0.4)'; }}
                onMouseOut={(e) => { e.target.style.color = '#94a3b8'; e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
              >
                {p}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185' }}>
          <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Analysis Error</div>
          <div>{error}</div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <BrainCircuit size={48} color="#6366f1" className="animate-pulse-glow" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 700 }}>Orchestrating Gemini AI Reasoning</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.4rem' }}>
            Recalling persistent memories from Hindsight & querying database events...
          </p>
        </div>
      )}

      {/* Analysis Results View */}
      {result && !loading && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          
          {/* Header Result Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className={`status-dot ${result.status === 'success' ? 'healthy' : 'degraded'}`} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  {result.competitor?.name || 'Competitor Intelligence Analysis'}
                </h3>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Query: "{result.query}"
              </div>
            </div>

            {/* Status Badges */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontWeight: 600 }}>
                Gemini: {result.gemini_status || 'connected'}
              </span>
              <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 600 }}>
                Memory: {result.memory_status || 'connected'}
              </span>
            </div>
          </div>

          {/* Sub Navigation Tabs for Output */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem' }}>
            {[
              { id: 'summary', label: 'Executive Summary', icon: Sparkles },
              { id: 'facts', label: `Verifiable Facts (${result.facts?.length || 0})`, icon: CheckCircle2 },
              { id: 'observations', label: `Observations (${result.observations?.length || 0})`, icon: Eye },
              { id: 'insights', label: `Strategic Insights (${result.insights?.length || 0})`, icon: Lightbulb },
              { id: 'provenance', label: `Memory Provenance (${result.memory_sources?.length || 0})`, icon: BrainCircuit },
            ].map((t) => {
              const Icon = t.icon;
              const active = activeResultTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveResultTab(t.id)}
                  style={{
                    background: active ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    border: '1px solid',
                    borderColor: active ? 'rgba(99, 102, 241, 0.4)' : 'transparent',
                    borderRadius: '8px',
                    color: active ? '#ffffff' : '#94a3b8',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Icon size={15} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: EXECUTIVE SUMMARY */}
          {activeResultTab === 'summary' && (
            <div style={{ lineHeight: 1.7, color: '#e2e8f0', fontSize: '1rem', background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ fontWeight: 700, color: '#818cf8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} />
                <span>Executive Synthesis</span>
              </div>
              <p>{result.summary || 'No summary available.'}</p>

              {result.limitations && result.limitations.length > 0 && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}>
                    <ShieldAlert size={14} />
                    <span>Declared Intelligence Constraints</span>
                  </div>
                  <ul style={{ paddingLeft: '1.2rem', color: '#94a3b8', fontSize: '0.82rem' }}>
                    {result.limitations.map((lim, idx) => (
                      <li key={idx}>{lim}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VERIFIABLE FACTS */}
          {activeResultTab === 'facts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {result.facts && result.facts.length > 0 ? (
                result.facts.map((fact, idx) => (
                  <div key={idx} style={{ padding: '0.85rem 1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', borderLeft: '3px solid #34d399', color: '#f1f5f9', fontSize: '0.92rem' }}>
                    {fact}
                  </div>
                ))
              ) : (
                <div style={{ padding: '1.5rem', color: '#64748b', textAlign: 'center' }}>No explicit facts recorded.</div>
              )}
            </div>
          )}

          {/* TAB 3: OBSERVATIONS */}
          {activeResultTab === 'observations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {result.observations && result.observations.length > 0 ? (
                result.observations.map((obs, idx) => (
                  <div key={idx} style={{ padding: '0.85rem 1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', borderLeft: '3px solid #60a5fa', color: '#f1f5f9', fontSize: '0.92rem' }}>
                    {obs}
                  </div>
                ))
              ) : (
                <div style={{ padding: '1.5rem', color: '#64748b', textAlign: 'center' }}>No pattern observations derived.</div>
              )}
            </div>
          )}

          {/* TAB 4: STRATEGIC INSIGHTS */}
          {activeResultTab === 'insights' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {result.insights && result.insights.length > 0 ? (
                result.insights.map((ins, idx) => (
                  <div key={idx} style={{ padding: '0.85rem 1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '10px', borderLeft: '3px solid #818cf8', color: '#f1f5f9', fontSize: '0.92rem' }}>
                    {ins}
                  </div>
                ))
              ) : (
                <div style={{ padding: '1.5rem', color: '#64748b', textAlign: 'center' }}>No strategic insights generated.</div>
              )}
            </div>
          )}

          {/* TAB 5: MEMORY PROVENANCE */}
          {activeResultTab === 'provenance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {result.memory_sources && result.memory_sources.length > 0 ? (
                result.memory_sources.map((mem, idx) => (
                  <div key={idx} style={{ padding: '0.85rem 1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#c084fc', fontWeight: 600 }}>
                        Document ID: {mem.memory_document_id}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                        Source: {mem.source_type} | Relevance: {mem.relevance}
                      </div>
                    </div>
                    {mem.event_id && (
                      <span style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#e2e8f0' }}>
                        Event #{mem.event_id}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ padding: '1.5rem', color: '#64748b', textAlign: 'center' }}>No persistent memory provenance items retrieved.</div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
