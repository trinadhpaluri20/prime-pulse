import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', isDanger = true }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '440px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: '10px', background: isDanger ? 'rgba(244, 63, 94, 0.15)' : 'rgba(99, 102, 241, 0.15)', color: isDanger ? '#fb7185' : '#818cf8' }}>
            <AlertTriangle size={22} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
            {title}
          </h3>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className={isDanger ? "btn-danger" : "btn-primary"} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
