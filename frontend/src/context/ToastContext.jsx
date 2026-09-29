import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Toast Overlay Container */}
      <div style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        maxWidth: '420px',
        width: '100%',
        pointerEvents: 'none'
      }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              padding: '0.85rem 1.1rem',
              borderRadius: '12px',
              background: t.type === 'success' 
                ? 'rgba(6, 40, 25, 0.95)' 
                : t.type === 'error' 
                ? 'rgba(45, 10, 20, 0.95)' 
                : 'rgba(15, 23, 42, 0.95)',
              border: `1px solid ${
                t.type === 'success' 
                  ? 'rgba(16, 185, 129, 0.4)' 
                  : t.type === 'error' 
                  ? 'rgba(244, 63, 94, 0.4)' 
                  : 'rgba(99, 102, 241, 0.4)'
              }`,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              color: '#ffffff',
              fontSize: '0.88rem',
              backdropFilter: 'blur(12px)',
              animation: 'fadeInSlide 0.3s ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {t.type === 'success' && <CheckCircle2 size={18} color="#34d399" />}
              {t.type === 'error' && <AlertCircle size={18} color="#fb7185" />}
              {t.type === 'info' && <Info size={18} color="#818cf8" />}
              <span style={{ fontWeight: 500, lineHeight: 1.4 }}>{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
