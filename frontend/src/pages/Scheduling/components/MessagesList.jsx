import React, { useState } from 'react';
import { Send, Clock, CalendarDays, Pencil, Trash2, Search, Filter } from 'lucide-react';
import { TIPO_CONFIG } from '../../../utils/constants';
import { ModalPortal } from '../../../components/common';

const MessagesList = ({ mensagens, onEdit, onDelete, openConfirm, editingId, onOpenNewForm }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dayFilter, setDayFilter] = useState('');
  const [fullscreenMedia, setFullscreenMedia] = useState(null);

  const filtered = (mensagens || []).filter(m => {
    const matchesSearch = (m.mensagem || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDay = dayFilter === '' || m.dia_do_lancamento === parseInt(dayFilter);
    return matchesSearch && matchesDay;
  });

  const grouped = filtered.reduce((acc, m) => {
    acc[m.dia_do_lancamento] = acc[m.dia_do_lancamento] || [];
    acc[m.dia_do_lancamento].push(m);
    return acc;
  }, {});

  const sortedDays = Object.keys(grouped).map(Number).sort((a, b) => a - b);

  return (
    <div className="fade-in">
      {/* Modal Tela Cheia - Usando Portal para cobrir TUDO (incluindo sidebar) */}
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

      {/* Top Controls: Busca, Filtro por Dia e Atalho + Novo Template */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input type="text" placeholder="Filtrar por texto da mensagem..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '38px', width: '100%', height: '40px' }} />
          </div>
          <div style={{ width: '170px', position: 'relative' }}>
            <Filter size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <select 
              value={dayFilter} 
              onChange={e => setDayFilter(e.target.value)} 
              style={{ 
                padding: '0 24px 0 38px', 
                width: '100%', 
                height: '40px', 
                lineHeight: '40px', 
                boxSizing: 'border-box',
                cursor: 'pointer'
              }}
            >
              <option value="">Todos os Dias</option>
              {[...new Set((mensagens || []).map(m => m.dia_do_lancamento))].sort((a,b)=>a-b).map(d => (
                <option key={d} value={d}>Dia {d}</option>
              ))}
            </select>
          </div>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {sortedDays.length > 0 ? sortedDays.map(day => (
          <div key={day}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--primary)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>DIA {day.toString().padStart(2, '0')}</div>
              <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {grouped[day].sort((a,b) => (a.horario_do_disparo || '').localeCompare(b.horario_do_disparo || '')).map(m => {
                const cfg = TIPO_CONFIG[m.tipo_de_mensagem] || TIPO_CONFIG.texto;
                const Icon = cfg.icon;
                const isEditing = editingId === m.id;
                
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
            Nenhuma mensagem agendada.
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesList;
