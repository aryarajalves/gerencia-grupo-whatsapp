import React from 'react';
import { toast } from 'react-hot-toast';
import { Trash2, X, CheckCircle2 } from 'lucide-react';

export const toastDeletado = (titulo = 'Grupo Excluído', detalhe = '') => {
  toast.custom(
    (t) => (
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
          background: 'linear-gradient(135deg, rgba(26, 20, 28, 0.95), rgba(18, 18, 24, 0.95))',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '14px',
          padding: '16px 18px',
          boxShadow: '0 10px 30px rgba(239, 68, 68, 0.2), 0 4px 20px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(12px)',
          maxWidth: '380px',
          width: '100%',
          opacity: t.visible ? 1 : 0,
          transform: t.visible ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            flexShrink: 0,
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(225, 29, 72, 0.15))',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.2)',
          }}
        >
          <Trash2 size={20} />
        </div>

        <div style={{ flex: 1, paddingRight: '8px' }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: '#f87171',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {titulo}
          </div>
          {detalhe && (
            <div
              style={{
                fontSize: '0.825rem',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.4',
              }}
            >
              {detalhe}
            </div>
          )}
        </div>

        <button
          onClick={() => toast.dismiss(t.id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.4)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)')}
        >
          <X size={16} />
        </button>
      </div>
    ),
    { duration: 4000, position: 'top-right' }
  );
};

export const toastSucesso = (titulo = 'Sucesso', detalhe = '') => {
  toast.success(detalhe ? `${titulo}: ${detalhe}` : titulo, { duration: 4000, position: 'top-right' });
};
