import React from 'react';
import { UserCircle, Trash2, Webhook } from 'lucide-react';

const ContactsTableRow = ({
  contact,
  isSelected,
  onToggleSelect,
  onDelete
}) => {
  return (
    <tr 
      style={{ 
        borderBottom: '1px solid var(--border)', 
        transition: 'background 0.2s', 
        opacity: contact.no_grupo ? 1 : 0.6 
      }} 
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} 
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={() => onToggleSelect && onToggleSelect(contact.id)}
          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
        />
      </td>
      <td style={{ padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            background: contact.no_grupo ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(255,255,255,0.05)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: contact.no_grupo ? 'var(--primary)' : 'var(--text-dim)' 
          }}>
            <UserCircle size={18} />
          </div>
          <div style={{ fontWeight: 600, color: '#fff' }}>{contact.nome || 'Sem Nome'}</div>
        </div>
      </td>
      <td style={{ padding: '1rem' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>{contact.numero}</div>
      </td>
      <td style={{ padding: '1rem', textAlign: 'center' }}>
        {contact.is_admin ? (
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 800,
            background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.5px'
          }}>
            👑 ADMIN
          </div>
        ) : (
          <div style={{ 
            display: 'inline-flex', alignItems: 'center',
            padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 600,
            background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)',
            color: 'var(--text-dim)', textTransform: 'uppercase'
          }}>
            MEMBRO
          </div>
        )}
      </td>
      <td style={{ padding: '1rem' }}>
        <div style={{ fontWeight: 500, fontSize: '0.85rem', color: '#fff' }}>{contact.nome_grupo}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{contact.jid_grupo}</div>
      </td>
      <td style={{ padding: '1rem', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 700,
          background: contact.no_grupo ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: contact.no_grupo ? '#34d399' : '#f87171',
          textTransform: 'uppercase'
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: contact.no_grupo ? '#10b981' : '#ef4444' }}></div>
          {contact.no_grupo ? 'No Grupo' : 'Saiu'}
        </div>
      </td>
      <td style={{ padding: '1rem', textAlign: 'center' }}>
        {contact.webhook_enviado ? (
          <div title={contact.webhook_enviado_em ? `Enviado em: ${new Date(contact.webhook_enviado_em).toLocaleString('pt-BR')}` : 'Enviado com sucesso'} style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 700,
            background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#60a5fa', textTransform: 'uppercase'
          }}>
            <Webhook size={11} />
            ENVIADO
          </div>
        ) : contact.is_admin ? (
          <div title="Admins são ignorados no envio do webhook" style={{ 
            display: 'inline-flex', alignItems: 'center',
            padding: '4px 8px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 600,
            background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)',
            color: 'var(--text-dim)', textTransform: 'uppercase'
          }}>
            IGNORADO (ADMIN)
          </div>
        ) : (
          <div style={{ 
            display: 'inline-flex', alignItems: 'center',
            padding: '4px 8px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 600,
            background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)',
            color: 'var(--text-dim)', textTransform: 'uppercase'
          }}>
            PENDENTE
          </div>
        )}
      </td>
      <td style={{ padding: '1rem', textAlign: 'right' }}>
        <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>
          {contact.extraido_em ? new Date(contact.extraido_em).toLocaleDateString('pt-BR') : '-'}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          {contact.extraido_em ? new Date(contact.extraido_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
        </div>
      </td>
      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
        <button 
          type="button"
          onClick={() => onDelete && onDelete(contact)} 
          className="btn-icon-danger" 
          title="Excluir contato"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
};

export default ContactsTableRow;
