import React from 'react';
import logoImage from '../assets/logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showTagline = true, 
  className = '' 
}) => {
  const sizeMap = {
    sm: { img: 32, title: '0.95rem', sub: '7px' },
    md: { img: 44, title: '1.15rem', sub: '9px' },
    lg: { img: 60, title: '1.45rem', sub: '11px' },
  };

  const current = sizeMap[size];

  return (
    <div 
      className={`brand-logo-wrapper ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        userSelect: 'none',
      }}
    >
      <img
        src={logoImage}
        alt="Competitive Intern"
        style={{
          width: `${current.img}px`,
          height: `${current.img}px`,
          objectFit: 'contain',
          borderRadius: '10px',
          flexShrink: 0,
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div 
          style={{ 
            fontSize: current.title, 
            fontWeight: 800, 
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          <span style={{ color: '#FFFFFF' }}>Competitive</span>
          <span 
            style={{ 
              background: 'linear-gradient(135deg, #00D2FF 0%, #3B82F6 40%, #8B5CF6 75%, #D946EF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Intern
          </span>
        </div>

        {showTagline && (
          <div 
            style={{ 
              fontSize: current.sub, 
              fontWeight: 700, 
              color: '#38BDF8', 
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginTop: '3px'
            }}
          >
            AI STRATEGIC INTELLIGENCE PLATFORM
          </div>
        )}
      </div>
    </div>
  );
};

export default Logo;
