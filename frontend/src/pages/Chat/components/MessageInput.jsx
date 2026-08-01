import React from 'react';
import { 
  Paperclip, Video, Music, FileText, X, 
  Mic, Minimize2, Maximize2, StopCircle, RefreshCw, Send, Clock 
} from 'lucide-react';

const MessageInput = ({
  handleSendMessage,
  filePreview,
  setSelectedFile,
  setFilePreview,
  selectedFile,
  fileInputRef,
  handleFileSelect,
  isRecording,
  recordingTime,
  messageInput,
  setMessageInput,
  isMaximized,
  setIsMaximized,
  startRecording,
  stopRecording,
  sending
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <form 
      onSubmit={handleSendMessage}
      style={{ 
        padding: '1.5rem', 
        borderTop: '1px solid var(--border)', 
        background: 'rgba(255,255,255,0.01)',
        position: 'relative'
      }}
    >
      {/* Preview de Arquivo */}
      {filePreview && (
        <div style={{ 
          padding: '10px', 
          background: 'rgba(59, 130, 246, 0.1)', 
          borderRadius: '12px', 
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          {filePreview.type === 'image' ? (
            <img src={filePreview.url} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} alt="Preview" />
          ) : filePreview.type === 'video' ? (
            <Video size={24} className="text-primary" />
          ) : filePreview.type === 'audio' ? (
            <Music size={24} className="text-primary" />
          ) : (
            <FileText size={24} className="text-primary" />
          )}
          
          <div style={{ flex: 1, fontSize: '0.85rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {filePreview.type === 'audio' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <audio src={filePreview.url} controls style={{ height: '30px', maxWidth: '100%' }} />
              </div>
            ) : (
              selectedFile?.name
            )}
          </div>
          <button type="button" className="btn-icon" onClick={() => { setSelectedFile(null); setFilePreview(null); }}>
            <X size={16} />
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileSelect}
        />
        <button 
          type="button" 
          className="btn-icon" 
          onClick={() => fileInputRef.current.click()}
          style={{ height: '50px', width: '50px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}
        >
          <Paperclip size={20} />
        </button>

        <div className="input-group" style={{ 
          flex: 1, 
          marginBottom: 0, 
          position: 'relative',
          transition: 'all 0.3s ease'
        }}>
          {isRecording ? (
            <div style={{ 
              height: '50px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '15px', 
              padding: '0 20px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              fontWeight: 600
            }}>
              <div className="animate-pulse" style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%' }} />
              Gravando Áudio... {formatTime(recordingTime)}
            </div>
          ) : (
            <>
              <textarea 
                placeholder="Digite sua mensagem..." 
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    e.target.closest('form')?.requestSubmit();
                  }
                }}
                style={{ 
                  width: '100%', 
                  height: isMaximized ? '300px' : '50px', 
                  minHeight: '50px', 
                  maxHeight: '400px', 
                  padding: '12px 40px 12px 15px', 
                  resize: 'none',
                  borderRadius: '12px',
                  transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
              <button 
                type="button" 
                onClick={() => setIsMaximized(!isMaximized)}
                style={{ 
                  position: 'absolute', 
                  right: '10px', 
                  top: '12px', 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-dim)', 
                  cursor: 'pointer' 
                }}
              >
                {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </>
          )}
        </div>

        {(!messageInput.trim() && !selectedFile && !isRecording) ? (
          <button 
            type="button" 
            className="btn-icon" 
            onClick={startRecording}
            style={{ height: '50px', width: '50px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}
          >
            <Mic size={20} />
          </button>
        ) : isRecording ? (
          <button 
            type="button" 
            className="btn-icon" 
            onClick={stopRecording}
            style={{ height: '50px', width: '50px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
          >
            <StopCircle size={20} />
          </button>
        ) : (
          <button 
            type="submit" 
            disabled={sending}
            className="btn-primary"
            style={{ padding: '12px', borderRadius: '12px', height: '50px', width: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {sending ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        )}
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <Clock size={12} /> Pressione Enter para enviar, Shift+Enter para nova linha.
      </div>
    </form>
  );
};

export default MessageInput;
