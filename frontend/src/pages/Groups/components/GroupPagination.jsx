import React from 'react';

const GroupPagination = ({
  gruposFiltrados = [],
  startIndex = 0,
  itemsPerPage = 20,
  safePage = 1,
  totalPages = 1,
  setCurrentPage
}) => {
  if (gruposFiltrados.length === 0) return null;

  return (
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
          type="button"
          disabled={safePage <= 1}
          onClick={() => setCurrentPage && setCurrentPage(prev => Math.max(prev - 1, 1))}
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
          type="button"
          disabled={safePage >= totalPages}
          onClick={() => setCurrentPage && setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
  );
};

export default GroupPagination;
