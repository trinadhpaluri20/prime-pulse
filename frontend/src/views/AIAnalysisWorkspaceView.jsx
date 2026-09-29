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
  RefreshCw,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AIAnalysisWorkspaceView({ initialCompetitor, competitors }) {
  const { addToast } = useToast();
  const [queryText, setQueryText] = useState('');
  const [selectedCompId, setSelectedCompId] = useState(initialCompetitor?.id || '');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisTime, setAnalysisTime] = useState(null);

  const presetQueries = [
    "What has Microsoft AI done in the last 90 days and what patterns can be observed?",
    "Analyze pricing and subscription model shifts across all tracked competitors.",
    "Summarize product releases and strategic partnerships in the last 6 months.",
    "Detect strategic pivots and proactive posture changes.",
  ];

  const reasoningSteps = [
    "1. Retrieving historical context & memories...",
    "2. Searching competitor timeline records...",
    "3. Collecting multi-category market signals...",
    "4. Constructing evidence context payload...",
    "5. Executing Gemini LLM reasoning model...",
    "6. Assembling evidence-grounded intelligence report...",
  ];

  useEffect(() => {
    if (initialCompetitor) {
      setSelectedCompId(initialCompetitor.id);
      setQueryText(`What key strategic events and patterns are recorded for ${initialCompetitor.name}?`);
    }
  }, [initialCompetitor]);

  const handleRunAnalysis = async (customQuery) => {
    const activeQuery = customQuery || queryText;
    if (!activeQuery.trim()) return;

    setLoading(true);
    setLoadingStep(0);
    setError(null);

    // Simulate multi-stage visual progress while actual fetch executes
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < reasoningSteps.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      const payload = {
        query: activeQuery,
        competitor_id: selectedCompId ? parseInt(selectedCompId, 10) : null,
      };

      const data = await apiService.analyzeIntelligence(payload);
      setAnalysisResult(data);
      setAnalysisTime(new Date().toLocaleString());
      addToast('Gemini AI strategy reasoning generated successfully!', 'success');
    } catch (err) {
      setError(err.message || 'AI Agent reasoning failed.');
      addToast(err.message || 'AI Agent reasoning failed.', 'error');
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }} className="fade-in-up">
      
      {/* Header Banner & Query Console */}
      <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(99, 102, 241, 0.15))' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ padding: '0.65rem', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '12px', color: '#a5b4fc' }}>
            <Bot size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
              Gemini AI Strategy Reasoning Workspace
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Evidence-grounded competitive intelligence synthesis using <code style={{ color: '#a5b4fc' }}>gemini-2.5-flash</code> & Hindsight memory
            </p>
          </div>
        </div>

        {/* Input Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            
            {/* Competitor Selector */}
            <div style={{ minWidth: '240px' }}>
              <select 
                className="form-select"
                value={selectedCompId}
                onChange={(e) => setSelectedCompId(e.target.value)}
              >
                <option value="">All Tracked Competitors</option>
                {competitors.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Query Input */}
            <div style={{ flex: 1, minWidth: '320px' }}>
              <input 
                type="text"
                className="form-input"
                placeholder="Enter strategic query (e.g. What has Microsoft AI done in the last 90 days?)"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunAnalysis()}
              />
            </div>

            <button 
              className="btn-primary"
              onClick={() => handleRunAnalysis()}
              disabled={loading || !queryText.trim()}
              style={{ minWidth: '160px', justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin" />
                  <span>Reasoning...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Run Analysis</span>
                </>
              )}
            </button>

          </div>

          {/* Preset Prompts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Preset Queries:</span>
            {presetQueries.map((p, idx) => (
              <button 
                key={idx}
                onClick={() => {
                  setQueryText(p);
                  handleRunAnalysis(p);
                }}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => { e.target.style.color = '#ffffff'; e.target.style.borderColor = 'rgba(99, 102, 241, 0.4)'; }}
                onMouseOut={(e) => { e.target.style.color = '#94a3b8'; e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'; }}
              >
                {p}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Loading Progress State */}
      {loading && (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <BrainCircuit size={52} color="#6366f1" className="spin" style={{ margin: '0 auto 1.25rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            Executing Gemini AI Strategy Pipeline
          </h3>
          
          <div style={{ maxWidth: '480px', margin: '1rem auto 0', background: 'rgba(15, 23, 42, 0.8)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'left' }}>
            <div style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              {reasoningSteps[loadingStep]}
            </div>
            <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', marginTop: '0.75rem', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((loadingStep + 1) / reasoningSteps.length) * 100}%`, background: 'linear-gradient(90deg, #6366f1, #34d399)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        </div>
      )}

      {/* Structured Intelligence Report Output */}
      {analysisResult && !loading && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          
          {/* Header Metadata Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span className={`status-pill ${analysisResult.status === 'success' ? 'healthy' : 'degraded'}`}>
                  {analysisResult.status === 'success' ? 'AI Intelligence Report' : 'Degraded Fallback Mode'}
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                  {analysisResult.competitor?.name || 'Competitor Intelligence Analysis'}
                </h3>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span>Query: "{analysisResult.query}"</span>
                <span>•</span>
                <span>Generated: {analysisTime}</span>
              </div>
            </div>

            <button className="btn-secondary" onClick={() => setAnalysisResult(null)}>
              <span>Run New Analysis</span>
            </button>
          </div>

          {/* 1. EXECUTIVE SUMMARY */}
          <div style={{ marginTop: '1.75rem', background: 'rgba(15, 23, 42, 0.7)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={16} />
              <span>Executive Intelligence Summary</span>
            </div>
            <p style={{ color: '#e2e8f0', fontSize: '1.02rem', lineHeight: 1.7 }}>
              {analysisResult.summary}
            </p>
          </div>

          {/* 2. VERIFIABLE FACTS SECTION */}
          <div style={{ marginTop: '1.75rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} />
              <span>Verifiable Recorded Facts ({analysisResult.facts?.length || 0})</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {analysisResult.facts && analysisResult.facts.length > 0 ? (
                analysisResult.facts.map((fact, idx) => (
                  <div key={idx} style={{ padding: '0.95rem 1.1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', borderLeft: '3px solid #34d399', color: '#f1f5f9', fontSize: '0.93rem', lineHeight: 1.5 }}>
                    {fact}
                  </div>
                ))
              ) : (
                <div style={{ padding: '1.25rem', color: '#64748b', fontSize: '0.88rem' }}>No specific facts recorded.</div>
              )}
            </div>
          </div>

          {/* 3. OBSERVED PATTERNS SECTION */}
          <div style={{ marginTop: '1.75rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#67e8f9', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={18} />
              <span>Derived Pattern Observations ({analysisResult.observations?.length || 0})</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {analysisResult.observations && analysisResult.observations.length > 0 ? (
                analysisResult.observations.map((obs, idx) => (
                  <div key={idx} style={{ padding: '0.95rem 1.1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', borderLeft: '3px solid #67e8f9', color: '#f1f5f9', fontSize: '0.93rem', lineHeight: 1.5 }}>
                    {obs}
                  </div>
                ))
              ) : (
                <div style={{ padding: '1.25rem', color: '#64748b', fontSize: '0.88rem' }}>No specific observations derived.</div>
              )}
            </div>
          </div>

          {/* 4. STRATEGIC INSIGHTS SECTION (HIGHLIGHTED AI REASONING LAYER) */}
          <div style={{ marginTop: '1.75rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#c084fc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lightbulb size={18} />
              <span>Reasoned Strategic Insights ({analysisResult.insights?.length || 0})</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {analysisResult.insights && analysisResult.insights.length > 0 ? (
                analysisResult.insights.map((ins, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      padding: '1.1rem 1.25rem', 
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))', 
                      borderRadius: '11px', 
                      borderLeft: '4px solid #a5b4fc', 
                      color: '#ffffff', 
                      fontSize: '0.98rem', 
                      fontWeight: 500,
                      lineHeight: 1.6,
                      boxShadow: '0 4px 15px rgba(99, 102, 241, 0.1)'
                    }}
                  >
                    {ins}
                  </div>
                ))
              ) : (
                <div style={{ padding: '1.25rem', color: '#64748b', fontSize: '0.88rem' }}>No strategic insights generated.</div>
              )}
            </div>
          </div>

          {/* 5. MEMORY PROVENANCE CITATIONS */}
          {analysisResult.memory_sources && analysisResult.memory_sources.length > 0 && (
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BrainCircuit size={16} color="#c084fc" />
                <span>Memory Provenance & Citation Traceability ({analysisResult.memory_sources.length})</span>
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {analysisResult.memory_sources.map((mem, idx) => (
                  <div key={idx} style={{ padding: '0.75rem 0.95rem', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '9px', border: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.78rem' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', color: '#c084fc', fontWeight: 600 }}>
                      Doc ID: {mem.memory_document_id}
                    </div>
                    <div style={{ color: '#64748b', marginTop: '0.2rem' }}>
                      Relevance: {mem.relevance} | Source: {mem.source_type}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. DECLARED LIMITATIONS */}
          {analysisResult.limitations && analysisResult.limitations.length > 0 && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.25)', fontSize: '0.82rem', color: '#fbbf24' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldAlert size={15} />
                <span>Declared Data & Evidence Constraints</span>
              </div>
              <ul style={{ paddingLeft: '1.2rem', color: '#cbd5e1' }}>
                {analysisResult.limitations.map((lim, idx) => (
                  <li key={idx}>{lim}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
