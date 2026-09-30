import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Intelligence service temporarily unavailable',
  description = 'Our telemetry monitoring has logged this issue. Please try refreshing the signal request.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`ci-card ${className}`}
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(244, 63, 94, 0.04)',
        border: '1px solid rgba(244, 63, 94, 0.2)',
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FB7185',
          marginBottom: '0.85rem',
        }}
      >
        <AlertCircle size={22} />
      </div>

      <h3
        style={{
          fontSize: '0.98rem',
          fontWeight: 700,
          color: '#FFFFFF',
          marginBottom: '0.35rem',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          maxWidth: '420px',
          lineHeight: 1.5,
          marginBottom: onRetry ? '1.2rem' : '0',
        }}
      >
        {description}
      </p>

      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} icon={<RefreshCw size={14} />}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
