import React from 'react';
import { AlertCircle, Info, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import ModalPortal from './ModalPortal';

const ConfirmModal = ({ 
  show, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  type = 'danger', 
  hideCancel = false, 
  confirmText = null, 
  confirmTextChecked = null,
  checkboxLabel = null,
  checkboxDescription = null,
  defaultCheckboxChecked = false,
  zIndex = 11000 
}) => {
  if (!show) return null;

  const [checkboxChecked, setCheckboxChecked] = React.useState(defaultCheckboxChecked);

  React.useEffect(() => {
    setCheckboxChecked(defaultCheckboxChecked);
  }, [show, defaultCheckboxChecked]);

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 size={32} />,
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.1)',
          btn: 'var(--success)'
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={32} />,
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.1)',
          btn: '#f59e0b'
        };
      case 'info':
        return {
          icon: <Info size={32} />,
          color: 'var(--primary)',
          bg: 'rgba(37, 99, 235, 0.1)',
          btn: 'var(--primary)'
        };
      default: // danger
        return {
          icon: <AlertCircle size={32} />,
          color: 'var(--danger)',
          bg: 'rgba(239, 68, 68, 0.1)',
          btn: 'var(--danger)'
        };
    }
  };

  const config = getConfig();
  const isAlertOnly = hideCancel || !onCancel;
  const finalConfirmText = (checkboxChecked && confirmTextChecked) 
    ? confirmTextChecked 
    : (confirmText || (type === 'danger' ? 'Excluir Agora' : 'Confirmar'));

  return (
    <ModalPortal>
      <div className="fullscreen-modal-overlay" style={{ alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex }}>
        <div className="card fade-in" style={{ 
          maxWidth: '430px', 
          width: '100%', 
          textAlign: 'center', 
          padding: 'var(--modal-padding)', 
          margin: '0',
          position: 'relative',
          background: 'rgba(23, 25, 33, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 'var(--modal-radius)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)'
        }}>
          <button 
            onClick={onCancel || onConfirm} 
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-dim)', borderRadius: '10px', padding: '6px', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>

          <div style={{ 
            backgroundColor: config.bg, 
            width: '60px', height: '60px', borderRadius: '18px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', 
            color: config.color,
            boxShadow: `0 10px 30px ${config.bg}`
          }}>
            {React.cloneElement(config.icon, { size: 28 })}
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>{title}</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: checkboxLabel ? '1.25rem' : '1.75rem', lineHeight: '1.5' }}>{message}</p>
          
          {checkboxLabel && (
            <div 
              data-testid="confirm-modal-checkbox-container"
              onClick={() => setCheckboxChecked(!checkboxChecked)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                textAlign: 'left',
                padding: '12px 14px',
                borderRadius: '12px',
                background: checkboxChecked ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${checkboxChecked ? 'rgba(59, 130, 246, 0.45)' : 'rgba(255, 255, 255, 0.08)'}`,
                marginBottom: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                userSelect: 'none'
              }}
            >
              <input 
                type="checkbox"
                data-testid="confirm-modal-checkbox"
                checked={checkboxChecked}
                onChange={(e) => setCheckboxChecked(e.target.checked)}
                style={{ marginTop: '2px', cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary, #3b82f6)' }}
                onClick={(e) => e.stopPropagation()}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: checkboxChecked ? '#93c5fd' : '#fff', lineHeight: 1.3 }}>
                  {checkboxLabel}
                </div>
                {checkboxDescription && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.4 }}>
                    {checkboxDescription}
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            {!isAlertOnly && (
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, height: '46px', borderRadius: '12px', justifyContent: 'center', fontWeight: 700 }} 
                onClick={onCancel}
              >
                Cancelar
              </button>
            )}
            <button 
              className="btn" 
              style={{ 
                flex: 1, height: '46px', borderRadius: '12px',
                background: config.btn, color: '#fff', 
                justifyContent: 'center', fontWeight: 800,
                boxShadow: `0 8px 20px ${config.bg}`
              }} 
              onClick={() => onConfirm && onConfirm(checkboxChecked)}
            >
              {finalConfirmText}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default ConfirmModal;
