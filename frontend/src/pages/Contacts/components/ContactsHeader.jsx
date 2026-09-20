import React from 'react';
import { Users } from 'lucide-react';

const ContactsHeader = ({ stats = { total_contatos: 0, total_grupos: 0 } }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '12px', 
            background: 'rgba(var(--primary-rgb), 0.15)', 
            border: '1px solid rgba(var(--primary-rgb), 0.3)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Users size={19} style={{ color: 'var(--primary)' }} />
          </div>
          <h1 style={{ margin: 0 }}>Gestão de Contatos</h1>
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginLeft: '52px' }}>
          Visualização e exportação de leads extraídos dos grupos.
        </p>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ 
          padding: '0.75rem 1.25rem', 
          borderRadius: '12px', 
          background: 'rgba(37, 99, 235, 0.08)', 
          border: '1px solid rgba(37, 99, 235, 0.2)', 
          textAlign: 'right' 
        }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>
            Total de Leads
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
            {stats.total_contatos || 0}
          </div>
        </div>
        <div style={{ 
          padding: '0.75rem 1.25rem', 
          borderRadius: '12px', 
          background: 'rgba(139, 92, 246, 0.08)', 
          border: '1px solid rgba(139, 92, 246, 0.2)', 
          textAlign: 'right' 
        }}>
          <div style={{ fontSize: '0.65rem', color: '#8b5cf6', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>
            Grupos Mapeados
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#8b5cf6' }}>
            {stats.total_grupos || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsHeader;
