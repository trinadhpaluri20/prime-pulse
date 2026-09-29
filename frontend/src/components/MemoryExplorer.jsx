import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Search, 
  Send, 
  Database, 
  CheckCircle, 
  Zap,
  Code
} from 'lucide-react';
import { apiService } from '../services/api';

export default function MemoryExplorer({ health }) {
  const [retainContent, setRetainContent] = useState('');
  const [retainContext, setRetainContext] = useState('dev_test_event');
  const [retainResult, setRetainResult] = useState(null);
  const [retainLoading, setRetainLoading] = useState(false);

  const [recallQuery, setRecallQuery] = useState('pricing');
  const [recallResult, setRecallResult] = useState(null);
  const [recallLoading, setRecallLoading] = useState(false);

  const [error, setError] = useState(null);

  const handleTestRetain = async (e) => {
    e.preventDefault();
    if (!retainContent.trim()) return;

    setRetainLoading(true);
    setError(null);
    try {
      const res = await apiService.testMemoryRetain(retainContent, retainContext);
      setRetainResult(res);
      setRetainContent('');
    } catch (err) {
      setError(err.message || 'Memory retention test failed.');
    } finally {
      setRetainLoading(false);
    }
  };

  const handleTestRecall = async (e) => {
    e.preventDefault();
    if (!recallQuery.trim()) return;

    setRecallLoading(true);
    setError(null);
    try {
      const res = await apiService.testMemoryRecall(recallQuery);
      setRecallResult(res);
    } catch (err) {
      setError(err.message || 'Memory recall test failed.');
    } finally {
      setRecallLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(139, 92, 246, 0.15))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '10px', color: '#c084fc' }}>
            <BrainCircuit size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
              Hindsight Persistent Memory Explorer
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Inspect persistent memory bank stores, retain capabilities, and semantic memory recall
            </p>
          </div>
        </div>
      </div>

      {/* Memory Bank System Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>Memory Bank Identifier</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#c084fc', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>
            competitive-intelligence
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>Connection Status</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: health?.hindsight === 'connected' ? '#34d399' : '#fbbf24', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className={`status-dot ${health?.hindsight === 'connected' ? 'healthy' : 'degraded'}`} />
            <span>{health?.hindsight || 'Checking...'}</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>Memory Provider SDK</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>
            hindsight-client v0.10.1
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185' }}>
          {error}
        </div>
      )}

      {/* Grid: Retain Test & Recall Test */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        
        {/* Retain Test Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={18} color="#818cf8" />
            <span>[DEV ONLY] Test Retain Memory</span>
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1rem' }}>
            Directly insert a test memory payload into Hindsight persistent memory.
          </p>

          <form onSubmit={handleTestRetain} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>Memory Content Narrative</label>
              <textarea 
                className="form-textarea"
                rows={3}
                required
                value={retainContent}
                onChange={(e) => setRetainContent(e.target.value)}
                placeholder="Competitor X announced a 25% price reduction on enterprise subscription tiers."
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>Context Tag</label>
              <input 
                type="text"
                className="form-input"
                value={retainContext}
                onChange={(e) => setRetainContext(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={retainLoading || !retainContent.trim()}>
              {retainLoading ? 'Retaining...' : 'Retain Test Memory'}
            </button>
          </form>

          {retainResult && (
            <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '10px', fontSize: '0.82rem', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Retention Success!</div>
              <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', overflowX: 'auto', color: '#cbd5e1' }}>
                {JSON.stringify(retainResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Recall Test Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={18} color="#c084fc" />
            <span>[DEV ONLY] Test Memory Recall</span>
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1rem' }}>
            Execute a vector/semantic search query directly against the memory bank.
          </p>

          <form onSubmit={handleTestRecall} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input 
              type="text"
              className="form-input"
              value={recallQuery}
              onChange={(e) => setRecallQuery(e.target.value)}
              placeholder="e.g. pricing, product release..."
            />
            <button type="submit" className="btn-primary" disabled={recallLoading} style={{ padding: '0.6rem 1rem' }}>
              <Search size={16} />
            </button>
          </form>

          {recallLoading && (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>
              Recalling memories from Hindsight...
            </div>
          )}

          {recallResult && !recallLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Raw Hindsight Recall Payload:</div>
              <div style={{ padding: '0.85rem', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', maxHeight: '250px', overflowY: 'auto' }}>
                <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#cbd5e1' }}>
                  {JSON.stringify(recallResult, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
