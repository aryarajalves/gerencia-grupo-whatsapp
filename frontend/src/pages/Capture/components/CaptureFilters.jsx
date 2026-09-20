import React from 'react';
import { Search, Users, Filter, CalendarDays } from 'lucide-react';

const CaptureFilters = ({
  searchTerm = '',
  setSearchTerm,
  filtroGrupo = '',
  setFiltroGrupo,
  filtroOrigem = '',
  setFiltroOrigem,
  filtroDataInicio = '',
  setFiltroDataInicio,
  filtroDataFim = '',
  setFiltroDataFim,
  resultsPerPage = 20,
  setResultsPerPage,
  setCurrentPage,
  grupos = [],
  limparFiltros
}) => {
  return (
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
              setSearchTerm && setSearchTerm(e.target.value);
              setCurrentPage && setCurrentPage(1);
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
              setFiltroGrupo && setFiltroGrupo(e.target.value);
              setCurrentPage && setCurrentPage(1);
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

        {/* Dropdown por Origem */}
        <div style={{ width: '220px', position: 'relative' }}>
          <Filter size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none', zIndex: 1 }} />
          <select 
            value={filtroOrigem} 
            onChange={e => {
              setFiltroOrigem && setFiltroOrigem(e.target.value);
              setCurrentPage && setCurrentPage(1);
            }}
            style={{ padding: '0 24px 0 36px', height: '40px', lineHeight: '40px', width: '100%', fontSize: '0.85rem', boxSizing: 'border-box' }}
          >
            <option value="">Todas as Origens</option>
            <option value="sistema">Disparo Automático (Sistema)</option>
            <option value="usuario">Usuário / Lead no Grupo</option>
            <option value="chat">Chat de Grupos</option>
          </select>
        </div>

        {/* Filtro por Período de Data */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarDays size={15} style={{ color: 'var(--text-dim)' }} />
          <input 
            type="date" 
            value={filtroDataInicio} 
            onChange={e => { setFiltroDataInicio && setFiltroDataInicio(e.target.value); setCurrentPage && setCurrentPage(1); }}
            style={{ height: '40px', lineHeight: '40px', padding: '0 10px', fontSize: '0.8rem', boxSizing: 'border-box' }}
          />
          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>até</span>
          <input 
            type="date" 
            value={filtroDataFim} 
            onChange={e => { setFiltroDataFim && setFiltroDataFim(e.target.value); setCurrentPage && setCurrentPage(1); }}
            style={{ height: '40px', lineHeight: '40px', padding: '0 10px', fontSize: '0.8rem', boxSizing: 'border-box' }}
          />
        </div>

        {/* Seletor Exibir por página */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', height: '40px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Exibir:</span>
          <select 
            value={resultsPerPage} 
            onChange={(e) => {
              setResultsPerPage && setResultsPerPage(Number(e.target.value));
              setCurrentPage && setCurrentPage(1);
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
          type="button"
          className="btn btn-secondary" 
          onClick={limparFiltros}
          style={{ height: '40px', fontSize: '0.8rem', padding: '0 14px' }}
        >
          Limpar
        </button>
      </div>
    </div>
  );
};

export default CaptureFilters;
