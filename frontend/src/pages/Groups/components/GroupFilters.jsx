import React from 'react';
import { Search, Filter, SlidersHorizontal, ChevronDown, Repeat, Users } from 'lucide-react';

const GroupFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  itemsPerPage,
  setItemsPerPage,
  setCurrentPage,
  showAdvancedFilters,
  setShowAdvancedFilters,
  cicloFilter,
  setCicloFilter,
  extracaoFilter,
  setExtracaoFilter,
  totalGrupos,
  countDisparoHoje,
  countAtivos,
  countInativos,
  countAlerta,
  activeAdvancedFiltersCount
}) => {
  return (
    <>
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
              background: statusFilter === 'disparo_hoje'
                ? 'rgba(56, 189, 248, 0.15)'
                : statusFilter === 'alerta' 
                ? 'rgba(239, 68, 68, 0.15)' 
                : statusFilter === 'ativos'
                ? 'rgba(34, 197, 94, 0.15)'
                : statusFilter === 'inativos'
                ? 'rgba(245, 158, 11, 0.15)'
                : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${
                statusFilter === 'disparo_hoje'
                  ? 'rgba(56, 189, 248, 0.4)'
                  : statusFilter === 'alerta' 
                  ? 'rgba(239, 68, 68, 0.4)' 
                  : statusFilter === 'ativos'
                  ? 'rgba(34, 197, 94, 0.4)'
                  : statusFilter === 'inativos'
                  ? 'rgba(245, 158, 11, 0.4)'
                  : 'rgba(255, 255, 255, 0.12)'
              }`,
              borderRadius: '8px',
              color: statusFilter === 'disparo_hoje'
                ? '#38bdf8'
                : statusFilter === 'alerta' 
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
              Todos os Grupos ({totalGrupos})
            </option>
            <option value="disparo_hoje" style={{ background: '#161822', color: '#38bdf8' }}>
              ⚡ Com Disparo Hoje ({countDisparoHoje})
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
          type="button"
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
                type="button"
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
                type="button"
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
                type="button"
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
                type="button"
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
                type="button"
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
                type="button"
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
                type="button"
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
    </>
  );
};

export default GroupFilters;
