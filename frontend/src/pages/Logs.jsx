import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Edit3, Image, Video, Mic, FileText, LayoutGrid, Lock,
  Search, Filter, CalendarDays, Trash2, RefreshCcw, ChevronDown, Clock, 
  CheckCircle2, XCircle, AlertCircle, Info, Send, History as HistoryIcon, Users,
  Ghost, ShieldAlert, AlertTriangle
} from 'lucide-react';
import axiosInstance from '../services/api';
import toast from 'react-hot-toast';

const HistoricoEnvios = ({ openConfirm }) => {
  const TIPO_CONFIG = {
    texto:                { label: 'Texto',               icon: MessageSquare, color: '#60a5fa' },
    nome_grupo:           { label: 'Nome Grupo',         icon: Edit3,          color: '#f97316' },
    status_grupo:         { label: 'Abrir/Fechar',       icon: Lock,           color: '#ec4899' },
    imagem:               { label: 'Imagem',              icon: Image,          color: '#a78bfa' },
    video:                { label: 'Vídeo',               icon: Video,          color: '#f472b6' },
    audio:                { label: 'Áudio',               icon: Mic,            color: '#34d399' },
    arquivo:              { label: 'PDF/Arquivo',         icon: FileText,       color: '#fbbf24' },
    enquete:              { label: 'Enquete',             icon: LayoutGrid,     color: '#22d3ee' },
    extracao_contatos:    { label: 'Extração Contatos',    icon: Users,          color: '#10b981' },
    fantasma_pesca_leads: { label: 'Sentinela Fantasma',  icon: Ghost,          color: '#c084fc' },
    seguranca_adm:        { label: 'Segurança Admins',    icon: ShieldAlert,    color: '#38bdf8' }
  };


  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gruposList, setGruposList] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState(''); // '' | 'disparos' | 'extracao' | 'seguranca' | 'fantasma'
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalSucesso, setTotalSucesso] = useState(0);
  const [totalErro, setTotalErro] = useState(0);

  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const res = await axiosInstance.get('/grupos/');
        setGruposList(res.data || []);
      } catch (err) {
        console.error('Erro ao carregar grupos para filtro:', err);
      }
    };
    fetchGrupos();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        limit: resultsPerPage,
        offset: (currentPage - 1) * resultsPerPage,
        tipo: filtroTipo || undefined,
        status: filtroStatus || undefined,
        grupo: filtroGrupo || undefined,
        data_inicio: filtroDataInicio || undefined,
        data_fim: filtroDataFim || undefined
      };

      const res = await axiosInstance.get('/logs/', { params });
      setLogs(res.data.items);
      setTotalLogs(res.data.total_geral || res.data.total);
      setTotalSucesso(res.data.total_sucesso);
      setTotalErro(res.data.total_erro);
      setSelectedIds(prev => prev.filter(id => res.data.items.some(log => log.id === id)));
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedIds([]);
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    const handleConfigUpdated = () => fetchLogs();
    window.addEventListener('config-updated', handleConfigUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('config-updated', handleConfigUpdated);
    };
  }, [filtroTipo, filtroStatus, filtroDataInicio, filtroDataFim, currentPage, resultsPerPage]); 

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchLogs();
    }, 500);
    return () => clearTimeout(timeout);
  }, [filtroGrupo]);


  const handleDelete = async (id) => {
    openConfirm(
        'Confirmar Exclusão',
        'Tem certeza que deseja excluir este log permanentemente? Esta ação não pode ser desfeita.',
        async () => {
            setProcessingId(id);
            try {
                await axiosInstance.delete(`/logs/${id}`);
                fetchLogs();
                toast.success('Log excluído com sucesso');
            } catch (error) {
                toast.error(error.response?.data?.detail || 'Erro ao excluir log');
            } finally {
                setProcessingId(null);
            }
        }
    );
  };

  const handleRetry = async (id) => {
    setProcessingId(id);
    try {
      await axiosInstance.post(`/logs/${id}/retry`);
      fetchLogs();
      toast.success('Mensagem reenviada com sucesso');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao reenviar mensagem');
    } finally {
      setProcessingId(null);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === logs.length) setSelectedIds([]);
    else setSelectedIds(logs.map(log => log.id));
  };

  const deleteSelected = async () => {
    openConfirm(
        'Excluir Selecionados',
        `Deseja excluir permanentemente os ${selectedIds.length} logs selecionados?`,
        async () => {
            setLoading(true);
            try {
                await Promise.all(selectedIds.map(id => axiosInstance.delete(`/logs/${id}`)));
                setSelectedIds([]);
                fetchLogs();
                toast.success('Logs excluídos com sucesso');
            } catch (error) {
                toast.error('Erro ao excluir alguns logs');
            } finally {
                setLoading(false);
            }
        }
    );
  };

  const totalPages = Math.ceil(totalLogs / resultsPerPage);

  return (
    <div className="fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.15)', border: '1px solid rgba(var(--primary-rgb), 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HistoryIcon size={19} style={{ color: 'var(--primary)' }} />
                    </div>
                    <h1 style={{ margin: 0 }}>Histórico de Envios</h1>
                </div>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginLeft: '52px' }}>Acompanhe o status de todos os disparos realizados.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'right' }}>
                    <div style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>Sucesso</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>{totalSucesso}</div>
                </div>
                <div style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'right' }}>
                    <div style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>Erros</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444' }}>{totalErro}</div>
                </div>
            </div>
        </div>

        {/* Barra de Abas de Categorias do Histórico */}
        <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '1.25rem', 
            overflowX: 'auto', 
            paddingBottom: '4px',
            borderBottom: '1px solid var(--border)'
        }}>
            {[
                { id: '', label: 'Todos os Registros', icon: HistoryIcon, color: 'var(--primary)' },
                { id: 'disparos', label: 'Mensagens & Disparos', icon: Send, color: '#60a5fa' },
                { id: 'extracao', label: 'Extração de Leads', icon: Users, color: '#10b981' },
                { id: 'seguranca', label: 'Segurança de Admins', icon: ShieldAlert, color: '#38bdf8' },
                { id: 'fantasma', label: 'Sentinela Fantasma', icon: Ghost, color: '#c084fc' }
            ].map(tab => {
                const isSelected = filtroTipo === tab.id;
                const TabIcon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                            setFiltroTipo(tab.id);
                            setCurrentPage(1);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 18px',
                            borderRadius: '10px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                            background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                            color: isSelected ? '#fff' : 'var(--text-dim)',
                            border: isSelected ? `1px solid ${tab.color}` : '1px solid var(--border)',
                            boxShadow: isSelected ? `0 0 16px -4px ${tab.color}40` : 'none'
                        }}
                    >
                        <TabIcon size={16} style={{ color: isSelected ? tab.color : 'var(--text-dim)' }} />
                        {tab.label}
                    </button>
                );
            })}
        </div>

        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                    <Users size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
                    <select 
                        style={{ paddingLeft: '38px', height: '42px', width: '100%', cursor: 'pointer' }}
                        value={filtroGrupo}
                        onChange={(e) => {
                            setFiltroGrupo(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">Todos os Grupos</option>
                        {gruposList.map(g => (
                            <option key={g.id || g.nome} value={g.nome} style={{ background: '#1c1e26' }}>
                                {g.nome}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{ width: '180px', position: 'relative' }}>
                    <Filter size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
                    <select 
                        style={{ paddingLeft: '38px', height: '42px', width: '100%' }}
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                    >
                        <option value="">Todos Status</option>
                        <option value="sucesso">Sucesso</option>
                        <option value="alerta">Alerta</option>
                        <option value="ignorado">Ignorado</option>
                        <option value="erro">Erro</option>
                        <option value="falha_definitiva">Falha Definitiva</option>
                        <option value="processando">Processando</option>
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarDays size={16} style={{ color: 'var(--text-dim)' }} />
                    <input 
                        type="date" 
                        style={{ height: '42px', padding: '0 10px' }}
                        value={filtroDataInicio}
                        onChange={(e) => setFiltroDataInicio(e.target.value)}
                    />
                    <span style={{ color: 'var(--text-dim)' }}>até</span>
                    <input 
                        type="date" 
                        style={{ height: '42px', padding: '0 10px' }}
                        value={filtroDataFim}
                        onChange={(e) => setFiltroDataFim(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', height: '42px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Exibir:</span>
                    <select 
                        value={resultsPerPage} 
                        onChange={(e) => {
                            setResultsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        style={{ 
                            background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', 
                            fontWeight: 600, cursor: 'pointer', outline: 'none', padding: '4px'
                        }}
                    >
                        <option value={20} style={{ background: '#1c1e26' }}>20</option>
                        <option value={50} style={{ background: '#1c1e26' }}>50</option>
                        <option value={100} style={{ background: '#1c1e26' }}>100</option>
                        <option value={200} style={{ background: '#1c1e26' }}>200</option>
                    </select>
                </div>
                <button 
                    className="btn btn-secondary" 
                    style={{ height: '42px' }}
                    onClick={() => { setFiltroTipo(''); setFiltroStatus(''); setFiltroGrupo(''); setFiltroDataInicio(''); setFiltroDataFim(''); }}
                >
                    Limpar
                </button>
            </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {selectedIds.length > 0 && (
                <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(239, 68, 68, 0.1)', borderBottom: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#f87171', fontWeight: 600 }}>{selectedIds.length} itens selecionados</span>
                    <button className="btn" style={{ background: 'var(--danger)', height: '32px', fontSize: '0.75rem', padding: '0 12px' }} onClick={deleteSelected}>
                        <Trash2 size={14} /> Excluir Selecionados
                    </button>
                </div>
            )}
            
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', width: '40px' }}>
                                <input type="checkbox" checked={selectedIds.length === logs.length && logs.length > 0} onChange={toggleSelectAll} />
                            </th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Grupo / Destinatário</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Mensagem</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Data / Hora</th>
                            <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length > 0 ? logs.map(log => {
                            const tipoKey = (log.tipo || log.tipo_mensagem || 'texto').toLowerCase();
                            const cfg = TIPO_CONFIG[tipoKey] || TIPO_CONFIG.texto;
                            const Icon = cfg.icon;
                            const statusLower = (log.status || '').toLowerCase();
                            return (
                                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <input type="checkbox" checked={selectedIds.includes(log.id)} onChange={() => toggleSelect(log.id)} />
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ 
                                            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
                                            background: statusLower === 'sucesso' ? 'rgba(16, 185, 129, 0.1)' : 
                                                        statusLower === 'alerta' ? 'rgba(168, 85, 247, 0.15)' :
                                                        statusLower === 'ignorado' ? 'rgba(167, 139, 250, 0.15)' :
                                                        statusLower === 'falha_definitiva' ? 'rgba(245, 158, 11, 0.1)' :
                                                        statusLower === 'erro' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: statusLower === 'sucesso' ? '#34d399' : 
                                                   statusLower === 'alerta' ? '#c084fc' :
                                                   statusLower === 'ignorado' ? '#a78bfa' :
                                                   statusLower === 'falha_definitiva' ? '#fbbf24' :
                                                   statusLower === 'erro' ? '#f87171' : '#fbbf24'
                                        }}>
                                            {statusLower === 'sucesso' ? <CheckCircle2 size={12} /> : 
                                             statusLower === 'alerta' ? <AlertTriangle size={12} /> :
                                             statusLower === 'ignorado' ? <Info size={12} /> :
                                             statusLower === 'falha_definitiva' ? <AlertCircle size={12} /> :
                                             statusLower === 'erro' ? <XCircle size={12} /> : <RefreshCcw size={12} className="spin" />}
                                            {log.status?.toUpperCase()?.replace('_', ' ')}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{log.grupo_nome}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                            <Icon size={10} style={{ color: cfg.color }} /> {cfg.label}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.mensagem_corpo}>
                                            {log.mensagem_corpo || '(Sem conteúdo)'}
                                        </div>
                                        {log.detalhes_erro && (
                                            <div style={{ fontSize: '0.7rem', color: statusLower === 'ignorado' ? '#a78bfa' : '#f87171', marginTop: '4px', fontStyle: 'italic', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.detalhes_erro}>
                                                {log.detalhes_erro}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>{new Date(log.criado_em).toLocaleDateString('pt-BR')}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{new Date(log.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            {(log.status?.toLowerCase() === 'erro' || log.status?.toLowerCase() === 'falha_definitiva') && 
                                             !tipoKey.startsWith('seguranca') && 
                                             tipoKey !== 'extracao_contatos' && 
                                             tipoKey !== 'fantasma_pesca_leads' && (
                                                <button 
                                                    className="btn-action-premium" 
                                                    title="Tentar Novamente"
                                                    style={{ color: 'var(--primary)', background: 'rgba(var(--primary-rgb), 0.05)' }}
                                                    onClick={() => handleRetry(log.id)}
                                                    disabled={processingId === log.id}
                                                >
                                                    {processingId === log.id ? <RefreshCcw size={16} className="spin" /> : <Send size={16} />}
                                                </button>
                                            )}
                                            <button 
                                                className="btn-action-premium" 
                                                style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }}
                                                onClick={() => handleDelete(log.id)}
                                                disabled={processingId === log.id}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                    {loading ? <RefreshCcw size={32} className="spin" style={{ margin: '0 auto' }} /> : 'Nenhum log encontrado para os filtros selecionados.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalLogs > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        Mostrando <strong style={{ color: '#fff' }}>{logs.length}</strong> de <strong style={{ color: '#fff' }}>{totalLogs}</strong> registros
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button className="btn btn-secondary" style={{ height: '32px', fontSize: '0.8rem' }} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Anterior</button>
                        <span style={{ fontSize: '0.85rem' }}>Página {currentPage} de {totalPages || 1}</span>
                        <button className="btn btn-secondary" style={{ height: '32px', fontSize: '0.8rem' }} disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>Próxima</button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default HistoricoEnvios;
