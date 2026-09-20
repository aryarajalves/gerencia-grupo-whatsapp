import React from 'react';
import { RefreshCcw } from 'lucide-react';
import ContactsTableRow from './ContactsTableRow';

const ContactsTable = ({
  contacts = [],
  selectedIds = [],
  loading = false,
  totalContacts = 0,
  currentPage = 1,
  totalPages = 1,
  setCurrentPage,
  toggleSelect,
  toggleSelectPage,
  handleDeleteSingle
}) => {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'center', width: '40px' }}>
                <input 
                  type="checkbox" 
                  checked={contacts.length > 0 && contacts.every(c => selectedIds.includes(c.id))}
                  onChange={toggleSelectPage}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
              </th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Contato</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Número / ID</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Cargo</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Grupo de Origem</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Presença</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>ZapVoice (Webhook)</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Extraído em</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length > 0 ? (
              contacts.map(contact => (
                <ContactsTableRow
                  key={contact.id}
                  contact={contact}
                  isSelected={selectedIds.includes(contact.id)}
                  onToggleSelect={toggleSelect}
                  onDelete={handleDeleteSingle}
                />
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                  {loading ? <RefreshCcw size={32} className="spin" style={{ margin: '0 auto' }} /> : 'Nenhum contato encontrado.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          Mostrando <strong style={{ color: '#fff' }}>{contacts.length}</strong> de <strong style={{ color: '#fff' }}>{totalContacts}</strong> leads
        </div>
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              type="button"
              className="btn btn-secondary" 
              style={{ height: '32px', fontSize: '0.8rem' }} 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Anterior
            </button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              Página <strong style={{ color: '#fff' }}>{currentPage}</strong> de {totalPages}
            </span>
            <button 
              type="button"
              className="btn btn-secondary" 
              style={{ height: '32px', fontSize: '0.8rem' }} 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsTable;
