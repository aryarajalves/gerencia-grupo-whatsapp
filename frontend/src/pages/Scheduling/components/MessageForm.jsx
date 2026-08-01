import React from 'react';
import { Send, PlusCircle, Pencil, MessageSquare, Clock, CalendarDays, Layers, Trash2, Image, Video, Mic, FileText, LayoutGrid, Upload, X, CheckCircle2 } from 'lucide-react';
import { TIPO_CONFIG } from '../../../utils/constants';

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
  grupos
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
  return (
    <div className="card" style={{ padding: 0, overflow: 'visible', marginBottom: '1.5rem', border: editingId ? '1px solid rgba(167,139,250,0.3)' : '1px solid var(--border)' }}>
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: editingId ? 'linear-gradient(90deg, rgba(167,139,250,0.06), transparent)' : 'linear-gradient(90deg, rgba(37,99,235,0.06), transparent)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {editingId ? <><Pencil size={15} style={{ color: '#a78bfa' }} /><span style={{ fontWeight: 600, color: '#a78bfa' }}>Editando Mensagem</span></> : <><PlusCircle size={15} style={{ color: 'var(--primary)' }} /><span style={{ fontWeight: 600 }}>Novo Template de Mensagem</span></>}
      </div>

      <form onSubmit={onSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label-premium"><Layers size={12} /> Tipo de Conteúdo</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {Object.entries(TIPO_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                const isSelected = novaMensagem.tipo_de_mensagem === key;
                return (
                  <button key={key} type="button" onClick={() => setNovaMensagem({ ...novaMensagem, tipo_de_mensagem: key })} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '10px 5px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                    border: '1px solid', borderColor: isSelected ? cfg.color : 'var(--border)',
                    background: isSelected ? cfg.bg : 'rgba(255,255,255,0.02)',
                    color: isSelected ? cfg.color : 'var(--text-dim)'
                  }}>
                    <Icon size={18} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label-premium"><CalendarDays size={12} /> Dia do Lançamento</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select 
                value={novaMensagem.dia_do_lancamento} 
                onChange={e => setNovaMensagem({ ...novaMensagem, dia_do_lancamento: parseInt(e.target.value) })}
                className="input-premium"
                style={{ width: '100%', fontSize: '1.1rem', fontWeight: 700 }}
              >
                {[1, 2, 3, 4, 5, 6, 7].map(d => (
                  <option key={d} value={d}>Dia {d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label-premium"><Clock size={12} /> Horário do Disparo</label>
            <input type="time" value={novaMensagem.horario_do_disparo} onChange={e => setNovaMensagem({ ...novaMensagem, horario_do_disparo: e.target.value })} required style={{ width: '100%', fontSize: '1.1rem', fontWeight: 700 }} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="label-premium" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><LayoutGrid size={12} /> Grupos Destinatários</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={selectAll} style={{ fontSize: '0.65rem', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}>TODOS</button>
              <button type="button" onClick={selectNone} style={{ fontSize: '0.65rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontWeight: 700 }}>NENHUM</button>
            </div>
          </label>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
            gap: '10px', 
            maxHeight: '120px', 
            overflowY: 'auto', 
            padding: '12px', 
            background: 'rgba(255,255,255,0.02)', 
            borderRadius: '12px',
            border: '1px solid var(--border)'
          }}>
            {grupos.length > 0 ? grupos.map(g => {
              const isSelected = (novaMensagem.grupo_ids || []).includes(g.id);
              return (
                <label key={g.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  background: isSelected ? 'rgba(37,99,235,0.1)' : 'transparent',
                  border: isSelected ? '1px solid rgba(37,99,235,0.3)' : '1px solid transparent',
                  transition: 'all 0.2s'
                }}>
                  <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={() => toggleGrupo(g.id)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: isSelected ? 'var(--text-main)' : 'var(--text-dim)', fontWeight: isSelected ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.nome}</span>
                </label>
              );
            }) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)', padding: '10px' }}>Nenhum grupo ativo encontrado.</div>
            )}
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '6px', fontStyle: 'italic' }}>* A mensagem só será disparada para os grupos selecionados acima. Se nenhum for selecionado, ela não será enviada.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: (novaMensagem.tipo_de_mensagem !== 'texto' && novaMensagem.tipo_de_mensagem !== 'nome_grupo' && novaMensagem.tipo_de_mensagem !== 'status_grupo') ? '1fr 320px' : '1fr', gap: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            {novaMensagem.tipo_de_mensagem === 'status_grupo' ? (
              <div>
                <label className="label-premium"><Lock size={12} /> Ação de Permissão do Grupo</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setNovaMensagem({ ...novaMensagem, mensagem: 'fechar' })}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '1.25rem', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s',
                      border: '2px solid',
                      borderColor: (novaMensagem.mensagem === 'fechar' || !novaMensagem.mensagem) ? '#ec4899' : 'var(--border)',
                      background: (novaMensagem.mensagem === 'fechar' || !novaMensagem.mensagem) ? 'rgba(236,72,153,0.12)' : 'rgba(255,255,255,0.02)',
                      color: (novaMensagem.mensagem === 'fechar' || !novaMensagem.mensagem) ? '#ec4899' : 'var(--text-dim)',
                      boxShadow: (novaMensagem.mensagem === 'fechar' || !novaMensagem.mensagem) ? '0 0 16px rgba(236,72,153,0.2)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '1.5rem' }}>🔒</div>
                    <span style={{ fontWeight: 800, fontSize: '1rem' }}>Fechar Grupo</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8, textAlign: 'center' }}>Apenas administradores podem enviar mensagens</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNovaMensagem({ ...novaMensagem, mensagem: 'abrir' })}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '1.25rem', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s',
                      border: '2px solid',
                      borderColor: novaMensagem.mensagem === 'abrir' ? '#10b981' : 'var(--border)',
                      background: novaMensagem.mensagem === 'abrir' ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.02)',
                      color: novaMensagem.mensagem === 'abrir' ? '#10b981' : 'var(--text-dim)',
                      boxShadow: novaMensagem.mensagem === 'abrir' ? '0 0 16px rgba(16,185,129,0.2)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '1.5rem' }}>🔓</div>
                    <span style={{ fontWeight: 800, fontSize: '1rem' }}>Abrir Grupo</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8, textAlign: 'center' }}>Todos os participantes podem enviar mensagens</span>
                  </button>
                </div>
              </div>
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
                  value={novaMensagem.mensagem} 
                  onChange={e => setNovaMensagem({ ...novaMensagem, mensagem: e.target.value })} 
                  placeholder={
                    novaMensagem.tipo_de_mensagem === 'nome_grupo' ? "Digite o novo nome para o grupo..." : 
                    novaMensagem.tipo_de_mensagem === 'enquete' ? "Ex: Qual sua cor favorita?" :
                    "Digite o conteúdo da mensagem..."
                  } 
                  style={{ width: '100%', minHeight: (novaMensagem.tipo_de_mensagem === 'nome_grupo' || novaMensagem.tipo_de_mensagem === 'enquete') ? '80px' : '160px', resize: 'vertical', fontSize: '1rem', lineHeight: '1.5', padding: '1rem' }} 
                  required={novaMensagem.tipo_de_mensagem === 'nome_grupo' || novaMensagem.tipo_de_mensagem === 'enquete'}
                />
              </>
            )}
          </div>

          {(novaMensagem.tipo_de_mensagem !== 'texto' && novaMensagem.tipo_de_mensagem !== 'nome_grupo' && novaMensagem.tipo_de_mensagem !== 'status_grupo') && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              {novaMensagem.tipo_de_mensagem === 'enquete' ? (
                <>
                  <label className="label-premium"><LayoutGrid size={12} /> Opções da Enquete (Uma por linha)</label>
                  <textarea 
                    value={novaMensagem.opcoes_enquete} 
                    onChange={e => setNovaMensagem({ ...novaMensagem, opcoes_enquete: e.target.value })} 
                    placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                    style={{ width: '100%', minHeight: '120px', resize: 'vertical', fontSize: '0.95rem', padding: '0.75rem' }}
                    required
                  />
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      <input 
                        type="checkbox" 
                        checked={novaMensagem.enquete_multipla} 
                        onChange={e => setNovaMensagem({ ...novaMensagem, enquete_multipla: e.target.checked })}
                      />
                      Permitir múltiplas respostas
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <label className="label-premium"><Upload size={12} /> Mídia ({novaMensagem.tipo_de_mensagem})</label>
                  <div style={{ 
                    height: '160px', border: '2px dashed var(--border)', borderRadius: '16px', position: 'relative', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                    background: 'rgba(255,255,255,0.01)', transition: 'all 0.3s'
                  }} onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--primary)'; }} onDragLeave={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border)'; }}>
                    {previewUrl ? (
                      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        {novaMensagem.tipo_de_mensagem === 'imagem' && <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        {novaMensagem.tipo_de_mensagem === 'video' && <video src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        {novaMensagem.tipo_de_mensagem === 'audio' && <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mic size={40} style={{ color: 'var(--primary)', opacity: 0.5 }} /></div>}
                        <button type="button" onClick={() => { setFile(null); setPreviewUrl(null); }} style={{ position: 'absolute', top: '8px', right: '8px', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
                      </div>
                    ) : (
                      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer', width: '100%', height: '100%', justifyContent: 'center' }}>
                        <Upload size={32} style={{ color: 'var(--text-dim)', opacity: 0.4 }} />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Clique ou arraste para enviar</span>
                        <input type="file" onChange={handleFileChange} style={{ display: 'none' }} accept={novaMensagem.tipo_de_mensagem === 'imagem' ? "image/*" : novaMensagem.tipo_de_mensagem === 'video' ? "video/*" : novaMensagem.tipo_de_mensagem === 'audio' ? "audio/*" : "*"} />
                      </label>
                    )}
                  </div>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div style={{ marginTop: '10px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s' }} />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>


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
