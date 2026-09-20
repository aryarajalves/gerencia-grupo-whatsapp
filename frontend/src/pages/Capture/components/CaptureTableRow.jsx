import React from 'react';
import { Trash2, FileText } from 'lucide-react';
import { API_BASE } from '../../../services/api';

const CaptureTableRow = ({
  m,
  isSelected,
  onToggleSelect,
  onDelete
}) => {
  return (
    <tr 
      style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} 
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} 
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <td style={{ padding: '1rem 1.5rem' }}>
        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={() => onToggleSelect && onToggleSelect(m.id)} 
        />
      </td>
      <td style={{ padding: '1rem' }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{m.group_name || 'N/A'}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>ID: {m.group_jid || 'N/A'}</div>
      </td>
      <td style={{ padding: '1rem' }}>
        {m.media_url && (
          <div style={{ marginBottom: '6px' }}>
            {(m.media_type === 'imagem' || m.media_type === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(m.media_url)) ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={m.media_url.startsWith('http') ? `${API_BASE}/captura/media-proxy?url=${encodeURIComponent(m.media_url)}` : m.media_url} 
                  alt="Mídia" 
                  style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)', cursor: 'pointer', flexShrink: 0 }} 
                  onClick={() => window.open(m.media_url, '_blank')}
                />
                <span style={{ fontSize: '0.75rem', color: '#22d3ee', fontWeight: 600, background: 'rgba(34,211,238,0.1)', padding: '2px 8px', borderRadius: '6px' }}>📷 Imagem</span>
              </div>
            ) : (m.media_type === 'video' || /\.(mp4|webm|mkv|mov)(\?.*)?$/i.test(m.media_url)) ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <video 
                  src={m.media_url.startsWith('http') ? `${API_BASE}/captura/media-proxy?url=${encodeURIComponent(m.media_url)}` : m.media_url} 
                  style={{ width: '70px', height: '44px', borderRadius: '6px', objectFit: 'cover' }} 
                  controls 
                />
                <span style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600, background: 'rgba(167,139,250,0.1)', padding: '2px 8px', borderRadius: '6px' }}>🎬 Vídeo</span>
              </div>
            ) : (m.media_type === 'audio' || m.media_type === 'ptt' || /\.(mp3|ogg|wav|aac|m4a)(\?.*)?$/i.test(m.media_url)) ? (
              <audio 
                src={m.media_url.startsWith('http') ? `${API_BASE}/captura/media-proxy?url=${encodeURIComponent(m.media_url)}` : m.media_url} 
                controls 
                style={{ height: '32px', maxWidth: '220px' }} 
              />
            ) : (
              <a 
                href={m.media_url.startsWith('http') ? `${API_BASE}/captura/media-proxy?url=${encodeURIComponent(m.media_url)}` : m.media_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--primary)', textDecoration: 'none', background: 'rgba(59,130,246,0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                <FileText size={14} /> Ver Anexo / Documento
              </a>
            )}
          </div>
        )}
        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', maxWidth: '420px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {m.message_content || (m.media_url ? '' : '(Sem conteúdo)')}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
          {m.sender_name} ({m.sender_number})
        </div>
      </td>
      <td style={{ padding: '1rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#fff' }}>
          {m.timestamp && !isNaN(new Date(m.timestamp).getTime()) ? new Date(m.timestamp).toLocaleDateString('pt-BR') : 'N/A'}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
          {m.timestamp && !isNaN(new Date(m.timestamp).getTime()) ? new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
        </div>
      </td>
      <td style={{ padding: '1rem', textAlign: 'right' }}>
        <button 
          type="button"
          onClick={() => onDelete && onDelete(m.id)} 
          className="btn-icon-danger" 
          title="Excluir captura"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
};

export default CaptureTableRow;
