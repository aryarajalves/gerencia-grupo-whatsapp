import React from 'react';
import { Trash2 } from 'lucide-react';

const GroupBulkActionBar = ({
  selectedGroupIds = [],
  gruposFiltrados = [],
  toggleSelectAll,
  clearSelection,
  openConfirm,
  finalizeBulkDelete
}) => {
  if (selectedGroupIds.length === 0) return null;

  return (
    <div style={{
      padding: '0.85rem 1.5rem',
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))',
      borderBottom: '1px solid rgba(59, 130, 246, 0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      flexWrap: 'wrap',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ 
          background: 'var(--primary)', 
          color: '#fff', 
          fontSize: '0.8rem', 
          fontWeight: 800, 
          padding: '3px 10px', 
          borderRadius: '12px' 
        }}>
          {selectedGroupIds.length} Selecionado(s)
        </span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
          Ações em Massa Disponíveis:
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => toggleSelectAll && toggleSelectAll(gruposFiltrados)}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: 600,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Selecionar Todos os {gruposFiltrados.length} Filtrados
        </button>

        <button
          type="button"
          onClick={() => clearSelection && clearSelection()}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: 600,
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'var(--text-dim)',
            cursor: 'pointer'
          }}
        >
          Limpar Seleção
        </button>

        <button
          type="button"
          onClick={() => {
            if (typeof openConfirm === 'function') {
              openConfirm({
                title: 'Confirmar Exclusão em Massa',
                message: `Tem certeza que deseja excluir permanentemente os ${selectedGroupIds.length} grupo(s) selecionado(s)? Esta ação removerá o monitoramento e o histórico de todos eles.`,
                type: 'danger',
                confirmText: `Excluir ${selectedGroupIds.length} Grupos`,
                onConfirm: () => finalizeBulkDelete && finalizeBulkDelete()
              });
            }
          }}
          style={{
            padding: '7px 16px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(185, 28, 28, 0.9))',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
          }}
        >
          <Trash2 size={14} /> Excluir Selecionados ({selectedGroupIds.length})
        </button>
      </div>
    </div>
  );
};

export default GroupBulkActionBar;
