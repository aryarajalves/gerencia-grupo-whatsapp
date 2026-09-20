import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MessagesPagination = ({
  pageSize = 20,
  setPageSize,
  totalItems = 0,
  currentPage = 1,
  totalPages = 1,
  setCurrentPage
}) => {
  if (totalItems === 0) return null;

  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
      marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)',
      flexWrap: 'wrap', gap: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
        <span>Mostrar</span>
        <select
          value={pageSize}
          onChange={e => setPageSize && setPageSize(Number(e.target.value))}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
            color: 'var(--text-main)', padding: '4px 10px', borderRadius: '8px',
            fontSize: '0.85rem', cursor: 'pointer'
          }}
        >
          <option value={20}>20 por página</option>
          <option value={50}>50 por página</option>
          <option value={100}>100 por página</option>
          <option value={200}>200 por página</option>
        </select>
        <span>de {totalItems} mensagens</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={() => setCurrentPage && setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="btn btn-secondary"
          style={{
            padding: '6px 12px', height: '34px', fontSize: '0.8rem', display: 'flex',
            alignItems: 'center', gap: '4px', opacity: currentPage === 1 ? 0.4 : 1,
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          <ChevronLeft size={16} /> Anterior
        </button>

        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', padding: '0 8px' }}>
          Página {currentPage} de {totalPages}
        </span>

        <button
          type="button"
          onClick={() => setCurrentPage && setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage >= totalPages}
          className="btn btn-secondary"
          style={{
            padding: '6px 12px', height: '34px', fontSize: '0.8rem', display: 'flex',
            alignItems: 'center', gap: '4px', opacity: currentPage >= totalPages ? 0.4 : 1,
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
          }}
        >
          Próximo <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default MessagesPagination;
