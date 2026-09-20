import React, { useState } from 'react';
import {
  Users, Send, TrendingUp, MessageSquare,
  Clock, CheckCircle2, History
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../services/api';
import { useWaStatus } from '../contexts/WaStatusContext';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import DashboardWarnings from '../components/Dashboard/DashboardWarnings';
import DashboardCicloAtual from '../components/Dashboard/DashboardCicloAtual';
import DashboardProximosDisparos from '../components/Dashboard/DashboardProximosDisparos';


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
        <DashboardProximosDisparos disparos={disparosFiltrados} />

        {/* Sidebar: Ciclo & Última Atividade */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Ciclo Atual Retrátil por Dia */}
          <DashboardCicloAtual
            grupos_por_dia={cicloFiltrado}
            selectedGroupJid={selectedGroupJid}
            setSelectedGroupJid={setSelectedGroupJid}
            grupos={grupos}
          />

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
