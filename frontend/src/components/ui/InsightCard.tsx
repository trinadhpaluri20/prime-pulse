import React from 'react';
import { StrategicInsight } from '../../types';
import Badge from './Badge';
import { Sparkles, BrainCircuit, CheckCircle2, TrendingUp, ShieldCheck } from 'lucide-react';

interface InsightCardProps {
  insight: StrategicInsight;
  className?: string;
  onExploreCitation?: (citation: string) => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  className = '',
  onExploreCitation,
}) => {
  const getTypeColor = () => {
    switch (insight.type) {
      case 'pattern':
        return { text: '#38BDF8', border: 'rgba(0, 210, 255, 0.3)', bg: 'rgba(0, 210, 255, 0.1)' };
      case 'prediction':
        return { text: '#C084FC', border: 'rgba(168, 85, 247, 0.3)', bg: 'rgba(168, 85, 247, 0.1)' };
      case 'threat':
        return { text: '#FB7185', border: 'rgba(244, 63, 94, 0.3)', bg: 'rgba(244, 63, 94, 0.1)' };
      case 'swot':
      default:
        return { text: '#818CF8', border: 'rgba(99, 102, 241, 0.3)', bg: 'rgba(99, 102, 241, 0.1)' };
    }
  };

  const currentTheme = getTypeColor();

  return (
    <div
      className={`ci-card ${className}`}
      style={{
        padding: '1.4rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.9rem',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              padding: '0.2rem 0.55rem',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: currentTheme.text,
              background: currentTheme.bg,
              border: `1px solid ${currentTheme.border}`,
            }}
          >
            {insight.type}
          </span>

          <Badge category={insight.category} />

          {insight.competitorName && (
            <span style={{ fontSize: '0.8rem', color: '#FFFFFF', fontWeight: 700 }}>
              {insight.competitorName}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38BDF8', fontSize: '0.76rem', fontWeight: 700 }}>
          <ShieldCheck size={14} />
          <span>{insight.confidenceScore}% AI Confidence</span>
        </div>
      </div>

      {/* Title & Summary */}
      <div>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.45rem', lineHeight: 1.35 }}>
          {insight.title}
        </h4>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {insight.summary}
        </p>
      </div>

      {/* Facts Breakdown */}
      {insight.facts && insight.facts.length > 0 && (
        <div style={{ background: 'rgba(4, 8, 25, 0.65)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '0.85rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            Verifiable Evidence from Memory:
          </div>
          <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
            {insight.facts.map((f, i) => (
              <li key={i} style={{ fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '0.25rem', lineHeight: 1.45 }}>
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Strategic Implications */}
      {insight.implications && insight.implications.length > 0 && (
        <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '10px', padding: '0.85rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#C084FC', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            Strategic Countermeasures & Action:
          </div>
          <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
            {insight.implications.map((imp, i) => (
              <li key={i} style={{ fontSize: '0.8rem', color: '#E2E8F0', marginBottom: '0.25rem', lineHeight: 1.45 }}>
                {imp}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Citations Footer */}
      {insight.citations && insight.citations.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
          <span style={{ fontSize: '0.72rem', color: '#A855F7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <BrainCircuit size={12} />
            Memory Provenance:
          </span>
          {insight.citations.map((c, i) => (
            <button
              key={i}
              onClick={() => onExploreCitation?.(c)}
              style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                color: '#38BDF8',
                borderRadius: '4px',
                padding: '0.15rem 0.45rem',
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)',
                cursor: onExploreCitation ? 'pointer' : 'default',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default InsightCard;
