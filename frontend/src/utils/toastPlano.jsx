import { toast } from 'react-hot-toast';

export const toastPlanoInsuficiente = (descricaoRecurso) => {
  toast.custom(
    (t) => (
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          background: 'linear-gradient(135deg, #1e1a2e, #2a1f3d)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '12px',
          padding: '14px 18px',
          boxShadow: '0 0 24px rgba(245, 158, 11, 0.15), 0 4px 16px rgba(0,0,0,0.4)',
          maxWidth: '360px',
          opacity: t.visible ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <div
          style={{
            flexShrink: 0,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
          }}
        >
          🔒
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#fbbf24',
              marginBottom: '4px',
              letterSpacing: '0.02em',
            }}
          >
            Recurso exclusivo PRO
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.4,
            }}
          >
            {descricaoRecurso || 'Este recurso não está disponível no seu plano atual.'}
            {' '}
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>
              Faça upgrade para o plano PRO para utilizá-lo.
            </span>
          </div>
        </div>
      </div>
    ),
    { duration: 5000 }
  );
};
