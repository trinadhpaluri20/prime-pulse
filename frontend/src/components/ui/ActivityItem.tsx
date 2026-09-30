import React from 'react';
import { ActivityEvent } from '../../types';
import Badge from './Badge';
import { Clock, Building2, BrainCircuit, ExternalLink, ArrowRight } from 'lucide-react';

interface ActivityItemProps {
  event: ActivityEvent;
  onSelectCompetitor?: (competitorId: number) => void;
  className?: string;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
  event,
  onSelectCompetitor,
  className = '',
}) => {
  const formattedDate = new Date(event.eventDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div
      className={`activity-card ${className}`}
      style={{
        padding: '1.15rem',
        background: 'rgba(7, 13, 36, 0.65)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0, 210, 255, 0.3)';
        e.currentTarget.style.background = 'rgba(11, 19, 43, 0.85)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.background = 'rgba(7, 13, 36, 0.65)';
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <Badge category={event.category} />
          
          <button
            onClick={() => onSelectCompetitor?.(event.competitorId)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#38BDF8',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              cursor: onSelectCompetitor ? 'pointer' : 'default',
              padding: 0,
            }}
          >
            <Building2 size={13} />
            <span>{event.competitorName}</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Badge severity={event.importance} size="sm" />

          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <Clock size={12} />
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Headline & Description */}
      <div>
        <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.35rem', lineHeight: 1.4 }}>
          {event.title}
        </h4>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          {event.description}
        </p>
      </div>

      {/* State Transition (e.g. Price or VP change) */}
      {(event.previousValue || event.newValue) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '0.45rem 0.75rem',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {event.previousValue && (
            <span style={{ color: '#FB7185', textDecoration: 'line-through' }}>
              {event.previousValue}
            </span>
          )}
          <ArrowRight size={13} color="#94A3B8" />
          {event.newValue && (
            <span style={{ color: '#38BDF8', fontWeight: 700 }}>
              {event.newValue}
            </span>
          )}
        </div>
      )}

      {/* Footer Provenance */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingTop: '0.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          fontSize: '0.72rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#A855F7' }}>
          <BrainCircuit size={12} />
          <span>Memory Ref: <code>{event.memoryDocId || `doc-${event.competitorId}`}</code></span>
        </div>

        {event.sourceUrl && (
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span>{event.sourceName || 'Source'}</span>
            <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
};

export default ActivityItem;
