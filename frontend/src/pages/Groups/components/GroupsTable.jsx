import React, { useState } from 'react';
import { Users, CalendarDays, Clock, Check, Copy, ListChecks, Pencil, PauseCircle, PlayCircle, Trash2, Repeat, Flag, AlertTriangle, Search, PlusCircle, Filter } from 'lucide-react';
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
  extrairContatosAgora
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos'); // 'todos' | 'ativos' | 'inativos' | 'alerta'

  const getGroupInitials = (name) => name ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() : '?';

  // Filtrar grupos por texto e status
  const gruposFiltrados = grupos.filter(g => {
    const matchesSearch = (g.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (g.id_do_grupo || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (statusFilter === 'ativos') return g.ativo;
    if (statusFilter === 'inativos') return !g.ativo;
    if (statusFilter === 'alerta') return g.ativo && g.total_mensagens === 0;
    return true;
  });

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

        {/* Chips de Status */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setStatusFilter('todos')}
            style={{
              padding: '5px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
              background: statusFilter === 'todos' ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.03)',
              color: statusFilter === 'todos' ? 'var(--primary)' : 'var(--text-dim)',
              border: `1px solid ${statusFilter === 'todos' ? 'rgba(37,99,235,0.4)' : 'var(--border)'}`,
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Todos ({grupos.length})
          </button>
          <button
            onClick={() => setStatusFilter('ativos')}
            style={{
              padding: '5px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
              background: statusFilter === 'ativos' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)',
              color: statusFilter === 'ativos' ? 'var(--success)' : 'var(--text-dim)',
              border: `1px solid ${statusFilter === 'ativos' ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Ativos ({countAtivos})
          </button>
          <button
            onClick={() => setStatusFilter('inativos')}
            style={{
              padding: '5px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
              background: statusFilter === 'inativos' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
              color: statusFilter === 'inativos' ? '#f59e0b' : 'var(--text-dim)',
              border: `1px solid ${statusFilter === 'inativos' ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`,
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Pausados ({countInativos})
          </button>
          {countAlerta > 0 && (
            <button
              onClick={() => setStatusFilter('alerta')}
              style={{
                padding: '5px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
                background: statusFilter === 'alerta' ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.08)',
                color: '#f87171',
                border: `1px solid ${statusFilter === 'alerta' ? 'rgba(239,68,68,0.5)' : 'rgba(239,68,68,0.2)'}`,
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              Sem Conteúdo ({countAlerta})
            </button>
          )}
        </div>
      </div>

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
              {gruposFiltrados.map((g, idx) => (
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
                        <button onClick={() => extrairContatosAgora(g.id)} disabled={!!editingId} className="btn-icon-accent" title="Extrair Contatos Agora"><Users size={14} /></button>
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
    </div>
  );
};

export default GroupsTable;
