import React from 'react';
import { SmartAlert } from '../../types';
import Badge from './Badge';
import { AlertTriangle, Clock, Building2, CheckCircle2, RotateCcw, BrainCircuit, ArrowRight } from 'lucide-react';

interface AlertCardProps {
  alert: SmartAlert;
  onToggleAcknowledge?: (alertId: string) => void;
  onInvestigate?: (alert: SmartAlert) => void;
  className?: string;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onToggleAcknowledge,
  onInvestigate,
  className = '',
}) => {
  const isCritical = alert.severity === 'critical';
  const isHigh = alert.severity === 'high';

  return (
    <div
      className={`alert-card ${className}`}
      style={{
        padding: '1.25rem',
        background: alert.isAcknowledged 
          ? 'rgba(7, 13, 36, 0.45)' 
          : isCritical 
            ? 'rgba(244, 63, 94, 0.07)' 
            : 'rgba(11, 19, 43, 0.75)',
        border: alert.isAcknowledged
          ? '1px solid rgba(255, 255, 255, 0.05)'
          : isCritical
            ? '1px solid rgba(244, 63, 94, 0.35)'
            : isHigh
              ? '1px solid rgba(245, 158, 11, 0.3)'
              : '1px solid var(--border-subtle)',
        borderRadius: '12px',
        opacity: alert.isAcknowledged ? 0.65 : 1,
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      {/* Top Meta Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Badge severity={alert.severity} />
          <Badge category={alert.category} />

          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#38BDF8',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Building2 size={13} />
            {alert.competitorName}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Clock size={12} />
            {new Date(alert.createdAt).toLocaleDateString()}
          </span>

          {onToggleAcknowledge && (
            <button
              onClick={() => onToggleAcknowledge(alert.id)}
              style={{
                background: alert.isAcknowledged ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 210, 255, 0.12)',
                border: alert.isAcknowledged ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 210, 255, 0.3)',
                color: alert.isAcknowledged ? 'var(--text-muted)' : '#38BDF8',
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              {alert.isAcknowledged ? <RotateCcw size={12} /> : <CheckCircle2 size={12} />}
              <span>{alert.isAcknowledged ? 'Reactivate' : 'Acknowledge'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div>
        <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.35rem', lineHeight: 1.35 }}>
          {alert.title}
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          {alert.description}
        </p>
      </div>

      {/* Action Recommendation */}
      {alert.actionRequired && (
        <div
          style={{
            background: 'rgba(139, 92, 246, 0.08)',
            borderLeft: '3px solid #8B5CF6',
            padding: '0.55rem 0.85rem',
            borderRadius: '0 8px 8px 0',
            fontSize: '0.8rem',
            color: '#E2E8F0',
          }}
        >
          <strong style={{ color: '#C084FC' }}>Countermeasure: </strong>
          {alert.actionRequired}
        </div>
      )}

      {/* Bottom Bar */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingTop: '0.55rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: '0.73rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#A855F7', fontFamily: 'var(--font-mono)' }}>
          <BrainCircuit size={12} />
          <span>Memory Ref: <code>{alert.memoryDocId || `alt-${alert.competitorId}`}</code></span>
        </div>

        {onInvestigate && (
          <button
            onClick={() => onInvestigate(alert)}
            className="btn-brand-primary"
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
          >
            <span>Analyze Impact</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertCard;
