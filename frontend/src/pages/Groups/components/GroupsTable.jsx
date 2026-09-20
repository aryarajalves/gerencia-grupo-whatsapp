import React, { useState } from 'react';
import { Users, PlusCircle } from 'lucide-react';
import GroupFilters from './GroupFilters';
import GroupBulkActionBar from './GroupBulkActionBar';
import GroupTableRow from './GroupTableRow';
import GroupPagination from './GroupPagination';

const GroupsTable = ({ 
  grupos = [], 
  editingId = null, 
  copiedId = null, 
  handleCopy, 
  abrirModalMensagens, 
  startEdit, 
  handleToggle, 
  setDeletingId,
  onOpenNewGroupForm,
  extrairContatosAgora,
  openConfirm,
  selectedGroupIds = [],
  toggleSelectGroup,
  toggleSelectAll,
  clearSelection,
  finalizeBulkDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos'); // 'todos' | 'disparo_hoje' | 'ativos' | 'inativos' | 'alerta'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [cicloFilter, setCicloFilter] = useState('todos'); // 'todos' | 'semanal' | 'unico'
  const [extracaoFilter, setExtracaoFilter] = useState('todos'); // 'todos' | 'habilitada' | 'desabilitada'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const getGroupInitials = (name) => name ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() : '?';

  const isDisparoHoje = (g) => Boolean(g.tem_disparo_hoje !== undefined ? g.tem_disparo_hoje : (g.ativo && g.dia_lancamento_atual > 0 && g.total_mensagens > 0));

  const activeAdvancedFiltersCount = (cicloFilter !== 'todos' ? 1 : 0) + (extracaoFilter !== 'todos' ? 1 : 0);

  // Filtrar grupos por texto, status, ciclo e extração
  const gruposFiltrados = grupos.filter(g => {
    const matchesSearch = (g.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (g.id_do_grupo || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (statusFilter === 'disparo_hoje' && !isDisparoHoje(g)) return false;
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

  const countDisparoHoje = grupos.filter(isDisparoHoje).length;
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
            type="button"
            onClick={onOpenNewGroupForm}
            className="btn btn-primary"
            style={{ height: '38px', padding: '0 16px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <PlusCircle size={15} /> Novo Grupo
          </button>
        )}
      </div>

      {/* Barra de Filtros e Busca */}
      <GroupFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        setCurrentPage={setCurrentPage}
        showAdvancedFilters={showAdvancedFilters}
        setShowAdvancedFilters={setShowAdvancedFilters}
        cicloFilter={cicloFilter}
        setCicloFilter={setCicloFilter}
        extracaoFilter={extracaoFilter}
        setExtracaoFilter={setExtracaoFilter}
        totalGrupos={grupos.length}
        countDisparoHoje={countDisparoHoje}
        countAtivos={countAtivos}
        countInativos={countInativos}
        countAlerta={countAlerta}
        activeAdvancedFiltersCount={activeAdvancedFiltersCount}
      />

      {/* Barra de Ações em Massa */}
      <GroupBulkActionBar
        selectedGroupIds={selectedGroupIds}
        gruposFiltrados={gruposFiltrados}
        toggleSelectAll={toggleSelectAll}
        clearSelection={clearSelection}
        openConfirm={openConfirm}
        finalizeBulkDelete={finalizeBulkDelete}
      />

      {/* Conteúdo Principal: Tabela ou Estado Vazio */}
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
                <th style={{ padding: '11px 16px', width: '40px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={gruposPaginados.length > 0 && gruposPaginados.every(g => selectedGroupIds.includes(g.id))}
                    onChange={() => toggleSelectAll && toggleSelectAll(gruposPaginados)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                    title="Selecionar todos os grupos desta página"
                  />
                </th>
                {['Nome / Grupo ID', 'Ciclo', 'Membros', 'Dia Atual', 'Ações'].map((h, i) => (
                  <th key={h} style={{ padding: '11px 20px', textAlign: i === 4 ? 'right' : 'left', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gruposPaginados.map((g, idx) => (
                <GroupTableRow
                  key={g.id}
                  group={g}
                  isSelected={selectedGroupIds.includes(g.id)}
                  isEditing={editingId === g.id}
                  idx={idx}
                  toggleSelectGroup={toggleSelectGroup}
                  extrairContatosAgora={extrairContatosAgora}
                  openConfirm={openConfirm}
                  abrirModalMensagens={abrirModalMensagens}
                  startEdit={startEdit}
                  handleToggle={handleToggle}
                  isDisparoHoje={isDisparoHoje}
                  getGroupInitials={getGroupInitials}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rodapé de Paginação */}
      <GroupPagination
        gruposFiltrados={gruposFiltrados}
        startIndex={startIndex}
        itemsPerPage={itemsPerPage}
        safePage={safePage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default GroupsTable;
