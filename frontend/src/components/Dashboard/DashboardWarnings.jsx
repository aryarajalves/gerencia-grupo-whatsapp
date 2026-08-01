import React, { useState } from 'react';
import { AlertTriangle, X, ChevronDown, ChevronUp, Search, ExternalLink } from 'lucide-react';

const DashboardWarnings = ({
  falhas_definitivas = [],
  grupos_sem_mensagens = [],
  conjuntos_quase_cheios = [],
  handleDispensar,
  dispensando,
  selectedGroupJid,
  setSelectedGroupJid,
  grupos = []
}) => {
  const [expandido, setExpandido] = useState(false);
  const [buscaGrupo, setBuscaGrupo] = useState('');

  const selectedGroupObj = grupos.find(g => g.id_do_grupo === selectedGroupJid);
  const selectedGroupName = selectedGroupObj ? selectedGroupObj.nome : null;

  // Filtrar avisos por grupo selecionado se não for TODOS
  const falhasFiltradas = selectedGroupJid === 'TODOS'
    ? falhas_definitivas
    : falhas_definitivas.filter(f => f.grupo_nome === selectedGroupName);

  const gruposSemMsgFiltrados = selectedGroupJid === 'TODOS'
    ? grupos_sem_mensagens
    : grupos_sem_mensagens.filter(nome => nome === selectedGroupName);

  const temAlertas = falhasFiltradas.length > 0 || gruposSemMsgFiltrados.length > 0 || (selectedGroupJid === 'TODOS' && conjuntos_quase_cheios.length > 0);

  if (!temAlertas) return null;

  // Grupos filtrados na busca dentro do painel expandido
  const gruposBusca = gruposSemMsgFiltrados.filter(nome =>
    nome.toLowerCase().includes(buscaGrupo.toLowerCase())
  );

  return (
    <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Falhas Definitivas */}
      {falhasFiltradas.map((falha) => (
        <div key={falha.id} style={{
          borderRadius: '12px', padding: '1rem 1.25rem',
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.3)',
          display: 'flex', alignItems: 'flex-start', gap: '12px'
        }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={16} style={{ color: '#ef4444' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#ef4444', marginBottom: '2px' }}>
              Falha definitiva — {falha.grupo_nome}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>
              {falha.mensagem_corpo}
            </div>
            {falha.detalhes_erro && (
              <div style={{ fontSize: '0.72rem', color: '#f87171', background: 'rgba(239,68,68,0.08)', borderRadius: '6px', padding: '4px 8px', display: 'inline-block' }}>
                {falha.detalhes_erro}
              </div>
            )}
          </div>
          <button
            onClick={() => handleDispensar(falha.id)}
            disabled={dispensando === falha.id}
            style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.1)', color: '#ef4444',
              fontSize: '0.75rem', fontWeight: 600, cursor: dispensando === falha.id ? 'not-allowed' : 'pointer',
              opacity: dispensando === falha.id ? 0.6 : 1, transition: 'opacity 0.2s'
            }}
          >
            <X size={12} />
            {dispensando === falha.id ? 'Dispensando...' : 'Dispensar'}
          </button>
        </div>
      ))}

      {/* Grupos Sem Mensagens */}
      {gruposSemMsgFiltrados.length > 0 && (
        selectedGroupJid !== 'TODOS' || gruposSemMsgFiltrados.length === 1 ? (
          // Caso 1: Apenas 1 grupo sem mensagem ou grupo específico selecionado
          gruposSemMsgFiltrados.map((nome, i) => (
            <div key={`sem-msg-${i}`} style={{
              borderRadius: '12px', padding: '1rem 1.25rem',
              background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.3)',
              display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f59e0b' }}>
                  Aviso de Configuração — {nome}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  Este grupo não possui mensagens associadas. Nada será disparado para ele.
                </div>
              </div>
            </div>
          ))
        ) : (
          // Caso 2: Múltiplos grupos sem mensagens na visão geral -> RESUMO CONSOLIDADO
          <div style={{
            borderRadius: '14px',
            background: 'rgba(245,158,11,0.05)',
            border: '1px solid rgba(245,158,11,0.3)',
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Aviso de Configuração</span>
                    <span style={{ padding: '2px 8px', borderRadius: '12px', background: 'rgba(245,158,11,0.2)', fontSize: '0.72rem', fontWeight: 800 }}>
                      {gruposSemMsgFiltrados.length} GRUPOS
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    {gruposSemMsgFiltrados.length} grupos ativos não possuem roteiro de mensagens associado no funil de lançamento.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setExpandido(!expandido)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  background: 'rgba(245,158,11,0.12)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  color: '#f59e0b',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                {expandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {expandido ? 'Ocultar Lista' : `Ver Grupos (${gruposSemMsgFiltrados.length})`}
              </button>
            </div>

            {/* Painel Expansível com busca e chips */}
            {expandido && (
              <div style={{
                padding: '1.25rem',
                borderTop: '1px solid rgba(245,158,11,0.2)',
                background: 'rgba(0, 0, 0, 0.25)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-dim)' }} />
                    <input
                      type="text"
                      placeholder="Buscar grupo sem mensagem..."
                      value={buscaGrupo}
                      onChange={(e) => setBuscaGrupo(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 12px 6px 34px',
                        borderRadius: '8px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid var(--border)',
                        color: '#fff',
                        fontSize: '0.8rem'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                    Exibindo {gruposBusca.length} de {gruposSemMsgFiltrados.length}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  paddingRight: '4px'
                }}>
                  {gruposBusca.map((nome, idx) => {
                    const gMatch = grupos.find(g => g.nome === nome);
                    return (
                      <button
                        key={idx}
                        onClick={() => gMatch && setSelectedGroupJid(gMatch.id_do_grupo)}
                        title={gMatch ? 'Clique para filtrar o Dashboard neste grupo' : ''}
                        style={{
                          fontSize: '0.75rem',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: 'rgba(245,158,11,0.1)',
                          color: '#f59e0b',
                          border: '1px solid rgba(245,158,11,0.2)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'transform 0.15s, background 0.15s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,158,11,0.25)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; }}
                      >
                        <span>{nome}</span>
                        <ExternalLink size={10} style={{ opacity: 0.6 }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* Conjuntos Quase Cheios */}
      {selectedGroupJid === 'TODOS' && conjuntos_quase_cheios.map((c, i) => (
        <div key={`conj-cheio-${i}`} style={{
          borderRadius: '12px', padding: '1rem 1.25rem',
          background: c.porcentagem >= 100 ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)',
          border: c.porcentagem >= 100 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(245,158,11,0.3)',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
            background: c.porcentagem >= 100 ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
            border: c.porcentagem >= 100 ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(245,158,11,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <AlertTriangle size={16} style={{ color: c.porcentagem >= 100 ? '#ef4444' : '#f59e0b' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: c.porcentagem >= 100 ? '#ef4444' : '#f59e0b' }}>
              {c.porcentagem >= 100 ? 'LOTAÇÃO MÁXIMA' : 'CAPACIDADE CRÍTICA'} — {c.nome}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>O conjunto atingiu {c.porcentagem}% da capacidade ({c.leads}/{c.max} leads).</span>
              {c.porcentagem >= 100 && <span style={{ color: '#ef4444', fontWeight: 700 }}>REDIRECIONAMENTO ATIVO PARA PÁGINA DE ESGOTAMENTO.</span>}
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '8px' }}>
              <div style={{ width: `${Math.min(c.porcentagem, 100)}%`, height: '100%', background: c.porcentagem >= 100 ? '#ef4444' : '#f59e0b', borderRadius: '2px' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardWarnings;
