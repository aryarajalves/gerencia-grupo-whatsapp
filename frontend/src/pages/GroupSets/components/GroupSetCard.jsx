import React from 'react';
import { Edit2, Trash2, ExternalLink, CheckCircle2, ChevronRight } from 'lucide-react';

const GroupSetCard = ({
  set,
  getRedirectLink,
  copyToClipboard,
  onEdit,
  onDelete
}) => {
  const redirectUrl = getRedirectLink ? getRedirectLink(set.slug) : '';
  const gruposOrdenados = [...(set.grupos || [])].sort((a, b) => a.posicao - b.posicao);

  return (
    <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>{set.nome}</h3>
          <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, textTransform: 'uppercase', background: set.ativo ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: set.ativo ? '#34d399' : '#f87171' }}>
            {set.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            type="button"
            className="btn-action-premium" 
            onClick={() => onEdit && onEdit(set)} 
            style={{ color: 'var(--primary)', background: 'rgba(var(--primary-rgb), 0.05)', padding: '8px', borderRadius: '10px' }}
            title="Editar conjunto"
          >
            <Edit2 size={18} />
          </button>
          <button 
            type="button"
            className="btn-action-premium" 
            onClick={() => onDelete && onDelete(set.id)} 
            style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)', padding: '8px', borderRadius: '10px' }}
            title="Excluir conjunto"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Link Universal:</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <code style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#3b82f6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {redirectUrl}
          </code>
          <button 
            type="button"
            onClick={() => copyToClipboard && copyToClipboard(redirectUrl)} 
            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-dim)', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}
            title="Copiar link"
          >
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '1rem' }}>Fluxo de Redirecionamento:</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {gruposOrdenados.length > 0 ? gruposOrdenados.map((g) => {
            const isFull = g.quantidade_contatos >= g.max_leads;
            return (
              <div key={g.id || g.grupo_id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', opacity: isFull ? 0.5 : 1 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: isFull ? 'rgba(255,255,255,0.1)' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>
                  {g.posicao}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{g.grupo_nome}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{g.quantidade_contatos} / {g.max_leads} leads</div>
                </div>
                {isFull ? <CheckCircle2 size={16} style={{ color: '#10b981' }} /> : <ChevronRight size={16} style={{ color: '#3b82f6' }} />}
              </div>
            );
          }) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>Nenhum grupo associado.</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupSetCard;
