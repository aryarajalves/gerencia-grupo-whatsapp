import React, { useState } from 'react';
import { Users, CalendarDays, Clock, Check, Copy, ListChecks, Pencil, PauseCircle, PlayCircle, Trash2, Repeat, Flag, AlertTriangle, Search, PlusCircle, Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { DIAS_SEMANA } from '../../../utils/constants';

const GroupsTable = ({ 
  grupos, 
  editingId, 
  copiedId, 
  handleCopy, 
  abrirModalMensagens, 
  startEdit, 
  handleToggle, 
  setDeletingId,
  onOpenNewGroupForm,
  extrairContatosAgora,
  openConfirm
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos'); // 'todos' | 'ativos' | 'inativos' | 'alerta'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [cicloFilter, setCicloFilter] = useState('todos'); // 'todos' | 'semanal' | 'unico'
  const [extracaoFilter, setExtracaoFilter] = useState('todos'); // 'todos' | 'habilitada' | 'desabilitada'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const getGroupInitials = (name) => name ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() : '?';

  const activeAdvancedFiltersCount = (cicloFilter !== 'todos' ? 1 : 0) + (extracaoFilter !== 'todos' ? 1 : 0);

  // Filtrar grupos por texto, status, ciclo e extração
  const gruposFiltrados = grupos.filter(g => {
    const matchesSearch = (g.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (g.id_do_grupo || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (statusFilter === 'ativos' && !g.ativo) return false;
    if (statusFilter === 'inativos' && g.ativo) return false;
    if (statusFilter === 'alerta' && (!g.ativo || g.total_mensagens !== 0)) return false;

    if (cicloFilter === 'semanal' && g.tipo_ciclo !== 'semanal') return false;
    if (cicloFilter === 'unico' && g.tipo_ciclo !== 'unico') return false;

    if (extracaoFilter === 'habilitada' && g.extrair_contatos === false) return false;
    if (extracaoFilter === 'desabilitada' && g.extrair_contatos !== false) return false;

    return true;
  });


  const totalPages = Math.ceil(gruposFiltrados.length / itemsPerPage) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const gruposPaginados = gruposFiltrados.slice(startIndex, startIndex + itemsPerPage);

  const countAtivos = grupos.filter(g => g.ativo).length;
  const countInativos = grupos.filter(g => !g.ativo).length;
  const countAlerta = grupos.filter(g => g.ativo && g.total_mensagens === 0).length;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Top Header com Título, Atributos e Ação + Novo Grupo */}
      <div style={{ 
        padding: '1.25rem 1.5rem', 
        borderBottom: '1px solid var(--border)', 
        background: 'rgba(255,255,255,0.015)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Grupos Monitorados</h3>
          <span className="badge-accent">{grupos.length}</span>
        </div>

        {onOpenNewGroupForm && (
          <button 
            onClick={onOpenNewGroupForm}
            className="btn btn-primary"
            style={{ height: '38px', padding: '0 16px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <PlusCircle size={15} /> Novo Grupo
          </button>
        )}
      </div>

      {/* Barra de Filtros e Busca */}
      <div style={{ 
        padding: '1rem 1.5rem', 
        borderBottom: '1px solid var(--border)', 
        background: 'rgba(0,0,0,0.15)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Campo de Pesquisa */}
        <div style={{ position: 'relative', minWidth: '240px', flex: 1, maxWidth: '380px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="premium-field"
            placeholder="Buscar por nome ou JID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', height: '38px', paddingLeft: '34px', fontSize: '0.85rem' }}
          />
        </div>

        {/* Dropdown de Status para Economizar Espaço */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          <Filter size={14} style={{ color: 'var(--primary)' }} />
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '6px 12px',
              background: statusFilter === 'alerta' 
                ? 'rgba(239, 68, 68, 0.15)' 
                : statusFilter === 'ativos'
                ? 'rgba(34, 197, 94, 0.15)'
                : statusFilter === 'inativos'
                ? 'rgba(245, 158, 11, 0.15)'
                : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${
                statusFilter === 'alerta' 
                  ? 'rgba(239, 68, 68, 0.4)' 
                  : statusFilter === 'ativos'
                  ? 'rgba(34, 197, 94, 0.4)'
                  : statusFilter === 'inativos'
                  ? 'rgba(245, 158, 11, 0.4)'
                  : 'rgba(255, 255, 255, 0.12)'
              }`,
              borderRadius: '8px',
              color: statusFilter === 'alerta' 
                ? '#f87171' 
                : statusFilter === 'ativos'
                ? '#4ade80'
                : statusFilter === 'inativos'
                ? '#fbbf24'
                : '#fff',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s'
            }}
          >
            <option value="todos" style={{ background: '#161822', color: '#fff' }}>
              Todos os Grupos ({grupos.length})
            </option>
            <option value="ativos" style={{ background: '#161822', color: '#4ade80' }}>
              Ativos ({countAtivos})
            </option>
            <option value="inativos" style={{ background: '#161822', color: '#fbbf24' }}>
              Pausados ({countInativos})
            </option>
            {countAlerta > 0 && (
              <option value="alerta" style={{ background: '#161822', color: '#f87171' }}>
                Sem Mensagem Ativada ({countAlerta})
              </option>
            )}
          </select>
        </div>


          {/* Seletor Exibir por Página */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-dim)', marginLeft: '8px' }}>
            <span>Exibir:</span>
            <select
              value={itemsPerPage}
              onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              style={{
                padding: '4px 8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              <option value={20} style={{ background: '#161822' }}>20 / pág</option>
              <option value={50} style={{ background: '#161822' }}>50 / pág</option>
              <option value={100} style={{ background: '#161822' }}>100 / pág</option>
              <option value={200} style={{ background: '#161822' }}>200 / pág</option>
            </select>
          </div>

          {/* Botão Filtros Avançados */}
          <button
            onClick={() => setShowAdvancedFilters(prev => !prev)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600,
              background: showAdvancedFilters || activeAdvancedFiltersCount > 0
                ? 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(37,99,235,0.2))'
                : 'rgba(255,255,255,0.04)',
              color: showAdvancedFilters || activeAdvancedFiltersCount > 0 ? '#fff' : 'var(--text-dim)',
              border: `1px solid ${showAdvancedFilters || activeAdvancedFiltersCount > 0 ? 'rgba(124,58,237,0.5)' : 'var(--border)'}`,
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: activeAdvancedFiltersCount > 0 ? '0 0 12px rgba(124,58,237,0.25)' : 'none'
            }}
          >
            <SlidersHorizontal size={14} style={{ color: activeAdvancedFiltersCount > 0 ? '#a855f7' : 'inherit' }} />
            <span>Filtros Avançados</span>
            {activeAdvancedFiltersCount > 0 && (
              <span style={{
                background: '#a855f7', color: '#fff', fontSize: '0.7rem',
                borderRadius: '10px', padding: '1px 6px', fontWeight: 700
              }}>
                {activeAdvancedFiltersCount}
              </span>
            )}
            <ChevronDown size={14} style={{ transform: showAdvancedFilters ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </button>
        </div>

      {/* Painel Expandível de Filtros Avançados */}

      {showAdvancedFilters && (
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'rgba(18, 20, 32, 0.95)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '2.5rem',
          flexWrap: 'wrap',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          {/* Filtro: Tipo de Ciclo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Repeat size={13} style={{ color: 'var(--primary)' }} /> Tipo de Ciclo
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => { setCicloFilter('todos'); setCurrentPage(1); }}
                style={{
                  padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  background: cicloFilter === 'todos' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)',
                  color: cicloFilter === 'todos' ? '#fff' : 'var(--text-dim)',
                  border: `1px solid ${cicloFilter === 'todos' ? 'rgba(255,255,255,0.2)' : 'var(--border)'}`
                }}
              >
                Todos
              </button>
              <button
                onClick={() => { setCicloFilter('semanal'); setCurrentPage(1); }}
                style={{
                  padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  background: cicloFilter === 'semanal' ? 'rgba(37,99,235,0.25)' : 'rgba(0,0,0,0.2)',
                  color: cicloFilter === 'semanal' ? '#60a5fa' : 'var(--text-dim)',
                  border: `1px solid ${cicloFilter === 'semanal' ? 'rgba(37,99,235,0.5)' : 'var(--border)'}`
                }}
              >
                🔁 Semanal
              </button>
              <button
                onClick={() => { setCicloFilter('unico'); setCurrentPage(1); }}
                style={{
                  padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  background: cicloFilter === 'unico' ? 'rgba(245,158,11,0.25)' : 'rgba(0,0,0,0.2)',
                  color: cicloFilter === 'unico' ? '#fbbf24' : 'var(--text-dim)',
                  border: `1px solid ${cicloFilter === 'unico' ? 'rgba(245,158,11,0.5)' : 'var(--border)'}`
                }}
              >
                🚩 Único
              </button>
            </div>
          </div>

          {/* Filtro: Extração de Contatos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={13} style={{ color: 'var(--accent)' }} /> Extração de Contatos
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => { setExtracaoFilter('todos'); setCurrentPage(1); }}
                style={{
                  padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  background: extracaoFilter === 'todos' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)',
                  color: extracaoFilter === 'todos' ? '#fff' : 'var(--text-dim)',
                  border: `1px solid ${extracaoFilter === 'todos' ? 'rgba(255,255,255,0.2)' : 'var(--border)'}`
                }}
              >
                Todos
              </button>
              <button
                onClick={() => { setExtracaoFilter('habilitada'); setCurrentPage(1); }}
                style={{
                  padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  background: extracaoFilter === 'habilitada' ? 'rgba(34,197,94,0.2)' : 'rgba(0,0,0,0.2)',
                  color: extracaoFilter === 'habilitada' ? '#4ade80' : 'var(--text-dim)',
                  border: `1px solid ${extracaoFilter === 'habilitada' ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`
                }}
              >
                Habilitada
              </button>
              <button
                onClick={() => { setExtracaoFilter('desabilitada'); setCurrentPage(1); }}
                style={{
                  padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  background: extracaoFilter === 'desabilitada' ? 'rgba(239,68,68,0.2)' : 'rgba(0,0,0,0.2)',
                  color: extracaoFilter === 'desabilitada' ? '#f87171' : 'var(--text-dim)',
                  border: `1px solid ${extracaoFilter === 'desabilitada' ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`
                }}
              >
                Desabilitada
              </button>
            </div>
          </div>

          {/* Botão Limpar Filtros Avançados */}
          {activeAdvancedFiltersCount > 0 && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'flex-end', height: '100%' }}>
              <button
                onClick={() => {
                  setCicloFilter('todos');
                  setExtracaoFilter('todos');
                  setCurrentPage(1);
                }}
                style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600,
                  background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)',
                  cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                Limpar Filtros ({activeAdvancedFiltersCount})
              </button>
            </div>
          )}
        </div>
      )}


      {gruposFiltrados.length === 0 ? (
        <div style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', margin: '0 auto 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} style={{ color: 'var(--text-dim)', opacity: 0.4 }} />
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', margin: 0 }}>
            {searchTerm || statusFilter !== 'todos' ? 'Nenhum grupo encontrado com os filtros aplicados.' : 'Nenhum grupo cadastrado.'}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['Nome / Grupo ID', 'Ciclo', 'Membros', 'Dia Atual', 'Ações'].map((h, i) => (
                  <th key={h} style={{ padding: '11px 20px', textAlign: i === 4 ? 'right' : 'left', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gruposPaginados.map((g, idx) => (
                <tr key={g.id} style={{ borderBottom: '1px solid var(--border)', opacity: g.ativo ? 1 : 0.45, background: editingId === g.id ? 'rgba(37,99,235,0.05)' : idx % 2 !== 0 ? 'rgba(255,255,255,0.012)' : 'transparent' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(37,99,235,0.25))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)' }}>{getGroupInitials(g.nome)}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {g.nome}
                          {editingId === g.id && <span className="badge-warning">Editando</span>}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {g.id_do_grupo}
                          {g.link_convite ? (
                            <span title="Link configurado" style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <Check size={10} /> Link OK
                            </span>
                          ) : (
                            <span title="Sem link" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              (!) Sem Link
                            </span>
                          )}
                        </div>
                        {g.ativo && g.total_mensagens === 0 && (
                          <div style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '4px', 
                            marginTop: '6px', 
                            fontSize: '0.65rem', 
                            fontWeight: 700, 
                            color: '#f87171', 
                            background: 'rgba(248,113,113,0.1)', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            border: '1px solid rgba(248,113,113,0.2)'
                          }}>
                            <AlertTriangle size={10} /> SEM CONTEÚDO (NADA SERÁ DISPARADO)
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem' }}>
                        <CalendarDays size={13} style={{ color: 'var(--text-dim)' }} />
                        <span>{DIAS_SEMANA[g.dia_inicio_semana]} → {DIAS_SEMANA[g.dia_fim_semana]}</span>
                      </div>
                      {g.tipo_ciclo === 'unico' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 600, color: '#f59e0b', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '6px', padding: '2px 7px', width: 'fit-content' }}>
                          <Flag size={10} /> Único
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary)', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '6px', padding: '2px 7px', width: 'fit-content' }}>
                          <Repeat size={10} /> Semanal
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--accent)', fontWeight: 600 }}>
                      <Users size={13} />
                      <span>{g.quantidade_contatos || 0}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    {g.dia_lancamento_atual > 0 ? (
                      <span className="badge-success">DIA {g.dia_lancamento_atual.toString().padStart(2,'0')}</span>
                    ) : (
                      <span className="badge-dim"><Clock size={12} /> Aguardando</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                      {extrairContatosAgora && (
                        <button 
                          onClick={() => {
                            if (typeof openConfirm === 'function') {
                              openConfirm({
                                title: 'Extrair Contatos Manualmente',
                                message: `Deseja iniciar a busca e sincronização manual de contatos para o grupo "${g.nome}"? Os contatos encontrados serão salvos e despachados via webhook.`,
                                type: 'info',
                                confirmText: 'Extrair Agora',
                                onConfirm: () => extrairContatosAgora(g.id, g.nome)
                              });
                            } else {
                              extrairContatosAgora(g.id, g.nome);
                            }

                          }} 
                          disabled={!!editingId} 
                          className="btn-icon-accent" 
                          title="Extrair Contatos Agora"
                        >
                          <Users size={14} />
                        </button>
                      )}
                      <button onClick={() => abrirModalMensagens(g)} disabled={!!editingId} className="btn-icon-secondary" title="Vincular Mensagens"><ListChecks size={14} /></button>
                      <button onClick={() => startEdit(g)} disabled={!!editingId} className="btn-icon-secondary" title="Editar Grupo"><Pencil size={14} /></button>
                      <button onClick={() => handleToggle(g.id)} disabled={!!editingId} className="btn-icon-warning" title={g.ativo ? "Pausar" : "Ativar"}>{g.ativo ? <PauseCircle size={14} /> : <PlayCircle size={14} />}</button>
                      <button onClick={() => setDeletingId(g.id)} disabled={!!editingId} className="btn-icon-danger" title="Excluir"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rodapé de Paginação */}
      {gruposFiltrados.length > 0 && (
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border)',
          background: 'rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.8rem',
          color: 'var(--text-dim)'
        }}>
          <div>
            Exibindo <strong style={{ color: '#fff' }}>{Math.min(startIndex + 1, gruposFiltrados.length)}</strong> a <strong style={{ color: '#fff' }}>{Math.min(startIndex + itemsPerPage, gruposFiltrados.length)}</strong> de <strong style={{ color: '#fff' }}>{gruposFiltrados.length}</strong> grupos
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="btn btn-secondary"
              style={{
                padding: '4px 12px',
                height: '32px',
                fontSize: '0.78rem',
                borderRadius: '8px',
                opacity: safePage <= 1 ? 0.4 : 1,
                cursor: safePage <= 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Anterior
            </button>

            <span style={{ fontSize: '0.8rem', padding: '0 4px', color: '#fff', fontWeight: 600 }}>
              Página {safePage} de {totalPages}
            </span>

            <button
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="btn btn-secondary"
              style={{
                padding: '4px 12px',
                height: '32px',
                fontSize: '0.78rem',
                borderRadius: '8px',
                opacity: safePage >= totalPages ? 0.4 : 1,
                cursor: safePage >= totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsTable;

