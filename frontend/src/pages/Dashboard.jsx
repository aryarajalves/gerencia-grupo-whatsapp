import React, { useState } from 'react';
import {
  Users, Send, TrendingUp, MessageSquare,
  Clock, CheckCircle2, Layers, History, Image, Video,
  Mic, FileText, LayoutGrid, Check, Copy, Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCopy } from '../hooks/useCopy';
import axiosInstance from '../services/api';
import { useWaStatus } from '../contexts/WaStatusContext';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import DashboardWarnings from '../components/Dashboard/DashboardWarnings';

const TIPO_CONFIG = {
  texto:      { label: 'Texto',       icon: MessageSquare, color: '#60a5fa' },
  nome_grupo: { label: 'Nome Grupo', icon: Edit3,       color: '#f97316' },
  imagem:     { label: 'Imagem',      icon: Image,         color: '#a78bfa' },
  video:      { label: 'Vídeo',       icon: Video,         color: '#f472b6' },
  audio:      { label: 'Áudio',       icon: Mic,           color: '#34d399' },
  arquivo:    { label: 'PDF/Arquivo', icon: FileText,      color: '#fbbf24' },
  enquete:    { label: 'Enquete',     icon: LayoutGrid,    color: '#22d3ee' }
};

const Dashboard = ({ stats = {}, grupos = [], onRefresh }) => {
  const { waStatus } = useWaStatus();
  const {
    total_grupos_ativos = 0,
    total_grupos_lancamento = 0,
    total_mensagens = 0,
    disparos_hoje = 0,
    taxa_sucesso = 0,
    ultimo_disparo = null,
    proximos_disparos = [],
    grupos_por_dia = [],
    falhas_definitivas = [],
    grupos_sem_mensagens = [],
    conjuntos_quase_cheios = []
  } = stats;

  const [dispensando, setDispensando] = useState(null);
  const [selectedGroupJid, setSelectedGroupJid] = useState('TODOS');
  const [expanderCicloMap, setExpanderCicloMap] = useState({});
  const { copiedId, handleCopy } = useCopy();

  const handleDispensar = async (id) => {
    setDispensando(id);
    try {
      await axiosInstance.patch(`/logs/${id}/dispensar`);
      toast.success('Alerta dispensado com sucesso');
      if (onRefresh) onRefresh();
    } catch {
      toast.error('Erro ao dispensar alerta');
    } finally {
      setDispensando(null);
    }
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  const selectedGroupObj = grupos.find(g => g.id_do_grupo === selectedGroupJid);
  const selectedGroupName = selectedGroupObj ? selectedGroupObj.nome : null;

  // Filtrar Próximos Disparos por grupo selecionado
  const disparosFiltrados = selectedGroupJid === 'TODOS'
    ? proximos_disparos
    : proximos_disparos.filter(d => d.grupo === selectedGroupName);

  // Filtrar Ciclo por dia
  const cicloFiltrado = selectedGroupJid === 'TODOS'
    ? grupos_por_dia
    : grupos_por_dia.map(item => ({
        dia: item.dia,
        grupos: item.grupos.filter(nome => nome === selectedGroupName)
      })).filter(item => item.grupos.length > 0);

  // Filtrar Último Disparo
  const ultimoDisparoFiltrado = selectedGroupJid === 'TODOS'
    ? ultimo_disparo
    : (ultimo_disparo && ultimo_disparo.grupo_nome === selectedGroupName ? ultimo_disparo : null);

  const toggleExpandirCiclo = (dia) => {
    setExpanderCicloMap(prev => ({ ...prev, [dia]: !prev[dia] }));
  };

  const statCards = [
    {
      label: selectedGroupJid === 'TODOS' ? 'Grupos Ativos' : 'Status do Grupo',
      value: selectedGroupJid === 'TODOS' ? total_grupos_ativos : (selectedGroupObj?.ativo ? 'Ativo' : 'Inativo'),
      sub: selectedGroupJid === 'TODOS'
        ? (total_grupos_lancamento > 0 ? `${total_grupos_lancamento} em ciclo de lançamento` : 'Nenhum grupo em ciclo hoje')
        : (selectedGroupObj?.dia_lancamento_atual > 0 ? `Dia ${selectedGroupObj.dia_lancamento_atual} do lançamento` : 'Ciclo encerrado / não iniciado'),
      icon: Users, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)',
      accent: 'rgba(96,165,250,0.06)'
    },
    {
      label: 'Disparos Hoje', value: disparos_hoje,
      sub: 'Mensagens enviadas', icon: Send,
      color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)',
      accent: 'rgba(167,139,250,0.06)'
    },
    {
      label: 'Taxa de Sucesso', value: `${taxa_sucesso}%`,
      sub: null, icon: TrendingUp,
      color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)',
      accent: 'rgba(52,211,153,0.06)', progress: taxa_sucesso
    },
    {
      label: 'Modelos no Funil', value: total_mensagens,
      sub: 'Roteiro configurado', icon: MessageSquare,
      color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)',
      accent: 'rgba(251,146,60,0.06)'
    },
  ];

  return (
    <div className="fade-in">
      {/* Header com Seletor Dropdown de Grupos */}
      <DashboardHeader
        dateStr={dateStr}
        waStatus={waStatus}
        grupos={grupos}
        selectedGroupJid={selectedGroupJid}
        setSelectedGroupJid={setSelectedGroupJid}
      />

      {/* Avisos & Alertas Agrupados */}
      <DashboardWarnings
        falhas_definitivas={falhas_definitivas}
        grupos_sem_mensagens={grupos_sem_mensagens}
        conjuntos_quase_cheios={conjuntos_quase_cheios}
        handleDispensar={handleDispensar}
        dispensando={dispensando}
        selectedGroupJid={selectedGroupJid}
        setSelectedGroupJid={setSelectedGroupJid}
        grupos={grupos}
      />

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{ borderRadius: '14px', padding: '1.25rem', position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, var(--bg-card), ${s.accent})`, border: `1px solid ${s.border}`, boxShadow: `0 0 0 1px ${s.border}` }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${s.color}, transparent)` }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: s.bg, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} style={{ color: s.color }} />
                </div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: '8px', fontVariantNumeric: 'tabular-nums' }}>
                {s.value}
              </div>
              {s.progress !== undefined ? (
                <div>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                    <div style={{ width: `${s.progress}%`, height: '100%', background: s.color, borderRadius: '2px', boxShadow: `0 0 8px ${s.color}`, transition: 'width 0.8s ease' }} />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '5px' }}>{s.progress}% de sucesso</div>
                </div>
              ) : (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{s.sub}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Grid: Disparos & Ciclo / Atividade */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem' }}>
        {/* Card: Próximos Disparos */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.015)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={14} style={{ color: 'var(--primary)' }} />
              </div>
              <h3 style={{ margin: 0, fontSize: '0.95rem' }}>Próximos Disparos de Hoje</h3>
            </div>
            {disparosFiltrados.length > 0 && (
              <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700 }}>
                {disparosFiltrados.length} agendado(s)
              </span>
            )}
          </div>

          <div style={{ padding: '1rem 1.5rem' }}>
            {disparosFiltrados.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {disparosFiltrados.map((d, i) => {
                  const cfg = TIPO_CONFIG[d.tipo] || TIPO_CONFIG.texto;
                  const Icon = cfg.icon;
                  const isLast = i === disparosFiltrados.length - 1;
                  const currentId = `dash-${i}`;
                  return (
                    <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', paddingBottom: isLast ? 0 : '14px', position: 'relative' }}>
                      {!isLast && <div style={{ position: 'absolute', left: '19px', top: '38px', bottom: 0, width: '1px', background: 'var(--border)' }} />}
                      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '10px',
                          background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
                        }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{String(d.horario || '').slice(0,5)}</span>
                        </div>
                      </div>
                      <div style={{
                        flex: 1, minWidth: 0, padding: '8px 12px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{d.grupo}</span>
                            {d.link_convite && (
                              <button
                                onClick={() => handleCopy(d.link_convite, currentId)}
                                style={{ background: 'transparent', border: 'none', color: copiedId === currentId ? '#10b981' : 'var(--primary)', cursor: 'pointer', padding: '2px', display: 'flex', opacity: 0.8 }}
                                title={copiedId === currentId ? 'Copiado!' : 'Copiar Link'}
                              >
                                {copiedId === currentId ? <Check size={12} /> : <Copy size={12} />}
                              </button>
                            )}
                          </div>
                          <span style={{
                            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem',
                            padding: '2px 8px', borderRadius: '10px',
                            background: `rgba(${cfg.color === '#60a5fa' ? '96,165,250' : '255,255,255'}, 0.08)`,
                            color: cfg.color, border: `1px solid ${cfg.color}33`,
                            whiteSpace: 'nowrap', flexShrink: 0,
                            textTransform: 'uppercase', fontWeight: 700
                          }}>
                            <Icon size={10} /> {cfg.label}
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.mensagem}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', margin: '0 auto 12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={22} style={{ color: '#10b981', opacity: 0.6 }} />
                </div>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', margin: 0 }}>Sem disparos agendados para este filtro.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Ciclo & Última Atividade */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Ciclo Atual */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', flex: 1 }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.015)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={14} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 style={{ margin: 0, fontSize: '0.95rem' }}>Ciclo Atual</h3>
            </div>
            <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cicloFiltrado.length > 0 ? cicloFiltrado.map((item, i) => {
                const totalGruposDia = item.grupos.length;
                const estaExpandido = expanderCicloMap[item.dia];
                const gruposExibidos = (totalGruposDia > 8 && !estaExpandido) ? item.grupos.slice(0, 8) : item.grupos;
                const ocultos = totalGruposDia - 8;

                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                    <span style={{ flexShrink: 0, padding: '3px 9px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
                      DIA {item.dia}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{totalGruposDia} grupo(s)</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {gruposExibidos.map((nome, j) => (
                          <span key={j} style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(37,99,235,0.1)', color: 'var(--primary)', borderRadius: '6px', border: '1px solid rgba(37,99,235,0.15)' }}>
                            {nome}
                          </span>
                        ))}
                        {totalGruposDia > 8 && (
                          <button
                            onClick={() => toggleExpandirCiclo(item.dia)}
                            style={{
                              fontSize: '0.7rem',
                              padding: '2px 8px',
                              background: 'rgba(245,158,11,0.12)',
                              color: '#f59e0b',
                              borderRadius: '6px',
                              border: '1px solid rgba(245,158,11,0.25)',
                              cursor: 'pointer',
                              fontWeight: 700
                            }}
                          >
                            {estaExpandido ? 'Ver Menos' : `+${ocultos} outros`}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>Nenhum grupo em ciclo ativo.</div>
              )}
            </div>
          </div>

          {/* Última Atividade */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'linear-gradient(135deg, rgba(37,99,235,0.04), rgba(124,58,237,0.06))', border: '1px solid rgba(37,99,235,0.18)' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(37,99,235,0.12)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <History size={14} style={{ color: 'var(--primary)' }} />
              </div>
              <h3 style={{ margin: 0, fontSize: '0.95rem' }}>Última Atividade</h3>
            </div>
            <div style={{ padding: '1rem 1.25rem' }}>
              {ultimoDisparoFiltrado ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0, background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(37,99,235,0.25))', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)' }}>
                      {ultimoDisparoFiltrado.grupo_nome?.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{ultimoDisparoFiltrado.grupo_nome}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={10} style={{ color: '#10b981' }} />
                        Enviado às {ultimoDisparoFiltrado.criado_em ? new Date(ultimoDisparoFiltrado.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </div>
                    </div>
                  </div>
                  {ultimoDisparoFiltrado.mensagem_corpo && (
                    <div style={{ fontSize: '0.8rem', padding: '8px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '2px solid var(--primary)', color: 'var(--text-dim)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      "{ultimoDisparoFiltrado.mensagem_corpo}"
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>Sem registros recentes.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
