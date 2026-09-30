import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  children,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--gradient-btn)',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 4px 14px rgba(0, 210, 255, 0.25)',
        };
      case 'secondary':
        return {
          background: 'rgba(255, 255, 255, 0.04)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-subtle)',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid transparent',
        };
      case 'danger':
        return {
          background: 'rgba(244, 63, 94, 0.15)',
          color: '#FB7185',
          border: '1px solid rgba(244, 63, 94, 0.3)',
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return { padding: '0.4rem 0.8rem', fontSize: '0.8rem' };
      case 'lg':
        return { padding: '0.85rem 1.6rem', fontSize: '0.98rem' };
      case 'md':
      default:
        return { padding: '0.62rem 1.2rem', fontSize: '0.88rem' };
    }
  };

  return (
    <button
      disabled={disabled || loading}
      style={{
        borderRadius: '9px',
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.5 : 1,
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style,
      }}
      className={`btn-component ${className}`}
      {...props}
    >
      {loading ? <Loader2 size={16} className="spin-animation" /> : icon}
      {children && <span>{children}</span>}
    </button>
  );
};

export default Button;
