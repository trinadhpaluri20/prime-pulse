import React from 'react';

interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  icon,
  action,
  children,
  className = '',
  style,
  padding = 'md',
  interactive = false,
  onClick,
}) => {
  const paddingMap = {
    none: '0',
    sm: '1rem',
    md: '1.4rem',
    lg: '2rem',
  };

  return (
    <div
      onClick={onClick}
      style={{
        padding: paddingMap[padding],
        cursor: interactive ? 'pointer' : 'default',
        ...style,
      }}
      className={`ci-card ${interactive ? 'interactive' : ''} ${className}`}
    >
      {(title || action) && (
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
            marginBottom: '1rem',
            borderBottom: padding === 'none' ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
            paddingBottom: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {icon && <div style={{ color: '#00D2FF', display: 'flex' }}>{icon}</div>}
            <div>
              {typeof title === 'string' ? (
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                  {title}
                </h3>
              ) : (
                title
              )}
              {subtitle && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {action && <div>{action}</div>}
        </div>
      )}

      {children}
    </div>
  );
};

export default Card;
