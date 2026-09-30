import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  BrainCircuit, 
  Sparkles, 
  RefreshCw, 
  Building2, 
  Download, 
  Trash2, 
  Copy, 
  Check, 
  AlertCircle,
  HelpCircle,
  Zap,
  ArrowRight
} from 'lucide-react';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AIChatView({ competitors = [] }) {
  const { addToast } = useToast();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am your AI Competitive Intelligence Agent with direct access to Hindsight persistent memory and real-time market event records. Ask me anything about tracked competitor trajectories, pricing shifts, feature releases, or hiring signals.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      memoryProvenance: null,
      facts: [
        "Persistent memory bank active with dual relational and vector recall.",
        "Grounding strictly enforces verifiable event provenance without hallucination."
      ],
      observations: [
        "Select a specific competitor or query across all tracked market entities.",
        "Click any suggestion prompt below to start instant strategic reasoning."
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [selectedCompId, setSelectedCompId] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    "What are recent pricing & packaging shifts across competitors?",
    "Detect any patterns or velocity changes in competitor releases",
    "Analyze hiring signals and engineering expansion moves",
    "What are the main strategic threats identified this quarter?",
    "Compare core feature parity between tracked competitors"
  ];

  const handleSend = async (queryText = null) => {
    const textToSend = queryText || inputValue;
    if (!textToSend || !textToSend.trim() || loading) return;

    const userMessageId = `user-${Date.now()}`;
    const newMsg = {
      id: userMessageId,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      competitorContext: selectedCompId ? competitors.find(c => String(c.id) === String(selectedCompId))?.name : 'All Competitors'
    };

    setMessages(prev => [...prev, newMsg]);
    if (!queryText) setInputValue('');
    setLoading(true);

    try {
      const payload = {
        query: textToSend.trim(),
        competitor_id: selectedCompId ? parseInt(selectedCompId, 10) : null
      };

      const result = await apiService.analyzeIntelligence(payload);

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: result.summary || "Intelligence analysis retrieved from Hindsight memory bank.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        competitor: result.competitor?.name || (selectedCompId ? competitors.find(c => String(c.id) === String(selectedCompId))?.name : null),
        facts: result.facts || [],
        observations: result.observations || [],
        insights: result.insights || [],
        memoryProvenance: result.memory_sources || [],
        limitations: result.limitations || [],
        geminiStatus: result.gemini_status
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('AI Chat Error:', err);
      // Fallback response using local recall or structured error
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          isError: true,
          content: `Unable to complete AI query: ${err.message || 'Service temporarily unavailable'}. Please verify your API key or backend status.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          facts: [],
          observations: []
        }
      ]);
      addToast(err.message || 'Failed to query AI Agent', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Chat history cleared. Hindsight persistent memory remains fully preserved and ready for queries.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        memoryProvenance: null
      }
    ]);
    addToast('Conversation history reset.', 'info');
  };

  const handleExportChat = () => {
    const chatText = messages.map(m => {
      const sender = m.role === 'user' ? 'USER' : 'COMPETITIVE INTERN';
      let block = `[${m.timestamp}] ${sender}:\n${m.content}\n`;
      if (m.facts && m.facts.length > 0) {
        block += `\nFACTS:\n${m.facts.map(f => ` - ${f}`).join('\n')}\n`;
      }
      if (m.insights && m.insights.length > 0) {
        block += `\nINSIGHTS:\n${m.insights.map(i => ` - ${i}`).join('\n')}\n`;
      }
      return block;
    }).join('\n----------------------------------------\n\n');

    const blob = new Blob([chatText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ci-agent-chat-export-${new Date().toISOString().substring(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Chat exported as Markdown file.', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', minHeight: '620px', gap: '1rem' }} className="fade-in-up">
      
      {/* Chat Header Controls */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #06b6d4, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }}>
            <BrainCircuit size={22} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span>AI Chat with Hindsight Memory</span>
              <span className="badge-cat cat-product" style={{ fontSize: '0.7rem' }}>Groq LLM + Vector Bank</span>
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Conversational strategic Q&A strictly grounded in verifiable competitor events and long-term memory
            </p>
          </div>
        </div>

        {/* Competitor Filter & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Building2 size={15} color="#94a3b8" />
            <select 
              className="form-select" 
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.82rem', width: '180px' }}
              value={selectedCompId}
              onChange={(e) => setSelectedCompId(e.target.value)}
            >
              <option value="">All Competitors</option>
              {competitors.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <button 
            className="btn-secondary" 
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
            onClick={handleExportChat}
            title="Export conversation as Markdown"
          >
            <Download size={14} />
            <span>Export</span>
          </button>

          <button 
            className="btn-secondary" 
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', color: '#fb7185' }}
            onClick={handleClearHistory}
            title="Clear Chat History"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div 
        className="glass-card" 
        style={{ 
          flex: 1, 
          padding: '1.5rem', 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.25rem',
          background: 'rgba(11, 15, 25, 0.75)'
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div 
              key={msg.id} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: isUser ? 'flex-end' : 'flex-start',
                width: '100%' 
              }}
            >
              <div 
                style={{ 
                  display: 'flex', 
                  gap: '0.65rem', 
                  maxWidth: isUser ? '78%' : '90%',
                  flexDirection: isUser ? 'row-reverse' : 'row' 
                }}
              >
                {/* Avatar */}
                <div 
                  style={{ 
                    width: '34px', 
                    height: '34px', 
                    borderRadius: '10px', 
                    background: isUser ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #06b6d4, #10b981)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                    color: '#ffffff'
                  }}
                >
                  {isUser ? <User size={16} /> : <Bot size={18} />}
                </div>

                {/* Message Bubble Card */}
                <div 
                  style={{ 
                    background: isUser 
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.18))' 
                      : 'rgba(15, 23, 42, 0.9)',
                    border: isUser 
                      ? '1px solid rgba(99, 102, 241, 0.4)' 
                      : msg.isError ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    padding: '1.15rem',
                    color: '#f8fafc',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    position: 'relative'
                  }}
                >
                  {/* Sender & Timestamp Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '0.45rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isUser ? '#a5b4fc' : '#38bdf8' }}>
                        {isUser ? 'Strategy Analyst' : 'Competitive Intern'}
                      </span>
                      {msg.competitorContext && (
                        <span style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.45rem', borderRadius: '4px', color: '#94a3b8' }}>
                          Target: {msg.competitorContext}
                        </span>
                      )}
                      {msg.competitor && (
                        <span style={{ fontSize: '0.68rem', background: 'rgba(6, 182, 212, 0.15)', color: '#67e8f9', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                          {msg.competitor}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {msg.timestamp}
                      </span>
                      <button 
                        onClick={() => handleCopy(msg.id, msg.content)}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                        title="Copy text"
                      >
                        {copiedId === msg.id ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>

                  {/* Body Text */}
                  <div style={{ fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-line', color: msg.isError ? '#fb7185' : '#f1f5f9' }}>
                    {msg.content}
                  </div>

                  {/* Verifiable Facts Block */}
                  {msg.facts && msg.facts.length > 0 && (
                    <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                        Verifiable Facts from Memory:
                      </div>
                      <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
                        {msg.facts.map((fact, idx) => (
                          <li key={idx} style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.25rem', lineHeight: 1.4 }}>
                            {fact}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Strategic Observations / Insights */}
                  {msg.insights && msg.insights.length > 0 && (
                    <div style={{ marginTop: '0.65rem' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                        Strategic Insights:
                      </div>
                      <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
                        {msg.insights.map((ins, idx) => (
                          <li key={idx} style={{ fontSize: '0.8rem', color: '#e2e8f0', marginBottom: '0.25rem', lineHeight: 1.4 }}>
                            {ins}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Memory Provenance Badges */}
                  {msg.memoryProvenance && msg.memoryProvenance.length > 0 && (
                    <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <BrainCircuit size={12} />
                        Memory Citations:
                      </span>
                      {msg.memoryProvenance.slice(0, 4).map((p, idx) => (
                        <span 
                          key={idx} 
                          style={{ 
                            fontSize: '0.68rem', 
                            padding: '0.15rem 0.45rem', 
                            borderRadius: '4px', 
                            background: 'rgba(52, 211, 153, 0.1)', 
                            border: '1px solid rgba(52, 211, 153, 0.25)', 
                            color: '#6ee7b7', 
                            fontFamily: 'var(--font-mono)' 
                          }}
                        >
                          {p.memory_document_id || `doc-${p.event_id || idx}`}
                        </span>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Thinking Indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #06b6d4, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <Bot size={17} className="spin" />
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={16} color="#38bdf8" />
              <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                Querying Hindsight memory bank & synthesizing reasoning with Groq LLM...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Query Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', padding: '0.25rem 0.5rem' }}>
        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          Suggested:
        </span>
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            style={{
              padding: '0.35rem 0.75rem',
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              fontSize: '0.76rem',
              color: '#cbd5e1',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.color = '#cbd5e1'; }}
          >
            <Sparkles size={11} color="#818cf8" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        style={{ 
          display: 'flex', 
          gap: '0.75rem', 
          background: 'rgba(15, 23, 42, 0.95)', 
          padding: '0.85rem 1rem', 
          borderRadius: '14px', 
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
        }}
      >
        <input 
          type="text"
          className="form-input"
          style={{ 
            background: 'transparent', 
            border: 'none', 
            fontSize: '0.92rem',
            padding: '0.2rem 0.5rem',
            color: '#ffffff'
          }}
          placeholder={selectedCompId ? `Ask about competitor moves, pricing shifts, or timeline...` : `Ask about any competitor, pricing shifts, hiring moves, or market signals...`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={loading}
          autoFocus
        />

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={!inputValue.trim() || loading}
          style={{ padding: '0.65rem 1.25rem', flexShrink: 0 }}
        >
          {loading ? <RefreshCw size={16} className="spin" /> : <Send size={16} />}
          <span>Send</span>
        </button>
      </form>

    </div>
  );
}
