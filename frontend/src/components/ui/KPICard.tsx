import React from 'react';
import { KPIStat } from '../../types';
import { TrendingUp, TrendingDown, Building2, Clock, Database, ShieldAlert } from 'lucide-react';

interface KPICardProps {
  stat: KPIStat;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  stat,
  icon,
  className = '',
  onClick,
}) => {
  const getCategoryTheme = () => {
    switch (stat.category) {
      case 'competitors':
        return {
          bg: 'rgba(59, 130, 246, 0.12)',
          color: '#60A5FA',
          border: 'rgba(59, 130, 246, 0.25)',
        };
      case 'signals':
        return {
          bg: 'rgba(0, 210, 255, 0.12)',
          color: '#38BDF8',
          border: 'rgba(0, 210, 255, 0.25)',
        };
      case 'memory':
        return {
          bg: 'rgba(139, 92, 246, 0.12)',
          color: '#C084FC',
          border: 'rgba(139, 92, 246, 0.25)',
        };
      case 'threats':
        return {
          bg: 'rgba(217, 70, 239, 0.12)',
          color: '#F472B6',
          border: 'rgba(217, 70, 239, 0.25)',
        };
      default:
        return {
          bg: 'rgba(0, 210, 255, 0.12)',
          color: '#38BDF8',
          border: 'rgba(0, 210, 255, 0.25)',
        };
    }
  };

  const theme = getCategoryTheme();

  return (
    <div
      onClick={onClick}
      className={`ci-card ${className}`}
      style={{
        padding: '1.35rem',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-secondary)',
            }}
          >
            {stat.label}
          </span>
          <div
            style={{
              fontSize: '1.9rem',
              fontWeight: 800,
              color: '#FFFFFF',
              marginTop: '0.35rem',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {stat.value}
          </div>
        </div>

        <div
          style={{
            padding: '0.6rem',
            borderRadius: 'var(--radius-md)',
            background: theme.bg,
            color: theme.color,
            border: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon || (
            stat.category === 'competitors' ? <Building2 size={16} /> :
            stat.category === 'signals' ? <Clock size={16} /> :
            stat.category === 'memory' ? <Database size={16} /> :
            <ShieldAlert size={16} />
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.85rem' }}>
        {stat.change && (
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              color: stat.isPositiveChange ? '#38BDF8' : '#FB7185',
              background: stat.isPositiveChange ? 'rgba(56, 189, 248, 0.1)' : 'rgba(251, 113, 133, 0.1)',
              padding: '0.12rem 0.4rem',
              borderRadius: '5px',
            }}
          >
            {stat.isPositiveChange ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {stat.change}
          </span>
        )}

        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {stat.subtext}
        </span>
      </div>
    </div>
  );
};

export default KPICard;
