import React, { useState, useEffect } from 'react';
import { 
  Zap, MessageSquare, History, Search, Filter, Trash2, RefreshCcw, 
  ExternalLink, Copy, Check, MessageSquareQuote, CalendarDays, Users, FileText 
} from 'lucide-react';
import axiosInstance, { API_BASE } from '../services/api';
import { useCopy } from '../hooks/useCopy';
import { toastDeletado } from '../utils/toastNotifications';

const CapturaMensagens = ({ openConfirm }) => {
  const [activeTab, setActiveTab] = useState('mensagens'); // 'mensagens' | 'webhook'
  const [mensagens, setMensagens] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [webhookUrl, setWebhookUrl] = useState('');

  const { copiedId, handleCopy } = useCopy();

  const fetchWebhookUrl = async () => {
    try {
      const res = await axiosInstance.get('/captura/webhook-url');
      setWebhookUrl(res.data.url);
    } catch (err) {
      console.error('Erro ao buscar URL do webhook:', err);
    }
  };

  const fetchGrupos = async () => {
    try {
      const res = await axiosInstance.get('/grupos/');
      setGrupos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Erro ao buscar lista de grupos:', err);
      setGrupos([]);
    }
  };

  const fetchMensagens = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/captura/mensagens/', {
        params: {
          limit: resultsPerPage,
          offset: (currentPage - 1) * resultsPerPage,
          search: searchTerm || undefined,
          group_jid: filtroGrupo || undefined,
          data_inicio: filtroDataInicio || undefined,
          data_fim: filtroDataFim || undefined
        }
      });
      setMensagens(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar capturas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhookUrl();
    fetchGrupos();

    const handleConfigUpdated = () => {
      fetchWebhookUrl();
      fetchGrupos();
      fetchMensagens();
    };
    window.addEventListener('config-updated', handleConfigUpdated);

    return () => {
      window.removeEventListener('config-updated', handleConfigUpdated);
    };
  }, []);

  useEffect(() => {
    fetchMensagens();
    const interval = setInterval(fetchMensagens, 15000);
    return () => clearInterval(interval);
  }, [currentPage, searchTerm, filtroGrupo, filtroDataInicio, filtroDataFim, resultsPerPage]);

  const handleDelete = (id) => {
    openConfirm(
      'Excluir Captura',
      'Deseja remover este registro de captura?',
      async () => {
        try {
          await axiosInstance.delete(`/captura/mensagens/${id}`);
          toastDeletado('Mensagem Capturada Excluída', 'A mensagem foi removida do histórico de capturas.');
          fetchMensagens();
        } catch (err) {
          alert('Erro ao excluir');
        }
      }
    );
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === mensagens.length && mensagens.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(mensagens.map(m => m.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    openConfirm(
      'Excluir Selecionados',
      `Deseja remover permanentemente as ${selectedIds.length} capturas selecionadas?`,
      async () => {
        try {
          await Promise.all(selectedIds.map(id => axiosInstance.delete(`/captura/mensagens/${id}`)));
          toastDeletado('Capturas Excluídas', `${selectedIds.length} capturas foram removidas.`);
          setSelectedIds([]);
          fetchMensagens();
        } catch (err) {
          alert('Erro ao excluir algumas capturas');
        }
      }
    );
  };

  const totalPages = Math.ceil(total / resultsPerPage);

  const limparFiltros = () => {
    setSearchTerm('');
    setFiltroGrupo('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setCurrentPage(1);
  };

  return (
    <div className="fade-in">
      {/* Header com Seletor de Abas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(34, 211, 238, 0.15)', border: '1px solid rgba(34, 211, 238, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={19} style={{ color: '#22d3ee' }} />
          </div>
          <div>
            <h1 style={{ margin: 0 }}>Captura de Mensagens</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', margin: 0 }}>Receba, consulte e filtre mensagens registradas nos grupos</p>
          </div>
        </div>

        {/* Abas */}
        <div className="view-switcher" style={{ background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <button 
            className={`view-btn ${activeTab === 'mensagens' ? 'active' : ''}`}
            onClick={() => setActiveTab('mensagens')}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <MessageSquareQuote size={16} /> Mensagens Capturadas
          </button>
          <button 
            className={`view-btn ${activeTab === 'webhook' ? 'active' : ''}`}
            onClick={() => setActiveTab('webhook')}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <ExternalLink size={16} /> Configurar Webhook
          </button>
        </div>
      </div>

      {/* Conteúdo da Aba 2: Webhook URL */}
      {activeTab === 'webhook' && (
        <div className="card fade-in" style={{ padding: '1.75rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.05), transparent)', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(34, 211, 238, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ExternalLink size={18} style={{ color: '#22d3ee' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>Sua URL de Webhook</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Endpoint para recebimento de dados via W-API ou Webhook externo</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
            <input 
              readOnly 
              value={webhookUrl} 
              style={{ flex: 1, background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)', fontFamily: 'monospace', fontSize: '0.9rem', height: '46px', padding: '0 14px' }} 
            />
            <button 
              className="btn btn-primary" 
              onClick={() => handleCopy(webhookUrl, 'webhook')}
              style={{ minWidth: '140px', height: '46px' }}
            >
              {copiedId === 'webhook' ? <><Check size={16} /> Copiado</> : <><Copy size={16} /> Copiar URL</>}
            </button>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Insira esta URL nas configurações de Webhook da sua instância W-API para sincronizar mensagens automaticamente.
          </p>
        </div>
      )}

      {/* Conteúdo da Aba 1: Lista e Filtros */}
      {activeTab === 'mensagens' && (
        <div className="fade-in">
          {/* Card de Filtros */}
          <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              
              {/* Busca por texto */}
              <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none', zIndex: 1 }} />
                <input 
                  type="text" 
                  placeholder="Buscar no conteúdo ou remetente..." 
                  value={searchTerm} 
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ padding: '0 12px 0 36px', height: '40px', lineHeight: '40px', width: '100%', fontSize: '0.85rem', boxSizing: 'border-box' }} 
                />
              </div>

              {/* Dropdown por Nome/JID do Grupo */}
              <div style={{ width: '220px', position: 'relative' }}>
                <Users size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none', zIndex: 1 }} />
                <select 
                  value={filtroGrupo} 
                  onChange={e => {
                    setFiltroGrupo(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ padding: '0 24px 0 36px', height: '40px', lineHeight: '40px', width: '100%', fontSize: '0.85rem', boxSizing: 'border-box' }}
                >
                  <option value="">Todos os Grupos</option>
                  {(Array.isArray(grupos) ? grupos : []).map(g => (
                    <option key={g.id} value={g.id_do_grupo}>
                      {g.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Período de Data */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarDays size={15} style={{ color: 'var(--text-dim)' }} />
                <input 
                  type="date" 
                  value={filtroDataInicio} 
                  onChange={e => { setFiltroDataInicio(e.target.value); setCurrentPage(1); }}
                  style={{ height: '40px', lineHeight: '40px', padding: '0 10px', fontSize: '0.8rem', boxSizing: 'border-box' }}
                />
                <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>até</span>
                <input 
                  type="date" 
                  value={filtroDataFim} 
                  onChange={e => { setFiltroDataFim(e.target.value); setCurrentPage(1); }}
                  style={{ height: '40px', lineHeight: '40px', padding: '0 10px', fontSize: '0.8rem', boxSizing: 'border-box' }}
                />
              </div>

              {/* Seletor Exibir por página */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', height: '40px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Exibir:</span>
                <select 
                  value={resultsPerPage} 
                  onChange={(e) => {
                    setResultsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{ 
                    background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', 
                    fontWeight: 600, cursor: 'pointer', outline: 'none', padding: '2px 4px'
                  }}
                >
                  <option value={20} style={{ background: '#1c1e26' }}>20</option>
                  <option value={50} style={{ background: '#1c1e26' }}>50</option>
                  <option value={100} style={{ background: '#1c1e26' }}>100</option>
                  <option value={200} style={{ background: '#1c1e26' }}>200</option>
                </select>
              </div>

              {/* Botão Limpar */}
              <button 
                className="btn btn-secondary" 
                onClick={limparFiltros}
                style={{ height: '40px', fontSize: '0.8rem', padding: '0 14px' }}
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Tabela de Mensagens */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {selectedIds.length > 0 && (
              <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(239, 68, 68, 0.1)', borderBottom: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#f87171', fontWeight: 600 }}>{selectedIds.length} captura(s) selecionada(s)</span>
                <button 
                  onClick={handleDeleteSelected} 
                  className="btn" 
                  style={{ background: '#ef4444', color: '#fff', padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                >
                  <Trash2 size={15} /> Excluir Selecionados
                </button>
              </div>
            )}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', width: '40px' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.length === mensagens.length && mensagens.length > 0} 
                        onChange={toggleSelectAll} 
                      />
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Origem / Grupo</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Conteúdo</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Data / Hora</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(mensagens) && mensagens.length > 0) ? mensagens.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1rem 1.5rem' }}><input type="checkbox" checked={selectedIds.includes(m.id)} onChange={() => toggleSelect(m.id)} /></td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{m.group_name || 'N/A'}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>ID: {m.group_jid || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {m.media_url && (
                          <div style={{ marginBottom: '6px' }}>
                            {(m.media_type === 'imagem' || m.media_type === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(m.media_url)) ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img 
                                  src={m.media_url.startsWith('http') ? `${API_BASE}/captura/media-proxy?url=${encodeURIComponent(m.media_url)}` : m.media_url} 
                                  alt="Mídia" 
                                  style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)', cursor: 'pointer', flexShrink: 0 }} 
                                  onClick={() => window.open(m.media_url, '_blank')}
                                />
                                <span style={{ fontSize: '0.75rem', color: '#22d3ee', fontWeight: 600, background: 'rgba(34,211,238,0.1)', padding: '2px 8px', borderRadius: '6px' }}>📷 Imagem</span>
                              </div>
                            ) : (m.media_type === 'video' || /\.(mp4|webm|mkv|mov)(\?.*)?$/i.test(m.media_url)) ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <video 
                                  src={m.media_url.startsWith('http') ? `${API_BASE}/captura/media-proxy?url=${encodeURIComponent(m.media_url)}` : m.media_url} 
                                  style={{ width: '70px', height: '44px', borderRadius: '6px', objectFit: 'cover' }} 
                                  controls 
                                />
                                <span style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600, background: 'rgba(167,139,250,0.1)', padding: '2px 8px', borderRadius: '6px' }}>🎬 Vídeo</span>
                              </div>
                            ) : (m.media_type === 'audio' || m.media_type === 'ptt' || /\.(mp3|ogg|wav|aac|m4a)(\?.*)?$/i.test(m.media_url)) ? (
                              <audio 
                                src={m.media_url.startsWith('http') ? `${API_BASE}/captura/media-proxy?url=${encodeURIComponent(m.media_url)}` : m.media_url} 
                                controls 
                                style={{ height: '32px', maxWidth: '220px' }} 
                              />
                            ) : (
                              <a 
                                href={m.media_url.startsWith('http') ? `${API_BASE}/captura/media-proxy?url=${encodeURIComponent(m.media_url)}` : m.media_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--primary)', textDecoration: 'none', background: 'rgba(59,130,246,0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(59,130,246,0.2)' }}
                              >
                                <FileText size={14} /> Ver Anexo / Documento
                              </a>
                            )}
                          </div>
                        )}
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', maxWidth: '420px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.message_content || (m.media_url ? '' : '(Sem conteúdo)')}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>{m.sender_name} ({m.sender_number})</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#fff' }}>
                          {m.timestamp && !isNaN(new Date(m.timestamp).getTime()) ? new Date(m.timestamp).toLocaleDateString('pt-BR') : 'N/A'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          {m.timestamp && !isNaN(new Date(m.timestamp).getTime()) ? new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button onClick={() => handleDelete(m.id)} className="btn-icon-danger" title="Excluir captura"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                        {loading ? <RefreshCcw size={28} className="spin" style={{ margin: '0 auto' }} /> : 'Nenhuma captura encontrada para os filtros selecionados.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {total > 0 && (
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Mostrando <strong style={{ color: '#fff' }}>{mensagens.length}</strong> de <strong style={{ color: '#fff' }}>{total}</strong> capturas</span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn btn-secondary" style={{ height: '32px', fontSize: '0.8rem' }}>Anterior</button>
                  <span style={{ fontSize: '0.85rem' }}>Página {currentPage} de {totalPages || 1}</span>
                  <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="btn btn-secondary" style={{ height: '32px', fontSize: '0.8rem' }}>Próxima</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CapturaMensagens;
