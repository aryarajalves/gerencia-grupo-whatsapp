import React, { useState, useRef } from 'react';
import { 
  X, ListChecks, GitFork, LayoutGrid, Minimize2, Maximize2, 
  PlusCircle, MinusCircle, Clock, CheckCircle2, Eye, Zap, FileText,
  RefreshCcw, PlayCircle, XCircle
} from 'lucide-react';
import { ModalPortal } from '../../../components/common';
import { DIAS_SEMANA, TIPO_CONFIG } from '../../../utils/constants';

const MessagesModal = ({ 
  grupo, 
  mensagens, 
  mensagensAssociadas, 
  toggleMensagem, 
  onSave, 
  onClose, 
  loading, 
  saving 
}) => {
  const [viewMode, setViewMode] = useState('funnel');
  const [filtroDia, setFiltroDia] = useState('todos');
  const [zoom, setZoom] = useState(1);
  const [isMaximized, setIsMaximized] = useState(false);
  const [viewingMsgDetail, setViewingMsgDetail] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const funnelCanvasRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const totalDias = (() => {
    const diff = grupo.dia_fim_semana - grupo.dia_inicio_semana;
    return diff >= 0 ? diff + 1 : diff + 8;
  })();

  const diasDisponiveis = Array.from({ length: totalDias }, (_, i) => i + 1);

  const mensagensFiltradas = (mensagens || []).filter(m => {
    const pertenceAoGrupo = (m.grupo_ids || []).includes(grupo.id) || mensagensAssociadas.includes(String(m.id));
    if (!pertenceAoGrupo) return false;
    
    return filtroDia === 'todos' || m.dia_do_lancamento === Number(filtroDia);
  });

  const handleMouseDown = (e) => {
    if (viewMode !== 'funnel' || !funnelCanvasRef.current) return;
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: funnelCanvasRef.current.scrollLeft,
      scrollTop: funnelCanvasRef.current.scrollTop
    };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !funnelCanvasRef.current) return;
    const dx = (e.clientX - dragStartPos.current.x) / zoom;
    const dy = (e.clientY - dragStartPos.current.y) / zoom;
    funnelCanvasRef.current.scrollLeft = dragStartPos.current.scrollLeft - dx;
    funnelCanvasRef.current.scrollTop = dragStartPos.current.scrollTop - dy;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    if (viewMode !== 'funnel' || !funnelCanvasRef.current) return;
    const scaleFactor = -e.deltaY * 0.001;
    const newZoom = Math.min(Math.max(0.4, zoom + scaleFactor), 2);
    if (newZoom !== zoom) setZoom(newZoom);
  };

  return (
    <ModalPortal>
      <div 
        style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div 
          style={{ 
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: isMaximized ? '0' : '24px', 
            width: isMaximized ? '100vw' : '100%', maxWidth: isMaximized ? '100vw' : (viewMode === 'funnel' ? '1280px' : '600px'), 
            height: isMaximized ? '100vh' : '85vh', display: 'flex', flexDirection: 'column', 
            boxShadow: '0 40px 80px rgba(0,0,0,0.9)', transition: 'all 0.4s', overflow: 'hidden', position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, rgba(124,58,237,0.08), transparent)', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                <ListChecks size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Mensagens do Grupo</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  <strong style={{ color: 'var(--text-main)' }}>{grupo.nome}</strong>
                  {' · '}{DIAS_SEMANA[grupo.dia_inicio_semana]} → {DIAS_SEMANA[grupo.dia_fim_semana]}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="view-switcher" style={{ margin: 0 }}>
                <button onClick={() => setViewMode('funnel')} className={`view-btn ${viewMode === 'funnel' ? 'active' : ''}`}><GitFork size={14} /> Funil</button>
                <button onClick={() => setViewMode('list')} className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}><LayoutGrid size={14} /> Lista</button>
              </div>
              <button onClick={() => setIsMaximized(!isMaximized)} className="btn-icon-secondary">{isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
              <button onClick={onClose} className="btn-icon-danger"><X size={20} /></button>
            </div>
          </div>

          {viewMode === 'list' ? (
            <>
              <div style={{ padding: '10px 2rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '8px', flexWrap: 'wrap', background: 'rgba(255,255,255,0.01)' }}>
                {['todos', ...diasDisponiveis.map(String)].map(d => (
                  <button key={d} onClick={() => setFiltroDia(d)} style={{
                    padding: '5px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: filtroDia === d ? 700 : 500,
                    border: '1px solid', borderColor: filtroDia === d ? 'var(--primary)' : 'var(--border)',
                    background: filtroDia === d ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.03)',
                    color: filtroDia === d ? 'var(--primary)' : 'var(--text-dim)'
                  }}>{d === 'todos' ? 'Todos os Dias' : `Dia ${d.padStart(2, '0')}`}</button>
                ))}
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '4rem' }}><RefreshCcw size={32} className="spin" /></div>
                ) : mensagensFiltradas.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>Nenhuma mensagem encontrada</div>
                ) : mensagensFiltradas.map(m => {
                  const selecionada = mensagensAssociadas.includes(String(m.id));
                  return (
                    <div key={m.id} onClick={() => toggleMensagem(String(m.id))} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '14px 18px', borderRadius: '14px', cursor: 'pointer',
                      border: selecionada ? '1.5px solid #10b981' : '1px solid var(--border)',
                      background: selecionada ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.85))' : 'rgba(255,255,255,0.02)',
                      boxShadow: selecionada ? '0 0 15px rgba(16, 185, 129, 0.25)' : 'none',
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: '2px solid', borderColor: selecionada ? '#10b981' : 'var(--border)', background: selecionada ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: selecionada ? '0 0 8px #10b981' : 'none' }}>
                        {selecionada && <CheckCircle2 size={16} color="#fff" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.75rem', background: 'rgba(37,99,235,0.15)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '10px', fontWeight: 700 }}>Dia {m.dia_do_lancamento.toString().padStart(2, '0')}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={12} />{m.horario_do_disparo?.slice(0,5)}</span>
                          
                          <span style={{
                            marginLeft: 'auto',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: selecionada ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                            color: selecionada ? '#34d399' : 'var(--text-dim)',
                            border: selecionada ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)'
                          }}>
                            {selecionada ? <><CheckCircle2 size={11} style={{ color: '#34d399' }} /> ATIVO</> : <><XCircle size={11} style={{ color: 'var(--text-dim)' }} /> PAUSADO</>}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.95rem', color: selecionada ? '#fff' : 'var(--text-main)', fontWeight: selecionada ? 600 : 400 }}>{m.mensagem || '(Mídia)'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="funnel-container" style={{ flex: 1, overflow: 'hidden', cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none', position: 'relative' }} onMouseDown={handleMouseDown} onWheel={handleWheel}>
              <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', zIndex: 100 }}>
                <div style={{ background: 'rgba(23, 25, 35, 0.85)', borderRadius: '12px', padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="btn-icon-secondary"><PlusCircle size={20} /></button>
                  <div style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700 }}>{Math.round(zoom * 100)}%</div>
                  <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="btn-icon-secondary"><MinusCircle size={20} /></button>
                  <button onClick={() => setZoom(1)} className="btn-icon-primary" style={{ fontSize: '0.7rem' }}>1:1</button>
                </div>
              </div>

              <div className="funnel-canvas" ref={funnelCanvasRef} style={{ overflow: 'hidden', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ 
                  display: 'flex', 
                  gap: '120px', 
                  padding: '10rem', 
                  transform: `scale(${zoom})`, 
                  transformOrigin: 'center center',
                  transition: 'transform 0.1s ease-out',
                  minWidth: 'max-content'
                }}>
                  <div style={{ alignSelf: 'center', paddingRight: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.15)', border: '2px solid rgba(124, 58, 237, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <PlayCircle size={28} />
                    </div>
                  </div>

                  {(() => {
                    const msgsDoGrupo = (mensagens || []).filter(m => 
                      (m.grupo_ids || []).includes(grupo.id) || mensagensAssociadas.includes(String(m.id))
                    );

                    const grouped = msgsDoGrupo.reduce((acc, m) => {
                      acc[m.dia_do_lancamento] = acc[m.dia_do_lancamento] || [];
                      acc[m.dia_do_lancamento].push(m);
                      return acc;
                    }, {});
                    const sortedDays = Object.keys(grouped).map(Number).sort((a, b) => a - b);
                    const totalW = 124 + sortedDays.length * (300 + 120);

                    return (
                      <>
                        <svg className="funnel-svg-layer" style={{ width: `${totalW}px` }}>
                          {sortedDays.map((day, idx) => idx < sortedDays.length - 1 && (
                            <path key={idx} d={`M${124 + idx * 420 + 300} 84 C${124 + idx * 420 + 360} 84, ${124 + (idx+1) * 420 - 60} 84, ${124 + (idx+1) * 420} 84`} className="funnel-connection" />
                          ))}
                        </svg>

                        {sortedDays.map((day) => {
                          const dayMsgs = [...grouped[day]].sort((a, b) => (a.horario_do_disparo || '').localeCompare(b.horario_do_disparo || ''));
                          const numAtivas = dayMsgs.filter(m => mensagensAssociadas.includes(String(m.id))).length;
                          const temAtiva = numAtivas > 0;

                          return (
                            <div 
                              key={day} 
                              className="funnel-node"
                              onWheel={(e) => e.stopPropagation()}
                              style={{
                                border: temAtiva ? '1.5px solid rgba(16, 185, 129, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
                                boxShadow: temAtiva ? '0 10px 35px rgba(16, 185, 129, 0.15)' : '0 20px 50px rgba(0, 0, 0, 0.5)',
                                transition: 'all 0.3s ease'
                              }}
                            >

                              <div 
                                className="funnel-node-header"
                                style={{
                                  background: temAtiva 
                                    ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.12), transparent)' 
                                    : 'rgba(255, 255, 255, 0.015)'
                                }}
                              >
                                <Zap size={14} style={{ color: temAtiva ? '#34d399' : 'var(--primary)' }} />
                                <h4 className="funnel-node-title" style={{ color: temAtiva ? '#fff' : 'var(--text-main)' }}>
                                  Dia {day.toString().padStart(2, '0')}
                                </h4>

                                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {temAtiva ? (
                                    <span style={{ 
                                      background: 'rgba(16, 185, 129, 0.2)', 
                                      border: '1px solid rgba(16, 185, 129, 0.5)', 
                                      color: '#34d399', 
                                      padding: '2px 8px', 
                                      borderRadius: '12px', 
                                      fontSize: '0.65rem', 
                                      fontWeight: 800, 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: '4px',
                                      boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)'
                                    }}>
                                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }}></span>
                                      {numAtivas}/{dayMsgs.length} ATIVAS
                                    </span>
                                  ) : (
                                    <span style={{ 
                                      background: 'rgba(255, 255, 255, 0.05)', 
                                      border: '1px solid rgba(255, 255, 255, 0.1)', 
                                      color: 'var(--text-dim)', 
                                      padding: '2px 8px', 
                                      borderRadius: '12px', 
                                      fontSize: '0.65rem',
                                      fontWeight: 600
                                    }}>
                                      INATIVO
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="funnel-node-body">
                                {dayMsgs.map(m => {
                                  const selecionada = mensagensAssociadas.includes(String(m.id));
                                  const cfg = TIPO_CONFIG[m.tipo_de_mensagem] || TIPO_CONFIG.texto;
                                  const Icon = cfg.icon;
                                  return (
                                    <div 
                                      key={m.id} 
                                      onClick={(e) => { e.stopPropagation(); toggleMensagem(String(m.id)); }} 
                                      className={`funnel-msg-card ${selecionada ? 'selected' : 'unselected'}`} 
                                      style={{ 
                                        background: selecionada 
                                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(15, 23, 42, 0.85))' 
                                          : 'rgba(255, 255, 255, 0.02)', 
                                        borderColor: selecionada ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                                        boxShadow: selecionada ? '0 0 16px rgba(16, 185, 129, 0.25)' : 'none',
                                        opacity: selecionada ? 1 : 0.55,
                                        transform: selecionada ? 'scale(1.02)' : 'none',
                                        transition: 'all 0.25s ease'
                                      }}
                                    >
                                      <div className="funnel-msg-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: selecionada ? '#34d399' : 'var(--text-dim)', fontWeight: 700 }}>
                                          <Clock size={11} /> {m.horario_do_disparo?.slice(0, 5)}
                                        </span>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <button onClick={(e) => { e.stopPropagation(); setViewingMsgDetail(m); }} className="btn-icon-secondary" style={{ padding: 0 }} title="Ver detalhes">
                                            <Eye size={12} />
                                          </button>
                                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: selecionada ? '#fff' : cfg.color }}>{cfg.label}</span>
                                          
                                          <span style={{
                                            padding: '2px 6px',
                                            borderRadius: '8px',
                                            fontSize: '0.6rem',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '3px',
                                            background: selecionada ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                                            color: selecionada ? '#34d399' : 'var(--text-dim)',
                                            border: selecionada ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                                            boxShadow: selecionada ? '0 0 8px rgba(16, 185, 129, 0.3)' : 'none'
                                          }}>
                                            {selecionada ? (
                                              <>
                                                <CheckCircle2 size={10} style={{ color: '#34d399' }} /> ATIVO
                                              </>
                                            ) : (
                                              <>
                                                <XCircle size={10} style={{ color: 'var(--text-dim)' }} /> PAUSADO
                                              </>
                                            )}
                                          </span>
</div>
                                      </div>

                                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                        <Icon size={13} style={{ color: selecionada ? '#34d399' : cfg.color, marginTop: '2px', flexShrink: 0 }} />
                                        <div style={{ flex: 1 }}>
                                          <div className="funnel-msg-text" style={{ color: selecionada ? '#fff' : 'var(--text-dim)', fontWeight: selecionada ? 600 : 400 }}>
                                            {m.mensagem || '(Mídia)'}
                                          </div>

                                          {m.tipo_de_mensagem === 'enquete' && m.opcoes_enquete && (
                                            <div style={{ marginTop: '8px', background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
                                              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#22d3ee', textTransform: 'uppercase', marginBottom: '4px' }}>Opções:</div>
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                {m.opcoes_enquete.split('\n').filter(o => o.trim()).map((opt, oIdx) => (
                                                  <div key={oIdx} style={{ fontSize: '0.72rem', color: selecionada ? '#fff' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ fontSize: '0.6rem', color: '#22d3ee', background: 'rgba(34,211,238,0.15)', width: '15px', height: '15px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{oIdx + 1}</span>
                                                    <span>{opt}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          <div style={{ padding: '1rem 2rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.01)', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              {mensagensAssociadas.length > 0 && (
                <div style={{ padding: '6px 14px', borderRadius: '20px', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700 }}>
                  {mensagensAssociadas.length} selecionada(s)
                </div>
              )}
            </div>
            <button onClick={onClose} disabled={saving} className="btn btn-secondary">Cancelar</button>
            <button onClick={onSave} disabled={saving} className="btn btn-primary" style={{ width: '220px' }}>
              {saving ? <RefreshCcw size={18} className="spin" /> : <><CheckCircle2 size={18} /> Salvar Alterações</>}
            </button>
          </div>
        </div>

        {viewingMsgDetail && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 11000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setViewingMsgDetail(null)}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '1.5rem', position: 'relative' }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setViewingMsgDetail(null)} className="btn-icon-danger" style={{ position: 'absolute', top: '1rem', right: '1rem' }}><X size={18} /></button>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                <span className="badge-primary">DIA {viewingMsgDetail.dia_do_lancamento}</span>
                <span style={{ color: 'var(--text-dim)' }}><Clock size={14} /> {viewingMsgDetail.horario_do_disparo?.slice(0, 5)}</span>
              </div>
              {viewingMsgDetail.link_midia && (
                <div style={{ marginBottom: '1.5rem' }}>
                  {viewingMsgDetail.tipo_de_mensagem === 'imagem' && <img src={viewingMsgDetail.link_midia} style={{ width: '100%', borderRadius: '12px' }} />}
                  {viewingMsgDetail.tipo_de_mensagem === 'video' && <video src={viewingMsgDetail.link_midia} controls style={{ width: '100%', borderRadius: '12px' }} />}
                </div>
              )}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>{viewingMsgDetail.mensagem}</div>
            </div>
          </div>
        )}
      </div>
    </ModalPortal>
  );
};

export default MessagesModal;
