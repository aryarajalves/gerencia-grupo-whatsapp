import React from 'react';
import { LayoutGrid } from 'lucide-react';

const MessageGroupSelector = ({
  grupos = [],
  selectedGroupIds = [],
  onToggleGrupo,
  onSelectAll,
  onSelectNone
}) => {
  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      <label className="label-premium" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span><LayoutGrid size={12} /> Grupos Destinatários</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={onSelectAll} style={{ fontSize: '0.65rem', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}>
            TODOS
          </button>
          <button type="button" onClick={onSelectNone} style={{ fontSize: '0.65rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontWeight: 700 }}>
            NENHUM
          </button>
        </div>
      </label>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
        gap: '10px', 
        maxHeight: '120px', 
        overflowY: 'auto', 
        padding: '12px', 
        background: 'rgba(255,255,255,0.02)', 
        borderRadius: '12px',
        border: '1px solid var(--border)'
      }}>
        {grupos.length > 0 ? grupos.map(g => {
          const isSelected = selectedGroupIds.includes(g.id);
          return (
            <label key={g.id} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '8px',
              background: isSelected ? 'rgba(37,99,235,0.1)' : 'transparent',
              border: isSelected ? '1px solid rgba(37,99,235,0.3)' : '1px solid transparent',
              transition: 'all 0.2s'
            }}>
              <input 
                type="checkbox" 
                checked={isSelected} 
                onChange={() => onToggleGrupo && onToggleGrupo(g.id)}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.8rem', color: isSelected ? 'var(--text-main)' : 'var(--text-dim)', fontWeight: isSelected ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {g.nome}
              </span>
            </label>
          );
        }) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)', padding: '10px' }}>
            Nenhum grupo ativo encontrado.
          </div>
        )}
      </div>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '6px', fontStyle: 'italic' }}>
        * A mensagem só será disparada para os grupos selecionados acima. Se nenhum for selecionado, ela não será enviada.
      </p>
    </div>
  );
};

export default MessageGroupSelector;
