import React from 'react';

interface StatusIndicatorProps {
  status: 'online' | 'degraded' | 'offline' | 'syncing';
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 'md',
}) => {
  const getColors = () => {
    switch (status) {
      case 'online':
        return { dot: '#00D2FF', bg: 'rgba(0, 210, 255, 0.15)', text: '#38BDF8', defaultLabel: 'Operational' };
      case 'syncing':
        return { dot: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)', text: '#C084FC', defaultLabel: 'Syncing Memory' };
      case 'degraded':
        return { dot: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24', defaultLabel: 'Degraded' };
      case 'offline':
      default:
        return { dot: '#F43F5E', bg: 'rgba(244, 63, 94, 0.15)', text: '#FB7185', defaultLabel: 'Offline' };
    }
  };

  const current = getColors();
  const dotSize = size === 'sm' ? '6px' : '8px';

  return (
    <div 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.45rem',
        padding: '0.2rem 0.5rem',
        background: current.bg,
        borderRadius: '20px',
        border: `1px solid ${current.dot}33`,
      }}
    >
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: current.dot,
          boxShadow: `0 0 8px ${current.dot}`,
          display: 'inline-block',
        }}
      />
      <span 
        style={{ 
          fontSize: size === 'sm' ? '0.7rem' : '0.76rem', 
          fontWeight: 700, 
          color: current.text,
          letterSpacing: '0.02em',
        }}
      >
        {label || current.defaultLabel}
      </span>
    </div>
  );
};

export default StatusIndicator;
