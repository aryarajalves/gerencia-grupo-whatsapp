import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const ContactsSelectionBanner = ({
  selectedCount = 0,
  totalContacts = 0,
  onSelectAll
}) => {
  if (selectedCount === 0) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 18px',
      borderRadius: '12px',
      marginBottom: '1rem',
      background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))',
      border: '1px solid rgba(37,99,235,0.3)',
      fontSize: '0.88rem',
      color: '#fff'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <CheckCircle2 size={18} style={{ color: '#60a5fa' }} />
        <span>
          Você possui <strong>{selectedCount}</strong> contato(s) selecionado(s) 
          {selectedCount >= totalContacts && totalContacts > 0 ? ' (TODOS os contatos da base/filtro) ' : ` nesta lista.`}
        </span>
      </div>
      {selectedCount < totalContacts && onSelectAll && (
        <button
          type="button"
          onClick={onSelectAll}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            padding: '5px 12px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Selecionar TODOS os {totalContacts} contatos da base
        </button>
      )}
    </div>
  );
};

export default ContactsSelectionBanner;
