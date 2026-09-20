import React from 'react';
import { Upload, X, Mic } from 'lucide-react';

const MediaUploadBox = ({
  tipoDeMensagem = 'imagem',
  previewUrl,
  setFile,
  setPreviewUrl,
  handleFileChange,
  uploadProgress = 0
}) => {
  return (
    <>
      <label className="label-premium"><Upload size={12} /> Mídia ({tipoDeMensagem})</label>
      <div 
        style={{ 
          height: '160px', border: '2px dashed var(--border)', borderRadius: '16px', position: 'relative', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          background: 'rgba(255,255,255,0.01)', transition: 'all 0.3s'
        }} 
        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--primary)'; }} 
        onDragLeave={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        {previewUrl ? (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {tipoDeMensagem === 'imagem' && <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />}
            {tipoDeMensagem === 'video' && <video src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            {tipoDeMensagem === 'audio' && (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mic size={40} style={{ color: 'var(--primary)', opacity: 0.5 }} />
              </div>
            )}
            <button 
              type="button" 
              onClick={() => { setFile && setFile(null); setPreviewUrl && setPreviewUrl(null); }} 
              style={{ 
                position: 'absolute', top: '8px', right: '8px', width: '28px', height: '28px', 
                borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}
              title="Remover mídia"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer', width: '100%', height: '100%', justifyContent: 'center' }}>
            <Upload size={32} style={{ color: 'var(--text-dim)', opacity: 0.4 }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Clique ou arraste para enviar</span>
            <input 
              type="file" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              accept={tipoDeMensagem === 'imagem' ? "image/*" : tipoDeMensagem === 'video' ? "video/*" : tipoDeMensagem === 'audio' ? "audio/*" : "*"} 
            />
          </label>
        )}
      </div>
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div style={{ marginTop: '10px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s' }} />
        </div>
      )}
    </>
  );
};

export default MediaUploadBox;
