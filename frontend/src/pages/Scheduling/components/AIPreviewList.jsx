import React, { useState } from 'react';
import { ArrowLeft, Trash2, CheckCircle2, Loader2, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../../components/common/ConfirmModal';

const AIPreviewList = ({
  messages = [],
  setMessages,
  onConfirm,
  onBack,
  loading,
  isMaximized = false
}) => {
  const [itemToDelete, setItemToDelete] = useState(null);

  const updateMessage = (index, field, value) => {
    const updated = [...messages];
    updated[index] = { ...updated[index], [field]: value };
    setMessages(updated);
  };

  const removeMessage = (index) => {
    setMessages(messages.filter((_, idx) => idx !== index));
  };

  const handleConfirmDelete = () => {
    if (itemToDelete !== null && itemToDelete >= 0) {
      removeMessage(itemToDelete);
      toast.success('Mensagem removida da lista');
      setItemToDelete(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: isMaximized ? '100%' : 'auto' }}>
      {/* Barra de Ações Superior */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', color: '#60a5fa',
            fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', padding: 0
          }}
        >
          <ArrowLeft size={16} />
          <span>Voltar ao texto</span>
        </button>

        <span style={{ fontSize: '0.8rem', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
          {messages.length} mensagem(ns) pronta(s) para revisão
        </span>
      </div>

      {/* Lista de Mensagens Editáveis */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '12px',
        maxHeight: isMaximized ? 'calc(78vh - 120px)' : '380px',
        overflowY: 'auto', paddingRight: '4px', scrollbarWidth: 'thin',
        flex: isMaximized ? 1 : 'none'
      }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              padding: '12px 14px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', flexDirection: 'column', gap: '8px'
            }}
          >
            {/* Linha 1: Controles de Dia, Horário, Tipo e Ação */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>DIA:</span>
                  <input
                    type="number"
                    min={1}
                    value={msg.dia_do_lancamento || 1}
                    onChange={e => updateMessage(index, 'dia_do_lancamento', parseInt(e.target.value) || 1)}
                    style={{ width: '48px', height: '28px', padding: '2px 6px', fontSize: '0.8rem', textAlign: 'center', borderRadius: '6px' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>HORA:</span>
                  <input
                    type="text"
                    value={msg.horario_do_disparo || '12:00'}
                    onChange={e => updateMessage(index, 'horario_do_disparo', e.target.value)}
                    placeholder="12:00"
                    style={{ width: '64px', height: '28px', padding: '2px 6px', fontSize: '0.8rem', textAlign: 'center', borderRadius: '6px' }}
                  />
                </div>

                <select
                  value={msg.tipo_de_mensagem || 'texto'}
                  onChange={e => updateMessage(index, 'tipo_de_mensagem', e.target.value)}
                  style={{
                    height: '28px', padding: '0 8px', fontSize: '0.78rem', fontWeight: 600,
                    borderRadius: '6px', background: 'rgba(25, 27, 35, 0.9)', color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <option value="texto">💬 Texto</option>
                  <option value="imagem">🖼️ Imagem</option>
                  <option value="video">🎬 Vídeo</option>
                  <option value="audio">🎙️ Áudio</option>
                  <option value="arquivo">📁 Arquivo</option>
                  <option value="enquete">📊 Enquete</option>
                </select>

                <input
                  type="text"
                  placeholder="Etiqueta (opcional)"
                  value={msg.etiqueta || ''}
                  onChange={e => updateMessage(index, 'etiqueta', e.target.value)}
                  style={{ width: '110px', height: '28px', padding: '2px 8px', fontSize: '0.75rem', borderRadius: '6px' }}
                />
              </div>

              <button
                type="button"
                data-testid={`delete-msg-btn-${index}`}
                onClick={() => setItemToDelete(index)}
                title="Remover esta mensagem"
                style={{
                  background: 'transparent', border: 'none', color: '#f87171',
                  cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center',
                  transition: 'color 0.2s'
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>

            {/* Linha 2: Texto da Mensagem */}
            <textarea
              rows={2}
              value={msg.mensagem || ''}
              onChange={e => updateMessage(index, 'mensagem', e.target.value)}
              placeholder="Conteúdo da mensagem..."
              style={{
                width: '100%', padding: '8px 10px', borderRadius: '8px',
                background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)',
                color: '#fff', fontSize: '0.8rem', lineHeight: '1.4', resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />

            {/* Linha 3: Link de mídia se não for apenas texto */}
            {msg.tipo_de_mensagem !== 'texto' && msg.tipo_de_mensagem !== 'enquete' && (
              <input
                type="text"
                placeholder="URL da mídia (https://...)"
                value={msg.link_midia || ''}
                onChange={e => updateMessage(index, 'link_midia', e.target.value)}
                style={{
                  height: '28px', padding: '0 10px', fontSize: '0.75rem', borderRadius: '6px',
                  background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)'
                }}
              />
            )}

            {/* Linha 4: Opções de enquete */}
            {msg.tipo_de_mensagem === 'enquete' && (
              <input
                type="text"
                placeholder="Opções da enquete separadas por vírgula (ex: Sim, Não, Talvez)"
                value={Array.isArray(msg.opcoes_enquete) ? msg.opcoes_enquete.join(', ') : (msg.opcoes_enquete || '')}
                onChange={e => updateMessage(index, 'opcoes_enquete', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                style={{
                  height: '28px', padding: '0 10px', fontSize: '0.75rem', borderRadius: '6px',
                  background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)'
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Botão de Confirmação */}
      <button
        type="button"
        onClick={onConfirm}
        disabled={loading || messages.length === 0}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '12px 20px', borderRadius: '10px',
          background: (loading || messages.length === 0) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
          border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.9rem',
          cursor: (loading || messages.length === 0) ? 'not-allowed' : 'pointer',
          boxShadow: (loading || messages.length === 0) ? 'none' : '0 4px 15px rgba(37, 99, 235, 0.35)',
          transition: 'all 0.2s', marginTop: '6px'
        }}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="spin" />
            <span>Importando Mensagens...</span>
          </>
        ) : (
          <>
            <CheckCircle2 size={18} />
            <span>Confirmar e Importar {messages.length} Mensagem(ns)</span>
          </>
        )}
      </button>

      {/* Modal de Confirmação de Exclusão do Item */}
      <ConfirmModal
        show={itemToDelete !== null}
        title="Excluir Mensagem"
        message="Tem certeza que deseja remover esta mensagem da lista de importação? Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
        type="danger"
        confirmText="Excluir Agora"
        zIndex={11000}
      />
    </div>
  );
};

export default AIPreviewList;
