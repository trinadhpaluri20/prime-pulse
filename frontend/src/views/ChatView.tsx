import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import Tooltip from '../components/ui/Tooltip';
import Modal from '../components/ui/Modal';
import {
  suggestedChatQuestions,
  mockRecentConversations,
  initialWelcomeMessages,
  generateMockIntelligenceResponse
} from '../mock/mockChatData';
import { chatApi } from '../services/chatApi';
import { ChatMessage, RecentConversationItem } from '../types';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Sparkles,
  ArrowDown,
  Trash2,
  Plus,
  Clock,
  ExternalLink,
  Info,
  Copy,
  Check,
  CheckCircle2,
  RotateCcw,
  Layers,
  History,
  AlertCircle
} from 'lucide-react';

export const ChatView: React.FC = () => {
  const navigate = useNavigate();

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>(initialWelcomeMessages);
  const [conversationId, setConversationId] = useState<string>(() => `conv-${Date.now()}`);
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingPhase, setLoadingPhase] = useState<string>('Reviewing relevant historical activity...');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle Sending a Message
  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend !== undefined ? textToSend : inputText;
    if (!query.trim() || loading) return;

    setErrorNotice(null);

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    // Phased thinking sequence strictly conforming to Section 11 specifications
    setLoadingPhase('Reviewing relevant historical activity...');
    const phaseTimer = setTimeout(() => {
      setLoadingPhase('Preparing intelligence...');
    }, 600);

    const activeConvId = conversationId;

    const finalTimer = setTimeout(async () => {
      try {
        const assistantResponse = await chatApi.sendMessage(query.trim(), activeConvId);
        if (assistantResponse.conversation_id) {
          setConversationId(assistantResponse.conversation_id);
        }
        setMessages(prev => [...prev, assistantResponse]);
      } catch {
        setErrorNotice('AI intelligence is temporarily unavailable. Please try again.');
        const fallback = generateMockIntelligenceResponse(query.trim());
        setMessages(prev => [...prev, fallback]);
      } finally {
        setLoading(false);
      }
    }, 1100);

    return () => {
      clearTimeout(phaseTimer);
      clearTimeout(finalTimer);
    };
  };

  // Keyboard navigation: Enter -> Send, Shift+Enter -> Newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Copy message
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Start New Conversation
  const handleNewConversation = () => {
    setMessages(initialWelcomeMessages);
    setConversationId(`conv-${Date.now()}`);
    setInputText('');
    setErrorNotice(null);
  };

  // Clear Conversation Confirm
  const handleClearChat = () => {
    setMessages([]);
    setConversationId(`conv-${Date.now()}`);
    setShowClearConfirm(false);
    setInputText('');
    setErrorNotice(null);
  };

  // Load a Recent Conversation Preset
  const handleSelectRecent = (recent: RecentConversationItem) => {
    setConversationId(recent.id);
    if (recent.id === 'conv-1') {
      handleSendMessage('What changed for Competitor A in the last 6 months?');
    } else if (recent.id === 'conv-2') {
      handleSendMessage('Which competitors have increasing activity?');
    } else {
      handleSendMessage('What patterns have been detected recently?');
    }
    setShowHistoryDrawer(false);
  };

  const isOnlyWelcome = messages.length === 1 && messages[0].id === 'msg-welcome';

  return (
    <PageContainer style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* 1. Header Bar with Subtle Assistant Status and Chat Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}
          >
            AI Intelligence Chat
          </h1>
          <p
            style={{
              fontSize: '0.84rem',
              color: 'var(--text-secondary)',
              marginTop: '0.25rem',
              lineHeight: 1.4
            }}
          >
            Ask questions about competitor activity, historical patterns, and strategic signals.
          </p>
        </div>

        {/* Right Status Indicator & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.8rem',
              background: 'rgba(0, 210, 255, 0.08)',
              border: '1px solid rgba(0, 210, 255, 0.22)',
              borderRadius: '20px',
              fontSize: '0.75rem',
              color: '#38BDF8',
              fontWeight: 600
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#00D2FF',
                boxShadow: '0 0 8px rgba(0, 210, 255, 0.8)'
              }}
            />
            <span>Intelligence Assistant Active</span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            icon={<History size={13} />}
          >
            Recent
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleNewConversation}
            icon={<Plus size={13} />}
          >
            New Conversation
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowClearConfirm(true)}
            icon={<Trash2 size={13} color="var(--text-muted)" />}
            title="Clear Conversation"
          />
        </div>
      </div>

      {/* Optional Recent Conversations Panel */}
      {showHistoryDrawer && (
        <div
          className="ci-card"
          style={{
            padding: '1rem',
            background: 'rgba(4, 8, 23, 0.95)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Recent Intelligence Inquiries
            </span>
            <button
              onClick={() => setShowHistoryDrawer(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.72rem', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem' }}>
            {mockRecentConversations.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectRecent(item)}
                style={{
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(0, 210, 255, 0.4)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF' }}>{item.title}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{item.dateLabel}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.previewText}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Main Chat Conversation Area */}
      <div
        className="ci-card"
        style={{
          flex: 1,
          padding: '1.25rem 1.5rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.35rem',
          background: 'rgba(7, 13, 36, 0.75)',
          minHeight: 0
        }}
      >
        {/* Welcome State when conversation is empty */}
        {messages.length === 0 ? (
          <div
            style={{
              margin: 'auto',
              maxWidth: '620px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.25rem',
              padding: '2rem 1rem'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'var(--gradient-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0, 210, 255, 0.25)'
              }}
            >
              <Bot size={24} color="#FFFFFF" />
            </div>

            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.015em' }}>
                Ask Competitive Intern
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                Explore your competitor history, discover patterns, and investigate important changes.
              </p>
            </div>

            {/* Suggested Question Cards */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Suggested Inquiries:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.65rem' }}>
                {suggestedChatQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    style={{
                      padding: '0.75rem 0.95rem',
                      background: 'rgba(255, 255, 255, 0.035)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      color: '#E2E8F0',
                      fontSize: '0.8rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      transition: 'border-color 0.15s ease, background 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0, 210, 255, 0.4)';
                      e.currentTarget.style.background = 'rgba(0, 210, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.035)';
                    }}
                  >
                    <span>{q}</span>
                    <Sparkles size={12} color="#00D2FF" style={{ flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
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
                    gap: '0.75rem',
                    maxWidth: isUser ? '82%' : '90%',
                    flexDirection: isUser ? 'row-reverse' : 'row'
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isUser
                        ? 'linear-gradient(135deg, #2563EB, #8B5CF6)'
                        : 'linear-gradient(135deg, #00D2FF, #2563EB)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      flexShrink: 0,
                      marginTop: '2px',
                      boxShadow: isUser
                        ? '0 2px 8px rgba(37, 99, 235, 0.3)'
                        : '0 2px 8px rgba(0, 210, 255, 0.3)'
                    }}
                  >
                    {isUser ? <User size={15} /> : <Bot size={16} />}
                  </div>

                  {/* Message Bubble Card */}
                  <div
                    style={{
                      background: isUser
                        ? 'rgba(37, 99, 235, 0.16)'
                        : 'rgba(11, 19, 43, 0.95)',
                      border: isUser
                        ? '1px solid rgba(0, 210, 255, 0.3)'
                        : '1px solid var(--border-subtle)',
                      borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                      padding: '1.15rem 1.3rem',
                      color: '#F8FAFC',
                      boxShadow: 'var(--shadow-card)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem'
                    }}
                  >
                    {/* Top Bar inside bubble */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isUser ? '#60A5FA' : '#38BDF8' }}>
                          {isUser ? 'Strategy Analyst' : 'Competitive Intern'}
                        </span>
                        {msg.competitorContext && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              padding: '0.1rem 0.45rem',
                              borderRadius: '4px',
                              background: 'rgba(255, 255, 255, 0.06)',
                              color: '#CBD5E1',
                              border: '1px solid var(--border-subtle)'
                            }}
                          >
                            {msg.competitorContext}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {msg.timestamp}
                        </span>
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Copy message"
                        >
                          {copiedId === msg.id ? <Check size={12} color="#00D2FF" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>

                    {/* Primary Content Text */}
                    <div style={{ fontSize: '0.88rem', lineHeight: 1.6, whiteSpace: 'pre-line', color: '#F1F5F9' }}>
                      {msg.content}
                    </div>

                    {/* STRUCTURED INTELLIGENCE RESPONSE: Summary, Key Findings, Historical Evidence */}
                    {!isUser && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingTop: '0.5rem' }}>
                        
                        {/* 1. Summary Section */}
                        {msg.summary && (
                          <div
                            style={{
                              padding: '0.75rem 0.95rem',
                              background: 'rgba(0, 210, 255, 0.05)',
                              border: '1px solid rgba(0, 210, 255, 0.2)',
                              borderRadius: 'var(--radius-md)'
                            }}
                          >
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              Intelligence Summary
                            </span>
                            <p style={{ fontSize: '0.82rem', color: '#E2E8F0', marginTop: '0.2rem', lineHeight: 1.45 }}>
                              {msg.summary}
                            </p>
                          </div>
                        )}

                        {/* 2. Key Findings Section */}
                        {msg.keyFindings && msg.keyFindings.length > 0 && (
                          <div
                            style={{
                              padding: '0.75rem 0.95rem',
                              background: 'rgba(255, 255, 255, 0.03)',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border-subtle)'
                            }}
                          >
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              Key Findings
                            </span>
                            <ul style={{ margin: '0.35rem 0 0 1rem', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              {msg.keyFindings.map((finding, fIdx) => (
                                <li key={fIdx} style={{ fontSize: '0.8rem', color: '#CBD5E1', lineHeight: 1.4 }}>
                                  {finding}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* 3. Historical Evidence Section */}
                        {msg.evidence && (
                          <div
                            style={{
                              padding: '0.9rem 1.05rem',
                              background: 'rgba(7, 13, 36, 0.85)',
                              border: '1px solid rgba(0, 210, 255, 0.22)',
                              borderRadius: 'var(--radius-md)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.7rem'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Clock size={14} color="#00D2FF" />
                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38BDF8' }}>
                                  Historical Evidence
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  <strong style={{ color: '#E2E8F0' }}>{msg.evidence.eventsCount} related events</strong> • <strong style={{ color: '#C084FC' }}>{msg.evidence.matchesCount} previous matches</strong>
                                </span>

                                {msg.evidence.confidence && (
                                  <Tooltip content="Confidence reflects the strength and recurrence of supporting historical evidence.">
                                    <span
                                      style={{
                                        fontSize: '0.72rem',
                                        fontWeight: 800,
                                        color: '#38BDF8',
                                        background: 'rgba(0, 210, 255, 0.1)',
                                        border: '1px solid rgba(0, 210, 255, 0.25)',
                                        padding: '0.1rem 0.45rem',
                                        borderRadius: '12px',
                                        cursor: 'help'
                                      }}
                                    >
                                      {msg.evidence.confidence}% Conf.
                                    </span>
                                  </Tooltip>
                                )}
                              </div>
                            </div>

                            {/* Stepper Flow */}
                            {msg.evidence.sequence && msg.evidence.sequence.length > 0 && (
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.35rem',
                                  background: 'rgba(3, 7, 18, 0.65)',
                                  padding: '0.65rem 0.85rem',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border-subtle)'
                                }}
                              >
                                {msg.evidence.sequence.map((step, sIdx) => (
                                  <React.Fragment key={sIdx}>
                                    {sIdx > 0 && (
                                      <div
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.35rem',
                                          margin: '0.1rem 0 0.1rem 1rem',
                                          color: '#00D2FF',
                                          fontSize: '0.7rem',
                                          fontWeight: 600
                                        }}
                                      >
                                        <ArrowDown size={12} color="#00D2FF" />
                                        <span>{step.daysOffset ? `${step.daysOffset} days` : 'Follow-on move'}</span>
                                      </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <div
                                        style={{
                                          width: '7px',
                                          height: '7px',
                                          borderRadius: '50%',
                                          background: sIdx === 0 ? '#00D2FF' : 'rgba(255, 255, 255, 0.25)'
                                        }}
                                      />
                                      <span style={{ fontSize: '0.78rem', color: sIdx === 0 ? '#FFFFFF' : '#CBD5E1', fontWeight: sIdx === 0 ? 700 : 500 }}>
                                        {step.label}
                                      </span>
                                      {step.date && (
                                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
                                          {step.date}
                                        </span>
                                      )}
                                    </div>
                                  </React.Fragment>
                                ))}
                              </div>
                            )}

                            {/* OBSERVED DATA vs AI INTERPRETATION */}
                            {msg.evidence.observedData && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.2rem' }}>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>OBSERVED: </span>
                                  {msg.evidence.observedData.join(' ')}
                                </div>
                                {msg.evidence.aiInterpretation && (
                                  <div style={{ fontSize: '0.72rem', color: '#C4B5FD' }}>
                                    <span style={{ fontWeight: 700, color: '#A855F7' }}>AI INTERPRETATION: </span>
                                    {msg.evidence.aiInterpretation}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* View Timeline Action */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.35rem' }}>
                              <button
                                onClick={() => navigate('/timeline')}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#38BDF8',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  padding: '0.2rem 0',
                                  transition: 'color 0.15s ease'
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '#38BDF8')}
                              >
                                <span>View Timeline</span>
                                <ExternalLink size={12} />
                              </button>
                            </div>

                          </div>
                        )}

                      </div>
                    )}

                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Phased Thinking / Processing State */}
        {loading && (
          <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '85%' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--gradient-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                flexShrink: 0
              }}
            >
              <Bot size={15} className="spin-animation" />
            </div>

            <div
              style={{
                flex: 1,
                background: 'rgba(11, 19, 43, 0.9)',
                border: '1px solid rgba(0, 210, 255, 0.25)',
                borderRadius: '4px 14px 14px 14px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#38BDF8' }}>Competitive Intern</span>
                <span style={{ fontSize: '0.72rem', color: '#00D2FF', fontFamily: 'var(--font-mono)' }}>
                  {loadingPhase}
                </span>
              </div>
              <div className="skeleton-shimmer" style={{ width: '90%', height: '0.85rem' }} />
              <div className="skeleton-shimmer" style={{ width: '75%', height: '0.85rem' }} />
              <div className="skeleton-shimmer" style={{ width: '45%', height: '0.85rem' }} />
            </div>
          </div>
        )}

        {/* Error Notice */}
        {errorNotice && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#FB7185',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <AlertCircle size={14} />
            <span>{errorNotice}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Suggested Prompt Chips (Always available above input) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          overflowX: 'auto',
          padding: '0.2rem 0',
          scrollbarWidth: 'none'
        }}
      >
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          Suggested:
        </span>
        {suggestedChatQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={loading}
            style={{
              padding: '0.3rem 0.75rem',
              background: 'rgba(7, 13, 36, 0.85)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              fontSize: '0.74rem',
              color: 'var(--text-secondary)',
              cursor: loading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.borderColor = 'rgba(0, 210, 255, 0.4)';
                e.currentTarget.style.color = '#FFFFFF';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* 4. Professional Message Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '0.75rem',
          background: 'rgba(7, 13, 36, 0.95)',
          padding: '0.65rem 0.95rem',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          className="ci-input"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: '#FFFFFF',
            padding: '0.35rem 0.2rem',
            resize: 'none',
            fontSize: '0.85rem',
            lineHeight: 1.45,
            maxHeight: '120px'
          }}
          placeholder="Ask about competitors, history, or patterns..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />

        <button
          type="submit"
          className="btn-brand-primary"
          disabled={!inputText.trim() || loading}
          style={{
            padding: '0.5rem 0.95rem',
            fontSize: '0.8rem',
            flexShrink: 0
          }}
          aria-label="Send message"
        >
          <span>Send</span>
          <Send size={14} />
        </button>
      </form>

      {/* 5. Clear Conversation Confirmation Modal */}
      {showClearConfirm && (
        <Modal
          isOpen={showClearConfirm}
          onClose={() => setShowClearConfirm(false)}
          title="Clear Conversation"
          subtitle="Are you sure you want to clear the current chat history?"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleClearChat}
              >
                Clear Messages
              </Button>
            </>
          }
        >
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Clearing the conversation resets your current session. All underlying historical competitor data, patterns, and timelines remain fully preserved.
          </p>
        </Modal>
      )}

    </PageContainer>
  );
};

export default ChatView;
