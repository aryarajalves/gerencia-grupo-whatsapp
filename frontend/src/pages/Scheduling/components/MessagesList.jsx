import React, { useState, useEffect } from 'react';
import { Send, Clock, CalendarDays, Pencil, Trash2, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { TIPO_CONFIG } from '../../../utils/constants';
import { ModalPortal } from '../../../components/common';

const MessagesList = ({ mensagens, onEdit, onDelete, openConfirm, editingId, onOpenNewForm }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDay, setActiveDay] = useState('ALL');
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [fullscreenMedia, setFullscreenMedia] = useState(null);

  // Lista única e ordenada de todos os dias existentes
  const availableDays = [...new Set((mensagens || []).map(m => m.dia_do_lancamento))].sort((a, b) => a - b);

  // Filtragem inicial por busca de texto e por aba selecionada
  const filtered = (mensagens || []).filter(m => {
    const matchesSearch = (m.mensagem || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDay = activeDay === 'ALL' || m.dia_do_lancamento === parseInt(activeDay);
    return matchesSearch && matchesDay;
  });

  // Ordenação consistente por Dia e por Horário de Disparo
  const sortedMessages = [...filtered].sort((a, b) => {
    if (a.dia_do_lancamento !== b.dia_do_lancamento) {
      return a.dia_do_lancamento - b.dia_do_lancamento;
    }
    return (a.horario_do_disparo || '').localeCompare(b.horario_do_disparo || '');
  });

  // Resetar para página 1 quando alterar filtros ou tamanho da página
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeDay, pageSize]);

  // Cálculo de paginação
  const totalItems = sortedMessages.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedMessages = sortedMessages.slice(startIndex, startIndex + pageSize);

  // Agrupamento por dia dos itens da página atual
  const groupedPageMessages = paginatedMessages.reduce((acc, m) => {
    acc[m.dia_do_lancamento] = acc[m.dia_do_lancamento] || [];
    acc[m.dia_do_lancamento].push(m);
    return acc;
  }, {});

  const daysOnCurrentPage = Object.keys(groupedPageMessages).map(Number).sort((a, b) => a - b);

  return (
    <div className="fade-in">
      {/* Modal Tela Cheia */}
      {fullscreenMedia && (
        <ModalPortal>
          <div 
            onClick={() => setFullscreenMedia(null)}
            style={{ 
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
              background: '#000', zIndex: 99999, display: 'flex', 
              alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out',
              animation: 'fadeIn 0.2s'
            }}
          >
            {fullscreenMedia.type === 'imagem' ? (
              <img src={fullscreenMedia.url} style={{ maxWidth: '95%', maxHeight: '95%', borderRadius: '4px', boxShadow: '0 0 100px rgba(0,0,0,1)' }} />
            ) : (
              <video src={fullscreenMedia.url} controls autoPlay style={{ maxWidth: '95%', maxHeight: '95%', borderRadius: '4px' }} onClick={e => e.stopPropagation()} />
            )}
            <button style={{ position: 'absolute', top: '30px', right: '30px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '12px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={24} style={{ transform: 'rotate(45deg)' }} />
            </button>
          </div>
        </ModalPortal>
      )}

      {/* Top Controls: Busca + Botão Novo Template */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input 
            type="text" 
            placeholder="Buscar texto da mensagem..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            style={{ paddingLeft: '38px', width: '100%', height: '40px' }} 
          />
        </div>

        {onOpenNewForm && (
          <button
            onClick={onOpenNewForm}
            className="btn btn-primary"
            style={{ height: '40px', padding: '0 18px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            + Novo Template
          </button>
        )}
      </div>

      {/* Navegação por Abas de Dias */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        overflowX: 'auto', 
        paddingBottom: '8px', 
        marginBottom: '1.5rem',
        scrollbarWidth: 'thin'
      }}>
        <button
          onClick={() => setActiveDay('ALL')}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            border: activeDay === 'ALL' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
            background: activeDay === 'ALL' ? 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(124,58,237,0.3))' : 'rgba(255,255,255,0.03)',
            color: activeDay === 'ALL' ? '#fff' : 'var(--text-dim)',
            transition: 'all 0.2s ease',
            boxShadow: activeDay === 'ALL' ? '0 0 15px rgba(37,99,235,0.2)' : 'none'
          }}
        >
          Todos os Dias ({mensagens?.length || 0})
        </button>

        {availableDays.map(day => {
          const countForDay = (mensagens || []).filter(m => m.dia_do_lancamento === day).length;
          const isActive = activeDay === String(day);
          return (
            <button
              key={day}
              onClick={() => setActiveDay(String(day))}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                border: isActive ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                background: isActive ? 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(124,58,237,0.3))' : 'rgba(255,255,255,0.03)',
                color: isActive ? '#fff' : 'var(--text-dim)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isActive ? '0 0 15px rgba(37,99,235,0.2)' : 'none'
              }}
            >
              <span>DIA {String(day).padStart(2, '0')}</span>
              <span style={{ 
                background: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.1)', 
                color: '#fff', 
                padding: '1px 6px', 
                borderRadius: '10px', 
                fontSize: '0.7rem' 
              }}>
                {countForDay}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista de Mensagens */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {daysOnCurrentPage.length > 0 ? daysOnCurrentPage.map(day => (
          <div key={day}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--primary)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
                DIA {day.toString().padStart(2, '0')}
              </div>
              <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {groupedPageMessages[day].map((m, indexOnDay) => {
                const cfg = TIPO_CONFIG[m.tipo_de_mensagem] || TIPO_CONFIG.texto;
                const Icon = cfg.icon;
                const isEditing = editingId === m.id;
                
                // Calcular o número sequencial da mensagem dentro do dia especifico
                const allDayMessages = [...(mensagens || [])]
                  .filter(item => item.dia_do_lancamento === day)
                  .sort((a, b) => (a.horario_do_disparo || '').localeCompare(b.horario_do_disparo || ''));
                const messageNumberOnDay = allDayMessages.findIndex(item => item.id === m.id) + 1;
                
                return (
                  <div key={m.id} className={`card ${isEditing ? 'editing-pulse' : ''}`} style={{ 
                    padding: '1rem', 
                    border: isEditing ? '2px solid var(--primary)' : `1px solid ${cfg.border || 'var(--border)'}`, 
                    background: `linear-gradient(135deg, ${cfg.bg}, rgba(255,255,255,0.02))`, 
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '180px',
                    boxShadow: isEditing ? `0 0 30px ${cfg.bg}` : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            background: 'rgba(255, 255, 255, 0.1)', 
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#fff', 
                            fontSize: '0.75rem', 
                            fontWeight: 800, 
                            padding: '2px 7px', 
                            borderRadius: '6px' 
                          }} title={`Mensagem ${messageNumberOnDay} do Dia ${day}`}>
                            #{messageNumberOnDay}
                          </span>
                          <div style={{ padding: '5px', borderRadius: '6px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}><Icon size={14} /></div>
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: cfg.color, letterSpacing: '0.5px' }}>{cfg.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 600 }}>
                          <Clock size={12} /> {String(m.horario_do_disparo || '').slice(0, 5)}
                        </div>
                      </div>

                      <div style={{ 
                        fontSize: '0.9rem', 
                        color: m.mensagem ? 'var(--text-main)' : 'var(--text-dim)', 
                        lineHeight: '1.4', 
                        marginBottom: '0.75rem', 
                        fontStyle: m.tipo_de_mensagem === 'nome_grupo' ? 'italic' : 'normal',
                        fontWeight: m.tipo_de_mensagem === 'nome_grupo' ? 600 : 400
                      }}>
                        {m.tipo_de_mensagem === 'nome_grupo' 
                          ? `Alterar nome para: "${m.mensagem}"` 
                          : m.tipo_de_mensagem === 'status_grupo' ? (
                            <div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, padding: '5px 10px', borderRadius: '8px', background: (m.link_midia === 'abrir' || m.mensagem === 'abrir') ? 'rgba(16,185,129,0.15)' : 'rgba(236,72,153,0.15)', color: (m.link_midia === 'abrir' || m.mensagem === 'abrir') ? '#10b981' : '#ec4899', border: '1px solid', borderColor: (m.link_midia === 'abrir' || m.mensagem === 'abrir') ? 'rgba(16,185,129,0.3)' : 'rgba(236,72,153,0.3)' }}>
                                  {(m.link_midia === 'abrir' || m.mensagem === 'abrir') ? '🔓 Abrir Grupo (Todos enviam)' : '🔒 Fechar Grupo (Apenas admins enviam)'}
                                </div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.75rem', padding: '4px 9px', borderRadius: '6px', background: m.admin_only_settings === true ? 'rgba(59,130,246,0.15)' : m.admin_only_settings === false ? 'rgba(16,185,129,0.15)' : 'rgba(167,139,250,0.15)', color: m.admin_only_settings === true ? '#3b82f6' : m.admin_only_settings === false ? '#10b981' : '#a78bfa', border: '1px solid', borderColor: m.admin_only_settings === true ? 'rgba(59,130,246,0.3)' : m.admin_only_settings === false ? 'rgba(16,185,129,0.3)' : 'rgba(167,139,250,0.3)' }}>
                                  {m.admin_only_settings === true ? '⚙️ Configs: Apenas Admins Editam' : m.admin_only_settings === false ? '⚙️ Configs: Todos Editam' : '⚙️ Configs: Manter Atual'}
                                </div>
                              </div>
                              {(m.mensagem && m.mensagem !== 'abrir' && m.mensagem !== 'fechar') ? (
                                <div style={{ marginTop: '6px', fontSize: '0.9rem', color: 'var(--text-main)', fontStyle: 'normal' }}>
                                  💬 <strong>Mensagem:</strong> "{m.mensagem}"
                                </div>
                              ) : (
                                <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                                  (Sem mensagem de texto enviada)
                                </div>
                              )}
                            </div>
                          )
                          : (m.mensagem || '(Mídia sem legenda)')
                        }
                      </div>

                      {m.tipo_de_mensagem === 'enquete' && m.opcoes_enquete && (
                        <div style={{ marginBottom: '1rem', background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(34, 211, 238, 0.25)' }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#22d3ee', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>Opções da Enquete:</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {m.opcoes_enquete.split('\n').filter(o => o.trim()).map((opt, oIdx) => (
                              <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#fff', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontSize: '0.65rem', background: 'rgba(34, 211, 238, 0.2)', color: '#22d3ee', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>{oIdx + 1}</span>
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                          {m.enquete_multipla && (
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '8px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              ✓ Múltiplas respostas permitidas
                            </div>
                          )}
                        </div>
                      )}

                      {m.link_midia && m.tipo_de_mensagem !== 'nome_grupo' && m.tipo_de_mensagem !== 'status_grupo' && (
                        <div 
                          onClick={() => setFullscreenMedia({ url: m.link_midia, type: m.tipo_de_mensagem })}
                          style={{ marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', height: '50px', border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', gap: '10px', padding: '6px', background: 'rgba(255,255,255,0.03)', cursor: 'zoom-in' }}
                        >
                          {m.tipo_de_mensagem === 'imagem' ? <img src={m.link_midia} style={{ width: '38px', height: '38px', borderRadius: '4px', objectFit: 'cover' }} alt="Preview" /> : <div style={{ width: '38px', height: '38px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={16} style={{ color: cfg.color }} /></div>}
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{m.link_midia.split('/').pop()}</div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: 'auto' }}>
                      <button onClick={() => onEdit(m)} className="btn-icon-secondary" style={{ width: '28px', height: '28px', background: isEditing ? 'var(--primary)' : '', color: isEditing ? '#fff' : '' }} title="Editar"><Pencil size={12} /></button>
                      <button onClick={() => onDelete(m.id, openConfirm)} className="btn-icon-danger" style={{ width: '28px', height: '28px' }} title="Excluir"><Trash2 size={12} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-dim)' }}>
            <Send size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
            Nenhuma mensagem encontrada.
          </div>
        )}
      </div>

      {/* Bar de Paginação */}
      {totalItems > 0 && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justify: 'space-between', 
          marginTop: '2rem', 
          paddingTop: '1.25rem', 
          borderTop: '1px solid var(--border)',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Seletor de quantidade por página */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            <span>Mostrar</span>
            <select
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
              <option value={200}>200 por página</option>
            </select>
            <span>de {totalItems} mensagens</span>
          </div>

          {/* Controles da paginação */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary"
              style={{
                padding: '6px 12px',
                height: '34px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: currentPage === 1 ? 0.4 : 1,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={16} /> Anterior
            </button>

            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', padding: '0 8px' }}>
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="btn btn-secondary"
              style={{
                padding: '6px 12px',
                height: '34px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: currentPage >= totalPages ? 0.4 : 1,
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Próximo <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesList;

