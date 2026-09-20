import React from 'react';
import { Trash2 } from 'lucide-react';
import { ModalPortal } from '../../../components/common';

const FullscreenMediaModal = ({ media, onClose }) => {
  if (!media) return null;

  return (
    <ModalPortal>
      <div 
        onClick={onClose}
        style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          background: '#000', zIndex: 99999, display: 'flex', 
          alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out',
          animation: 'fadeIn 0.2s'
        }}
      >
        {media.type === 'imagem' ? (
          <img 
            src={media.url} 
            alt="Mídia em tela cheia" 
            style={{ maxWidth: '95%', maxHeight: '95%', borderRadius: '4px', boxShadow: '0 0 100px rgba(0,0,0,1)' }} 
          />
        ) : (
          <video 
            src={media.url} 
            controls 
            autoPlay 
            style={{ maxWidth: '95%', maxHeight: '95%', borderRadius: '4px' }} 
            onClick={e => e.stopPropagation()} 
          />
        )}
        <button 
          onClick={onClose}
          style={{ 
            position: 'absolute', top: '30px', right: '30px', 
            background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', 
            padding: '12px', borderRadius: '50%', cursor: 'pointer', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}
          title="Fechar tela cheia"
        >
          <Trash2 size={24} style={{ transform: 'rotate(45deg)' }} />
        </button>
      </div>
    </ModalPortal>
  );
};

export default FullscreenMediaModal;
