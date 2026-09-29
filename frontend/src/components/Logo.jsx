import React, { useState } from 'react';
import logoAsset from '../assets/logo.png';

const Logo = ({ size = 'md', showSubtitle = true, className = '' }) => {
  const [imgError, setImgError] = useState(false);

  const dimensions = {
    sm: { box: 32, font: '1rem', sub: '9px' },
    md: { box: 40, font: '1.15rem', sub: '10px' },
    lg: { box: 64, font: '1.4rem', sub: '11px' },
  };

  const dim = dimensions[size] || dimensions.md;

  return (
    <div 
      className={`logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        userSelect: 'none',
      }}
    >
      {!imgError ? (
        <img
          src={logoAsset || '/logo.png'}
          alt="Competitive Intel"
          onError={() => setImgError(true)}
          style={{
            width: `${dim.box}px`,
            height: `${dim.box}px`,
            objectFit: 'contain',
            borderRadius: '10px',
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: `${dim.box}px`,
            height: `${dim.box}px`,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            flexShrink: 0,
          }}
        >
          <svg
            style={{ width: `${dim.box * 0.55}px`, height: `${dim.box * 0.55}px` }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
      )}

      <div style={{ textAlign: 'left' }}>
        <div
          style={{
            fontWeight: 900,
            letterSpacing: '0.04em',
            color: '#ffffff',
            fontSize: dim.font,
            lineHeight: 1.2,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <span>Competitive</span>
          <span
            style={{
              background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Intel
          </span>
        </div>
        {showSubtitle && (
          <div
            style={{
              fontSize: dim.sub,
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'rgba(56, 189, 248, 0.9)',
              textTransform: 'uppercase',
              marginTop: '2px',
            }}
          >
            AI STRATEGIC PLATFORM
          </div>
        )}
      </div>
    </div>
  );
};

export default Logo;
