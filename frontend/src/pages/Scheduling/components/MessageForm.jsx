import React from 'react';
import { PlusCircle, Pencil, MessageSquare, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import MessageTypeGrid from './form/MessageTypeGrid';
import MessageScheduleRow from './form/MessageScheduleRow';
import MessageGroupSelector from './form/MessageGroupSelector';
import GroupStatusActionForm from './form/GroupStatusActionForm';
import PollOptionsForm from './form/PollOptionsForm';
import MediaUploadBox from './form/MediaUploadBox';

const MessageForm = ({ 
  novaMensagem, 
  setNovaMensagem, 
  onSubmit, 
  onCancel, 
  editingId, 
  processing, 
  file, 
  previewUrl, 
  setFile, 
  setPreviewUrl, 
  uploadProgress, 
  handleFileChange,
  grupos = [],
  mensagens = [],
  onNavigateMessage
}) => {
  const toggleGrupo = (grupoId) => {
    const current = novaMensagem.grupo_ids || [];
    if (current.includes(grupoId)) {
      setNovaMensagem({ ...novaMensagem, grupo_ids: current.filter(id => id !== grupoId) });
    } else {
      setNovaMensagem({ ...novaMensagem, grupo_ids: [...current, grupoId] });
    }
  };

  const selectAll = () => {
    setNovaMensagem({ ...novaMensagem, grupo_ids: grupos.map(g => g.id) });
  };

  const selectNone = () => {
    setNovaMensagem({ ...novaMensagem, grupo_ids: [] });
  };

  const handleTypeChange = (key) => {
    const nextMsg = { ...novaMensagem, tipo_de_mensagem: key };
    if (key === 'status_grupo' && (!nextMsg.mensagem || (nextMsg.mensagem !== 'fechar' && nextMsg.mensagem !== 'abrir'))) {
      nextMsg.mensagem = 'fechar';
    }
    setNovaMensagem(nextMsg);
  };

  const isMediaOrPoll = novaMensagem.tipo_de_mensagem !== 'texto' && 
                        novaMensagem.tipo_de_mensagem !== 'nome_grupo' && 
                        novaMensagem.tipo_de_mensagem !== 'status_grupo';

  // Ordenação de mensagens por Dia e por Horário
  const sortedMessages = React.useMemo(() => {
    return [...(mensagens || [])].sort((a, b) => {
      const diaA = Number(a.dia_do_lancamento) || 0;
      const diaB = Number(b.dia_do_lancamento) || 0;
      if (diaA !== diaB) {
        return diaA - diaB;
      }
      const timeA = a.horario_do_disparo || '';
      const timeB = b.horario_do_disparo || '';
      if (timeA !== timeB) {
        return timeA.localeCompare(timeB);
      }
      return (Number(a.numero_da_mensagem) || 0) - (Number(b.numero_da_mensagem) || 0);
    });
  }, [mensagens]);

  const currentIndex = sortedMessages.findIndex(m => String(m.id) === String(editingId));
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 
    ? currentIndex < sortedMessages.length - 1 
    : sortedMessages.length > 0;
  const prevMessage = hasPrev ? sortedMessages[currentIndex - 1] : null;
  const nextMessage = hasNext 
    ? (currentIndex >= 0 ? sortedMessages[currentIndex + 1] : sortedMessages[0]) 
    : null;

  return (
    <div className="card" style={{ padding: 0, overflow: 'visible', marginBottom: '1.5rem', border: editingId ? '1px solid rgba(167,139,250,0.3)' : '1px solid var(--border)' }}>
      {/* Header do Form */}
      <div style={{ 
        padding: '1rem 1.5rem', 
        borderBottom: '1px solid var(--border)', 
        background: editingId ? 'linear-gradient(90deg, rgba(167,139,250,0.06), transparent)' : 'linear-gradient(90deg, rgba(37,99,235,0.06), transparent)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {editingId ? (
            <>
              <Pencil size={15} style={{ color: '#a78bfa' }} />
              <span style={{ fontWeight: 600, color: '#a78bfa' }}>Editando Mensagem</span>
            </>
          ) : (
            <>
              <PlusCircle size={15} style={{ color: 'var(--primary)' }} />
              <span style={{ fontWeight: 600 }}>Novo Template de Mensagem</span>
            </>
          )}
        </div>

        {/* Botões para passar entre as mensagens */}
        {sortedMessages.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {currentIndex >= 0 && (
              <span style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-dim)', 
                fontWeight: 600,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                padding: '4px 8px',
                borderRadius: '6px',
                marginRight: '2px'
              }}>
                Mensagem {currentIndex + 1} de {sortedMessages.length}
              </span>
            )}

            <button
              type="button"
              data-testid="btn-nav-prev-message"
              disabled={!hasPrev}
              onClick={() => hasPrev && onNavigateMessage && onNavigateMessage(prevMessage)}
              title={hasPrev ? `Mensagem anterior (Dia ${prevMessage.dia_do_lancamento} - ${prevMessage.horario_do_disparo})` : 'Não há mensagem anterior'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: hasPrev ? 'rgba(167, 139, 250, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                color: hasPrev ? '#c4b5fd' : 'var(--text-dim)',
                border: `1px solid ${hasPrev ? 'rgba(167, 139, 250, 0.35)' : 'rgba(255, 255, 255, 0.05)'}`,
                opacity: hasPrev ? 1 : 0.25,
                cursor: hasPrev ? 'pointer' : 'not-allowed',
                pointerEvents: hasPrev ? 'auto' : 'none',
                transition: 'all 0.2s ease',
                userSelect: 'none'
              }}
            >
              <ChevronLeft size={16} />
              <span>Anterior</span>
            </button>

            <button
              type="button"
              data-testid="btn-nav-next-message"
              disabled={!hasNext}
              onClick={() => hasNext && onNavigateMessage && onNavigateMessage(nextMessage)}
              title={hasNext ? `Próxima mensagem (Dia ${nextMessage.dia_do_lancamento} - ${nextMessage.horario_do_disparo})` : 'Não há próxima mensagem'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: hasNext ? 'rgba(167, 139, 250, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                color: hasNext ? '#c4b5fd' : 'var(--text-dim)',
                border: `1px solid ${hasNext ? 'rgba(167, 139, 250, 0.35)' : 'rgba(255, 255, 255, 0.05)'}`,
                opacity: hasNext ? 1 : 0.25,
                cursor: hasNext ? 'pointer' : 'not-allowed',
                pointerEvents: hasNext ? 'auto' : 'none',
                transition: 'all 0.2s ease',
                userSelect: 'none'
              }}
            >
              <span>Próxima</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Linha Superior: Tipo de Conteúdo + Dia + Horário + Etiqueta */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr', gap: '1.25rem' }}>
          <MessageTypeGrid
            selectedType={novaMensagem.tipo_de_mensagem}
            onChangeType={handleTypeChange}
          />

          <MessageScheduleRow
            diaDoLancamento={novaMensagem.dia_do_lancamento}
            onChangeDia={d => setNovaMensagem({ ...novaMensagem, dia_do_lancamento: d })}
            horarioDoDisparo={novaMensagem.horario_do_disparo}
            onChangeHorario={h => setNovaMensagem({ ...novaMensagem, horario_do_disparo: h })}
            etiqueta={novaMensagem.etiqueta}
            onChangeEtiqueta={t => setNovaMensagem({ ...novaMensagem, etiqueta: t })}
            mensagens={mensagens}
          />
        </div>

        {/* Seleção de Grupos Destinatários */}
        <MessageGroupSelector
          grupos={grupos}
          selectedGroupIds={novaMensagem.grupo_ids || []}
          onToggleGrupo={toggleGrupo}
          onSelectAll={selectAll}
          onSelectNone={selectNone}
        />

        {/* Conteúdo Principal da Mensagem & Coluna Lateral (Mídia/Enquete) */}
        <div style={{ display: 'grid', gridTemplateColumns: isMediaOrPoll ? '1fr 320px' : '1fr', gap: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            {novaMensagem.tipo_de_mensagem === 'status_grupo' ? (
              <GroupStatusActionForm
                novaMensagem={novaMensagem}
                setNovaMensagem={setNovaMensagem}
              />
            ) : (
              <>
                <label className="label-premium">
                  <MessageSquare size={12} /> {
                    novaMensagem.tipo_de_mensagem === 'nome_grupo' ? 'Novo Nome do Grupo' : 
                    novaMensagem.tipo_de_mensagem === 'enquete' ? 'Título / Pergunta da Enquete' : 
                    'Texto da Mensagem / Legenda'
                  }
                </label>
                <textarea 
                  value={novaMensagem.mensagem || ''} 
                  onChange={e => setNovaMensagem({ ...novaMensagem, mensagem: e.target.value })} 
                  placeholder={
                    novaMensagem.tipo_de_mensagem === 'nome_grupo' ? "Digite o novo nome para o grupo..." : 
                    novaMensagem.tipo_de_mensagem === 'enquete' ? "Ex: Qual sua cor favorita?" :
                    "Digite o conteúdo da mensagem..."
                  } 
                  style={{ 
                    width: '100%', 
                    minHeight: (novaMensagem.tipo_de_mensagem === 'nome_grupo' || novaMensagem.tipo_de_mensagem === 'enquete') ? '80px' : '160px', 
                    resize: 'vertical', 
                    fontSize: '1rem', 
                    lineHeight: '1.5', 
                    padding: '1rem' 
                  }} 
                  required={novaMensagem.tipo_de_mensagem === 'nome_grupo' || novaMensagem.tipo_de_mensagem === 'enquete'}
                />
              </>
            )}
          </div>

          {isMediaOrPoll && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              {novaMensagem.tipo_de_mensagem === 'enquete' ? (
                <PollOptionsForm
                  novaMensagem={novaMensagem}
                  setNovaMensagem={setNovaMensagem}
                />
              ) : (
                <MediaUploadBox
                  tipoDeMensagem={novaMensagem.tipo_de_mensagem}
                  previewUrl={previewUrl}
                  setFile={setFile}
                  setPreviewUrl={setPreviewUrl}
                  handleFileChange={handleFileChange}
                  uploadProgress={uploadProgress}
                />
              )}
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div style={{ display: 'flex', gap: '12px', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-primary" type="submit" disabled={processing} style={{ height: '50px', flex: 1, justifyContent: 'center', fontSize: '1rem', fontWeight: 800 }}>
            {processing ? 'Enviando...' : editingId ? <><CheckCircle2 size={18} /> Salvar Alterações</> : <><PlusCircle size={18} /> Adicionar ao Roteiro</>}
          </button>
          {editingId && (
            <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ height: '50px', padding: '0 2rem' }}>Cancelar</button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MessageForm;
