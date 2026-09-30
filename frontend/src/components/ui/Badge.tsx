import React from 'react';
import { EventCategory, AlertSeverity, EventImportance } from '../../types';

interface BadgeProps {
  category?: EventCategory;
  severity?: AlertSeverity | EventImportance;
  variant?: 'cyan' | 'blue' | 'violet' | 'purple' | 'magenta' | 'neutral';
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  category,
  severity,
  variant,
  children,
  className = '',
  size = 'md',
}) => {
  if (category) {
    return (
      <span className={`badge-category badge-${category} ${className}`}>
        {children || category}
      </span>
    );
  }

  if (severity) {
    const sevClass = `badge-sev-${severity.toLowerCase()}`;
    return (
      <span 
        className={`badge-category ${sevClass} ${className}`}
        style={{
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontSize: size === 'sm' ? '0.65rem' : '0.72rem',
        }}
      >
        {children || severity}
      </span>
    );
  }

  const variantColors: Record<string, { bg: string; color: string; border: string }> = {
    cyan: { bg: 'rgba(0, 210, 255, 0.12)', color: '#38BDF8', border: 'rgba(0, 210, 255, 0.3)' },
    blue: { bg: 'rgba(59, 130, 246, 0.12)', color: '#93C5FD', border: 'rgba(59, 130, 246, 0.3)' },
    violet: { bg: 'rgba(139, 92, 246, 0.12)', color: '#C4B5FD', border: 'rgba(139, 92, 246, 0.3)' },
    purple: { bg: 'rgba(168, 85, 247, 0.12)', color: '#E9D5FF', border: 'rgba(168, 85, 247, 0.3)' },
    magenta: { bg: 'rgba(217, 70, 239, 0.12)', color: '#F0ABFC', border: 'rgba(217, 70, 239, 0.3)' },
    neutral: { bg: 'rgba(148, 163, 184, 0.12)', color: '#CBD5E1', border: 'rgba(148, 163, 184, 0.3)' },
  };

  const styleSet = variantColors[variant || 'cyan'];

  return (
    <span
      className={`badge-custom ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: size === 'sm' ? '0.15rem 0.45rem' : '0.22rem 0.6rem',
        borderRadius: '6px',
        fontSize: size === 'sm' ? '0.68rem' : '0.74rem',
        fontWeight: 600,
        background: styleSet.bg,
        color: styleSet.color,
        border: `1px solid ${styleSet.border}`,
      }}
    >
      {children}
    </span>
  );
};

export default Badge;
