import React from 'react';
import { RefreshCw, Shield, Trash2, FileText, MessageCircle, ChevronDown, BarChart2 } from 'lucide-react';

const MessageList = ({ 
  loading, 
  messages, 
  scrollRef, 
  handleScroll, 
  handleDeleteMessage, 
  showScrollButton, 
  scrollToBottom 
}) => {
  return (
    <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div 
        className="custom-scroll" 
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '1.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.2s ease-in-out'
        }}
      >
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', position: 'absolute', inset: 0 }}>
            <RefreshCw size={40} className="animate-spin" />
          </div>
        ) : (
          messages.map((msg, idx) => {
            // ── Notificação de status do grupo (não é bolha de chat) ──
            const isStatusGrupo = msg.media_type === 'status_grupo' ||
              (msg.message_content && msg.message_content.startsWith('[Status do Grupo:'));

            if (isStatusGrupo) {
              const isFechar = msg.message_content && msg.message_content.includes('Fechado');
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '4px 0',
                    alignSelf: 'center',
                    width: '100%',
                  }}
                >
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    background: isFechar
                      ? 'rgba(251, 146, 60, 0.12)'
                      : 'rgba(16, 185, 129, 0.12)',
                    border: `1px solid ${isFechar ? 'rgba(251,146,60,0.3)' : 'rgba(16,185,129,0.3)'}`,
                    borderRadius: '999px',
                    padding: '6px 14px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: isFechar ? '#fb923c' : '#10b981',
                    letterSpacing: '0.02em',
                    backdropFilter: 'blur(8px)',
                    boxShadow: isFechar
                      ? '0 2px 10px rgba(251,146,60,0.08)'
                      : '0 2px 10px rgba(16,185,129,0.08)',
                  }}>
                    <span style={{ fontSize: '0.85rem' }}>{isFechar ? '🔒' : '🔓'}</span>
                    <span>
                      {isFechar ? 'Grupo fechado — somente admins' : 'Grupo aberto — todos podem enviar'}
                    </span>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 400,
                      opacity: 0.6,
                      marginLeft: '4px',
                    }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            }

            // ── Bolha normal de chat ──
            return (
            <div 
              key={msg.id} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: msg.from_me ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                alignSelf: msg.from_me ? 'flex-end' : 'flex-start'
              }}
            >
              {(!msg.from_me && (idx === 0 || messages[idx-1].sender_number !== msg.sender_number)) && (
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', marginLeft: '4px' }}>
                  {msg.sender_name} <span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>({msg.sender_number})</span>
                </div>
              )}

              <div style={{ position: 'relative', group: 'message' }}>
                <div style={{ 
                  padding: '10px 14px', 
                  borderRadius: msg.from_me ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.from_me 
                    ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  lineHeight: '1.4',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  wordBreak: 'break-word',
                  position: 'relative',
                  minWidth: '60px'
                }}>
                  {msg.media_type === 'enquete' || msg.media_type === 'poll' ? (
                    <div style={{ minWidth: '220px', padding: '4px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#c084fc', marginBottom: '8px' }}>
                        <BarChart2 size={15} /> ENQUETE
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px', whiteSpace: 'pre-wrap' }}>
                        {msg.message_content}
                      </div>
                      {msg.media_url ? (
                        msg.media_url.split('|').map((opt, i) => (
                          <div key={i} style={{ 
                            display: 'flex', alignItems: 'center', gap: '10px', 
                            padding: '8px 12px', background: 'rgba(0, 0, 0, 0.2)', 
                            border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', 
                            marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 
                          }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255, 255, 255, 0.5)', flexShrink: 0 }} />
                            <span>{opt}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>Enquete disparada via WhatsApp</div>
                      )}
                    </div>
                  ) : (
                    <>
                      {msg.media_url && (
                        <div style={{ marginBottom: '8px', borderRadius: '8px', overflow: 'hidden' }}>
                          {(msg.media_type === 'imagem' || msg.media_type === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(msg.media_url)) ? (
                            <img 
                              src={msg.media_url.startsWith('http') ? `${import.meta.env.VITE_API_URL}/captura/media-proxy?url=${encodeURIComponent(msg.media_url)}` : msg.media_url} 
                              alt="Mídia" 
                              crossOrigin="anonymous"
                              style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', display: 'block', cursor: 'zoom-in' }} 
                              onClick={() => window.open(msg.media_url, '_blank')}
                            />
                          ) : (msg.media_type === 'video' || /\.(mp4|webm|mkv|mov)(\?.*)?$/i.test(msg.media_url)) ? (
                            <video 
                              src={msg.media_url.startsWith('http') ? `${import.meta.env.VITE_API_URL}/captura/media-proxy?url=${encodeURIComponent(msg.media_url)}` : msg.media_url} 
                              controls 
                              style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', display: 'block' }} 
                            />
                          ) : (msg.media_type === 'audio' || msg.media_type === 'ptt' || /\.(mp3|ogg|wav|aac|m4a)(\?.*)?$/i.test(msg.media_url)) ? (
                            <audio 
                              src={msg.media_url.startsWith('http') ? `${import.meta.env.VITE_API_URL}/captura/media-proxy?url=${encodeURIComponent(msg.media_url)}` : msg.media_url} 
                              controls 
                              style={{ width: '100%', minWidth: '200px' }} 
                            />
                          ) : (
                            <a 
                              href={msg.media_url.startsWith('http') ? `${import.meta.env.VITE_API_URL}/captura/media-proxy?url=${encodeURIComponent(msg.media_url)}` : msg.media_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'var(--primary)', textDecoration: 'none' }}
                            >
                              <FileText size={20} />
                              <span style={{ fontSize: '0.85rem' }}>Ver Arquivo / Mídia</span>
                            </a>
                          )}
                        </div>
                      )}
                      
                      {msg.message_content && (
                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.message_content}</div>
                      )}
                    </>
                  )}
                  <div style={{ 
                    fontSize: '0.65rem', 
                    color: 'rgba(255,255,255,0.5)', 
                    marginTop: '4px', 
                    textAlign: 'right',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px'
                  }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.from_me && <Shield size={10} />}
                  </div>
                </div>

                <button 
                  onClick={() => handleDeleteMessage(msg)}
                  style={{ 
                    position: 'absolute', 
                    right: msg.from_me ? 'calc(100% + 10px)' : '-35px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    borderRadius: '8px',
                    padding: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    opacity: 0,
                    visibility: 'hidden'
                  }}
                  className="delete-msg-btn"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
           );
          })
        )}
        {messages.length === 0 && !loading && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', gap: '15px' }}>
            <MessageCircle size={48} opacity={0.3} />
            <p>Nenhuma mensagem capturada ainda.</p>
          </div>
        )}
      </div>

      {showScrollButton && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="glass-card"
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '30px',
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            background: 'rgba(59, 130, 246, 0.3)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(59, 130, 246, 0.5)',
            color: '#fff',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
            cursor: 'pointer',
            animation: 'fadeInUp 0.3s ease'
          }}
        >
          <ChevronDown size={24} />
        </button>
      )}
    </div>
  );
};

export default MessageList;
