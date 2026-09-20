import React from 'react';
import { Trash2, RefreshCcw } from 'lucide-react';
import CaptureTableRow from './CaptureTableRow';

const CaptureTable = ({
  mensagens = [],
  selectedIds = [],
  total = 0,
  loading = false,
  currentPage = 1,
  totalPages = 1,
  setCurrentPage,
  toggleSelect,
  toggleSelectAll,
  handleDelete,
  handleDeleteSelected
}) => {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Barra de Ações em Lote */}
      {selectedIds.length > 0 && (
        <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(239, 68, 68, 0.1)', borderBottom: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#f87171', fontWeight: 600 }}>{selectedIds.length} captura(s) selecionada(s)</span>
          <button 
            type="button"
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
            {(Array.isArray(mensagens) && mensagens.length > 0) ? (
              mensagens.map(m => (
                <CaptureTableRow
                  key={m.id}
                  m={m}
                  isSelected={selectedIds.includes(m.id)}
                  onToggleSelect={toggleSelect}
                  onDelete={handleDelete}
                />
              ))
            ) : (
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
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Mostrando <strong style={{ color: '#fff' }}>{mensagens.length}</strong> de <strong style={{ color: '#fff' }}>{total}</strong> capturas
          </span>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              type="button"
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage && setCurrentPage(p => p - 1)} 
              className="btn btn-secondary" 
              style={{ height: '32px', fontSize: '0.8rem' }}
            >
              Anterior
            </button>
            <span style={{ fontSize: '0.85rem' }}>Página {currentPage} de {totalPages || 1}</span>
            <button 
              type="button"
              disabled={currentPage >= totalPages} 
              onClick={() => setCurrentPage && setCurrentPage(p => p + 1)} 
              className="btn btn-secondary" 
              style={{ height: '32px', fontSize: '0.8rem' }}
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaptureTable;
