import React from 'react';
import { Database, Sparkles, Inbox } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No intelligence data recorded yet',
  description = 'Once the agent begins continuously collecting competitor activity, verified intelligence will appear here.',
  icon,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`ci-card ${className}`}
      style={{
        padding: '3.5rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(7, 11, 27, 0.6)',
        border: '1px dashed var(--border-subtle)',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'rgba(0, 210, 255, 0.08)',
          border: '1px solid rgba(0, 210, 255, 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#38BDF8',
          marginBottom: '1rem',
        }}
      >
        {icon || <Inbox size={22} />}
      </div>

      <h3
        style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: '#FFFFFF',
          marginBottom: '0.4rem',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.84rem',
          color: 'var(--text-secondary)',
          maxWidth: '440px',
          lineHeight: 1.55,
          marginBottom: actionLabel && onAction ? '1.25rem' : '0',
        }}
      >
        {description}
      </p>

      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
