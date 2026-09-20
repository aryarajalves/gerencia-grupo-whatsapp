import React, { useState, useMemo } from 'react';
import {
  Clock, CheckCircle2, MessageSquare, Image, Video,
  Mic, FileText, LayoutGrid, Check, Copy, Edit3, Lock,
  Search, Zap, Tag, X
} from 'lucide-react';
import { useCopy } from '../../hooks/useCopy';

const TIPO_CONFIG = {
  texto:        { label: 'Texto',        icon: MessageSquare, color: '#60a5fa' },
  nome_grupo:   { label: 'Nome Grupo',  icon: Edit3,        color: '#f97316' },
  status_grupo: { label: 'Abrir/Fechar', icon: Lock,         color: '#ec4899' },
  imagem:       { label: 'Imagem',       icon: Image,         color: '#a78bfa' },
  video:        { label: 'Vídeo',        icon: Video,         color: '#f472b6' },
  audio:        { label: 'Áudio',        icon: Mic,           color: '#34d399' },
  arquivo:      { label: 'PDF/Arquivo',  icon: FileText,      color: '#fbbf24' },
  enquete:      { label: 'Enquete',      icon: LayoutGrid,    color: '#22d3ee' }
};

const DashboardProximosDisparos = ({ disparos = [] }) => {
  const [busca, setBusca] = useState('');
  const { copiedId, handleCopy } = useCopy();

  // Filtragem local por texto, grupo ou etiqueta
  const disparosFiltrados = useMemo(() => {
    if (!busca.trim()) return disparos;
    const termo = busca.toLowerCase();
    return disparos.filter(d =>
      (d.mensagem && d.mensagem.toLowerCase().includes(termo)) ||
      (d.grupo && d.grupo.toLowerCase().includes(termo)) ||
      (d.etiqueta && d.etiqueta.toLowerCase().includes(termo)) ||
      (d.horario && d.horario.includes(termo)) ||
      (d.tipo && d.tipo.toLowerCase().includes(termo))
    );
  }, [disparos, busca]);

  const total = disparos.length;
  const filtradosCount = disparosFiltrados.length;
  const hasBusca = busca.trim().length > 0;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Cabeçalho do Card */}
      <div style={{
        padding: '1.1rem 1.5rem',
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(37,99,235,0.25), rgba(124,58,237,0.25))',
            border: '1px solid rgba(59,130,246,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(37,99,235,0.2)'
          }}>
            <Clock size={16} style={{ color: '#60a5fa' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Próximos Disparos de Hoje
            </h3>
            <span style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>
              Sequência programada até o final do dia
            </span>
          </div>
        </div>

        {/* Badges e Campo de Busca */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {total > 3 && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={13} style={{ position: 'absolute', left: '10px', color: 'var(--text-dim)', pointerEvents: 'none' }} />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar mensagem..."
                style={{
                  padding: '5px 26px 5px 28px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '0.75rem',
                  outline: 'none',
                  width: '150px',
                  transition: 'all 0.2s'
                }}
              />
              {busca && (
                <button
                  onClick={() => setBusca('')}
                  style={{ position: 'absolute', right: '8px', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 0 }}
                  title="Limpar busca"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {total > 0 && (
            <span style={{
              padding: '3px 10px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1))',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#fbbf24',
              fontSize: '0.75rem',
              fontWeight: 700,
              boxShadow: '0 0 10px rgba(245,158,11,0.12)'
            }}>
              {hasBusca ? `${filtradosCount} de ${total}` : `${total} agendado(s)`}
            </span>
          )}
        </div>
      </div>

      {/* Conteúdo com Scroll Customizado */}
      <div style={{
        padding: '1.25rem 1.5rem',
        maxHeight: '520px',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(59,130,246,0.3) rgba(255,255,255,0.02)'
      }}>
        {filtradosCount > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {disparosFiltrados.map((d, i) => {
              const cfg = TIPO_CONFIG[d.tipo] || TIPO_CONFIG.texto;
              const Icon = cfg.icon;
              const isLast = i === filtradosCount - 1;
              const isNextImmediate = i === 0 && !hasBusca;
              const currentId = `dash-item-${i}-${d.horario}`;
              const fullText = d.mensagem_completa || d.mensagem || '';

              return (
                <div
                  key={currentId}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'flex-start',
                    paddingBottom: isLast ? 0 : '14px',
                    position: 'relative'
                  }}
                >
                  {/* Linha vertical da linha do tempo */}
                  {!isLast && (
                    <div style={{
                      position: 'absolute',
                      left: '21px',
                      top: '40px',
                      bottom: 0,
                      width: '1px',
                      background: isNextImmediate
                        ? 'linear-gradient(180deg, rgba(59,130,246,0.5) 0%, var(--border) 100%)'
                        : 'var(--border)'
                    }} />
                  )}

                  {/* Badge de Horário */}
                  <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{
                      width: '42px',
                      height: '40px',
                      borderRadius: '10px',
                      background: isNextImmediate
                        ? 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(124,58,237,0.25))'
                        : 'rgba(37,99,235,0.12)',
                      border: isNextImmediate
                        ? '1px solid rgba(96,165,250,0.5)'
                        : '1px solid rgba(37,99,235,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isNextImmediate ? '0 0 14px rgba(37,99,235,0.3)' : 'none',
                      transition: 'all 0.2s'
                    }}>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: isNextImmediate ? '#93c5fd' : 'var(--primary)',
                        lineHeight: 1,
                        fontVariantNumeric: 'tabular-nums'
                      }}>
                        {String(d.horario || '').slice(0, 5)}
                      </span>
                    </div>
                  </div>

                  {/* Card da Mensagem */}
                  <div style={{
                    flex: 1,
                    minWidth: 0,
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: isNextImmediate
                      ? 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(124,58,237,0.04))'
                      : 'rgba(255,255,255,0.02)',
                    border: isNextImmediate
                      ? '1px solid rgba(59,130,246,0.35)'
                      : '1px solid var(--border)',
                    boxShadow: isNextImmediate
                      ? '0 4px 16px rgba(37,99,235,0.12)'
                      : '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease'
                  }}>
                    {/* Topo do Card: Grupo + Link + Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.grupo}
                        </span>

                        {d.link_convite && (
                          <button
                            type="button"
                            onClick={() => handleCopy(d.link_convite, currentId)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: copiedId === currentId ? '#10b981' : 'var(--primary)',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              opacity: 0.85,
                              transition: 'all 0.15s'
                            }}
                            title={copiedId === currentId ? 'Link copiado!' : 'Copiar link de convite'}
                          >
                            {copiedId === currentId ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        {/* Destaque "Próximo" para o primeiro item */}
                        {isNextImmediate && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: '10px',
                            background: 'rgba(59,130,246,0.2)',
                            color: '#60a5fa',
                            border: '1px solid rgba(59,130,246,0.35)',
                            textTransform: 'uppercase'
                          }}>
                            <Zap size={9} style={{ fill: '#60a5fa' }} /> Próximo
                          </span>
                        )}

                        {/* Etiqueta / Tag (se houver) */}
                        {d.etiqueta && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '10px',
                            background: 'rgba(167,139,250,0.12)',
                            color: '#c4b5fd',
                            border: '1px solid rgba(167,139,250,0.25)'
                          }}>
                            <Tag size={9} /> {d.etiqueta}
                          </span>
                        )}

                        {/* Badge de Tipo de Mensagem */}
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.65rem',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: `rgba(${cfg.color === '#60a5fa' ? '96,165,250' : '255,255,255'}, 0.08)`,
                          color: cfg.color,
                          border: `1px solid ${cfg.color}33`,
                          whiteSpace: 'nowrap',
                          textTransform: 'uppercase',
                          fontWeight: 700
                        }}>
                          <Icon size={10} /> {cfg.label}
                        </span>
                      </div>
                    </div>

                    {/* Texto da Mensagem */}
                    <div
                      title={fullText}
                      style={{
                        color: 'var(--text-dim)',
                        fontSize: '0.8rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.4
                      }}
                    >
                      {d.mensagem}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              margin: '0 auto 12px',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={22} style={{ color: '#10b981', opacity: 0.6 }} />
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', margin: 0 }}>
              {hasBusca ? 'Nenhum disparo encontrado para essa busca.' : 'Sem disparos agendados para este filtro.'}
            </p>
          </div>
        )}
      </div>

      {/* Rodapé Informativo */}
      {filtradosCount > 0 && (
        <div style={{
          padding: '0.65rem 1.5rem',
          borderTop: '1px solid var(--border)',
          background: 'rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: 'var(--text-dim)'
        }}>
          <span>Disparos programados para hoje</span>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
            {filtradosCount} {filtradosCount === 1 ? 'mensagem' : 'mensagens'}
          </span>
        </div>
      )}
    </div>
  );
};

export default DashboardProximosDisparos;
