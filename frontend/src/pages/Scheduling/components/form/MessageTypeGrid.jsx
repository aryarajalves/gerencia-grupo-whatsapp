import React from 'react';
import { Layers } from 'lucide-react';
import { TIPO_CONFIG } from '../../../../utils/constants';

const MessageTypeGrid = ({ selectedType, onChangeType }) => {
  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      <label className="label-premium"><Layers size={12} /> Tipo de Conteúdo</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {Object.entries(TIPO_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const isSelected = selectedType === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChangeType && onChangeType(key)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 5px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '1px solid',
                borderColor: isSelected ? cfg.color : 'var(--border)',
                background: isSelected ? cfg.bg : 'rgba(255,255,255,0.02)',
                color: isSelected ? cfg.color : 'var(--text-dim)'
              }}
            >
              <Icon size={18} />
              <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>{cfg.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MessageTypeGrid;
