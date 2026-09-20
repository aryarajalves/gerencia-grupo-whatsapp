import React from 'react';
import { Search, CheckCircle2, Trash2, Upload, Download, RefreshCcw } from 'lucide-react';

const ContactsFilters = ({
  search,
  setSearch,
  groupFilter,
  setGroupFilter,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  resultsPerPage,
  setResultsPerPage,
  setCurrentPage,
  groups = [],
  selectedIds = [],
  setSelectedIds,
  totalContacts = 0,
  isSelectingAllFiltered,
  setIsSelectingAllFiltered,
  handleSelectAllFiltered,
  handleDeleteBatch,
  setIsImportModalOpen,
  handleExportCSV,
  exporting = false,
  fetchContacts,
  loading = false,
  contactsCount = 0
}) => {
  return (
    <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Campo de Busca */}
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou número..." 
            style={{ paddingLeft: '38px', height: '42px', width: '100%' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filtro de Grupo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '4px 12px', borderRadius: '10px', border: '1px solid var(--border)', minWidth: '180px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Grupo:</span>
          <select 
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            style={{ 
              background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', 
              fontWeight: 600, cursor: 'pointer', outline: 'none', padding: '4px', width: '100%'
            }}
          >
            <option value="" style={{ background: '#1c1e26' }}>Todos os Grupos</option>
            {groups.map(g => (
              <option key={g.jid_grupo} value={g.jid_grupo} style={{ background: '#1c1e26' }}>{g.nome_grupo}</option>
            ))}
          </select>
        </div>

        {/* Filtro de Cargo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '4px 12px', borderRadius: '10px', border: '1px solid var(--border)', minWidth: '150px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Cargo:</span>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ 
              background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', 
              fontWeight: 600, cursor: 'pointer', outline: 'none', padding: '4px', width: '100%'
            }}
          >
            <option value="all" style={{ background: '#1c1e26' }}>Todos</option>
            <option value="admin" style={{ background: '#1c1e26' }}>👑 Admins</option>
            <option value="member" style={{ background: '#1c1e26' }}>Membros</option>
          </select>
        </div>

        {/* Filtro de Presença / Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '4px 12px', borderRadius: '10px', border: '1px solid var(--border)', minWidth: '160px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Status:</span>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ 
              background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', 
              fontWeight: 600, cursor: 'pointer', outline: 'none', padding: '4px', width: '100%'
            }}
          >
            <option value="all" style={{ background: '#1c1e26' }}>Todos</option>
            <option value="in" style={{ background: '#1c1e26' }}>No Grupo</option>
            <option value="out" style={{ background: '#1c1e26' }}>Saiu do Grupo</option>
          </select>
        </div>
        
        {/* Seletor de Limite por Página */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '4px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
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
            <option value={500} style={{ background: '#1c1e26' }}>500</option>
          </select>
        </div>

        {/* Botão Selecionar Todos */}
        <button 
          type="button"
          className="btn btn-secondary" 
          style={{ 
            height: '42px', 
            gap: '8px', 
            padding: '0 1.25rem',
            background: isSelectingAllFiltered ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isSelectingAllFiltered ? 'rgba(37,99,235,0.4)' : 'var(--border)'}`,
            color: isSelectingAllFiltered ? '#60a5fa' : 'var(--text-main)'
          }}
          onClick={isSelectingAllFiltered ? () => { setSelectedIds([]); setIsSelectingAllFiltered(false); } : handleSelectAllFiltered}
        >
          <CheckCircle2 size={16} style={{ color: isSelectingAllFiltered ? '#60a5fa' : 'var(--primary)' }} />
          {isSelectingAllFiltered ? `Desmarcar Todos (${selectedIds.length})` : `Selecionar Todos (${totalContacts})`}
        </button>

        {/* Botão Excluir Selecionados */}
        {selectedIds.length > 0 && (
          <button 
            type="button"
            className="btn" 
            style={{ height: '42px', gap: '8px', padding: '0 1.25rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
            onClick={handleDeleteBatch}
          >
            <Trash2 size={16} />
            Excluir Selecionados ({selectedIds.length})
          </button>
        )}

        {/* Botão Importar */}
        <button 
          type="button"
          className="btn btn-secondary" 
          style={{ height: '42px', gap: '8px', padding: '0 1.25rem' }}
          onClick={() => setIsImportModalOpen(true)}
        >
          <Upload size={16} />
          Importar Contatos
        </button>

        {/* Botão Exportar CSV */}
        <button 
          type="button"
          className="btn btn-secondary" 
          style={{ height: '42px', gap: '8px', padding: '0 1.25rem' }}
          onClick={handleExportCSV}
          disabled={exporting || contactsCount === 0}
        >
          {exporting ? <RefreshCcw size={16} className="spin" /> : <Download size={16} />}
          Exportar CSV
        </button>

        {/* Botão Recarregar */}
        <button 
          type="button"
          className="btn btn-secondary" 
          style={{ height: '42px', width: '42px', padding: 0, justifyContent: 'center' }}
          onClick={() => fetchContacts()}
          disabled={loading}
          title="Recarregar contatos"
        >
          <RefreshCcw size={16} className={loading ? 'spin' : ''} />
        </button>
      </div>
    </div>
  );
};

export default ContactsFilters;
