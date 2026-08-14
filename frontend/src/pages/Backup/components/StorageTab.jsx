import React from 'react';
import { Database, FileText, RefreshCw, RotateCcw, Download, Trash2 } from 'lucide-react';

const StorageTab = ({
  backups,
  currentBackups,
  loadingList,
  actionFilename,
  itemsPerPage,
  setItemsPerPage,
  currentPage,
  setCurrentPage,
  totalPages,
  indexOfFirstItem,
  indexOfLastItem,
  handleRestore,
  handleDownload,
  handleDelete,
  formatSize,
  formatDate
}) => {
  return (
    <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(15, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.2s ease-in-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={20} style={{ color: '#3b82f6' }} />
          Backups Armazenados no Backblaze S3
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          <span>Exibir por página:</span>
          <select
            value={itemsPerPage}
            onChange={e => setItemsPerPage(Number(e.target.value))}
            style={{
              padding: '5px 10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <option value={20} style={{ background: '#161822' }}>20</option>
            <option value={50} style={{ background: '#161822' }}>50</option>
            <option value={100} style={{ background: '#161822' }}>100</option>
            <option value={200} style={{ background: '#161822' }}>200</option>
          </select>
        </div>
      </div>

      {loadingList ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 10px' }} />
          <p>Carregando backups...</p>
        </div>
      ) : backups.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
          <Database size={32} opacity={0.3} style={{ margin: '0 auto 10px' }} />
          <p>Nenhum backup encontrado no armazenamento.</p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '10px 12px' }}>Nome do Arquivo</th>
                  <th style={{ padding: '10px 12px' }}>Tamanho</th>
                  <th style={{ padding: '10px 12px' }}>Data de Criação</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentBackups.map((b, idx) => (
                  <tr key={b.filename || idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background 0.2s' }} className="hover-bg-glass">
                    <td style={{ padding: '12px', fontWeight: 600, color: '#fff', fontFamily: 'monospace' }}>
                      {b.filename}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-dim)' }}>
                      {formatSize(b.size_bytes)}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-dim)' }}>
                      {formatDate(b.last_modified)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => handleRestore(b.filename)}
                          disabled={actionFilename === b.filename}
                          style={{ padding: '6px 10px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Restaurar este backup"
                        >
                          <RotateCcw size={13} />
                          Restaurar
                        </button>

                        <button
                          onClick={() => handleDownload(b.filename)}
                          disabled={actionFilename === b.filename}
                          style={{ padding: '6px 10px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Baixar arquivo"
                        >
                          <Download size={13} />
                          Baixar
                        </button>

                        <button
                          onClick={() => handleDelete(b.filename)}
                          disabled={actionFilename === b.filename}
                          style={{ padding: '6px 10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Excluir do S3"
                        >
                          <Trash2 size={13} />
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Controles de Paginação no Rodapé */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            <div>
              Exibindo <strong>{indexOfFirstItem + 1}</strong> a <strong>{Math.min(indexOfLastItem, backups.length)}</strong> de <strong>{backups.length}</strong> backups
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '6px 14px',
                  background: currentPage === 1 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: currentPage === 1 ? 'rgba(255, 255, 255, 0.3)' : '#fff',
                  borderRadius: '8px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Anterior
              </button>

              <span style={{ padding: '0 4px', color: '#fff', fontWeight: 600 }}>
                Página {currentPage} de {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '6px 14px',
                  background: currentPage === totalPages ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: currentPage === totalPages ? 'rgba(255, 255, 255, 0.3)' : '#fff',
                  borderRadius: '8px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Próximo
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StorageTab;
