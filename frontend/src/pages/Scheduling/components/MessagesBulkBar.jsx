import React from 'react';
import { CheckSquare, Square, Copy, Users, Trash } from 'lucide-react';

const MessagesBulkBar = ({
  selectedIds = [],
  sortedMessages = [],
  isAllFilteredSelected = false,
  handleSelectAll,
  onOpenDuplicateModal,
  onOpenGroupModal,
  onExecuteBulkDelete
}) => {
  if (selectedIds.length === 0) return null;

  return (
    <div style={{
      marginBottom: '1.25rem',
      padding: '0.85rem 1.25rem',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(124, 58, 237, 0.15))',
      border: '1px solid rgba(124, 58, 237, 0.4)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3), 0 0 15px rgba(124, 58, 237, 0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          onClick={handleSelectAll}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.82rem',
            fontWeight: 600, cursor: 'pointer'
          }}
        >
          {isAllFilteredSelected ? <CheckSquare size={16} style={{ color: '#a78bfa' }} /> : <Square size={16} />}
          <span>{isAllFilteredSelected ? 'Desmarcar Todas' : `Selecionar Todas (${sortedMessages.length})`}</span>
        </button>
        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
          <span style={{ background: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.78rem', marginRight: '6px' }}>
            {selectedIds.length}
          </span>
          mensagem(ns) selecionada(s)
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          onClick={onOpenDuplicateModal}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
            cursor: 'pointer', background: 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(59,130,246,0.3))',
            color: '#60a5fa', border: '1px solid rgba(96, 165, 250, 0.4)'
          }}
        >
          <Copy size={15} />
          <span>Duplicar Selecionadas ({selectedIds.length})</span>
        </button>

        <button
          type="button"
          onClick={onOpenGroupModal}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
            cursor: 'pointer', background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(37,99,235,0.3))',
            color: '#a78bfa', border: '1px solid rgba(167, 139, 250, 0.4)'
          }}
        >
          <Users size={15} />
          <span>Atribuir Grupos</span>
        </button>

        <button
          type="button"
          onClick={onExecuteBulkDelete}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
            cursor: 'pointer', background: 'rgba(239, 68, 68, 0.2)',
            color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)'
          }}
        >
          <Trash size={15} />
          <span>Excluir Selecionadas ({selectedIds.length})</span>
        </button>
      </div>
    </div>
  );
};

export default MessagesBulkBar;
