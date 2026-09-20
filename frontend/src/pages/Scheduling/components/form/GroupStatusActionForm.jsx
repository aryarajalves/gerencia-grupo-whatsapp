import React from 'react';
import { Lock, Pencil, MessageSquare } from 'lucide-react';

const GroupStatusActionForm = ({ novaMensagem, setNovaMensagem }) => {
  const isAbrir = novaMensagem.link_midia === 'abrir' || novaMensagem.mensagem === 'abrir';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <label className="label-premium"><Lock size={12} /> Ação de Permissão do Grupo</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '8px' }}>
          <button
            type="button"
            onClick={() => setNovaMensagem({ ...novaMensagem, link_midia: 'fechar' })}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '1.25rem', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s',
              border: '2px solid',
              borderColor: isAbrir ? 'var(--border)' : '#ec4899',
              background: isAbrir ? 'rgba(255,255,255,0.02)' : 'rgba(236,72,153,0.12)',
              color: isAbrir ? 'var(--text-dim)' : '#ec4899',
              boxShadow: isAbrir ? 'none' : '0 0 16px rgba(236,72,153,0.2)'
            }}
          >
            <div style={{ fontSize: '1.5rem' }}>🔒</div>
            <span style={{ fontWeight: 800, fontSize: '1rem' }}>Fechar Grupo</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.8, textAlign: 'center' }}>Apenas administradores podem enviar mensagens</span>
          </button>

          <button
            type="button"
            onClick={() => setNovaMensagem({ ...novaMensagem, link_midia: 'abrir' })}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '1.25rem', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s',
              border: '2px solid',
              borderColor: isAbrir ? '#10b981' : 'var(--border)',
              background: isAbrir ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.02)',
              color: isAbrir ? '#10b981' : 'var(--text-dim)',
              boxShadow: isAbrir ? '0 0 16px rgba(16,185,129,0.2)' : 'none'
            }}
          >
            <div style={{ fontSize: '1.5rem' }}>🔓</div>
            <span style={{ fontWeight: 800, fontSize: '1rem' }}>Abrir Grupo</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.8, textAlign: 'center' }}>Todos os participantes podem enviar mensagens</span>
          </button>
        </div>
      </div>

      <div>
        <label className="label-premium"><Pencil size={12} /> Permissão de Edição das Configurações do Grupo (Nome, Foto, Descrição)</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '8px' }}>
          <button
            type="button"
            onClick={() => setNovaMensagem({ ...novaMensagem, admin_only_settings: true })}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '1rem 0.5rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
              border: '2px solid',
              borderColor: novaMensagem.admin_only_settings === true ? '#3b82f6' : 'var(--border)',
              background: novaMensagem.admin_only_settings === true ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.02)',
              color: novaMensagem.admin_only_settings === true ? '#3b82f6' : 'var(--text-dim)',
              boxShadow: novaMensagem.admin_only_settings === true ? '0 0 12px rgba(59,130,246,0.2)' : 'none'
            }}
          >
            <div style={{ fontSize: '1.2rem' }}>⚙️🔒</div>
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Apenas Admins</span>
            <span style={{ fontSize: '0.7rem', opacity: 0.8, textAlign: 'center' }}>Restringir edição aos admins</span>
          </button>

          <button
            type="button"
            onClick={() => setNovaMensagem({ ...novaMensagem, admin_only_settings: false })}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '1rem 0.5rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
              border: '2px solid',
              borderColor: novaMensagem.admin_only_settings === false ? '#10b981' : 'var(--border)',
              background: novaMensagem.admin_only_settings === false ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.02)',
              color: novaMensagem.admin_only_settings === false ? '#10b981' : 'var(--text-dim)',
              boxShadow: novaMensagem.admin_only_settings === false ? '0 0 12px rgba(16,185,129,0.2)' : 'none'
            }}
          >
            <div style={{ fontSize: '1.2rem' }}>⚙️🔓</div>
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Todos Editam</span>
            <span style={{ fontSize: '0.7rem', opacity: 0.8, textAlign: 'center' }}>Liberar para todos os membros</span>
          </button>

          <button
            type="button"
            onClick={() => setNovaMensagem({ ...novaMensagem, admin_only_settings: null })}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '1rem 0.5rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
              border: '2px solid',
              borderColor: (novaMensagem.admin_only_settings === null || novaMensagem.admin_only_settings === undefined) ? '#a78bfa' : 'var(--border)',
              background: (novaMensagem.admin_only_settings === null || novaMensagem.admin_only_settings === undefined) ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.02)',
              color: (novaMensagem.admin_only_settings === null || novaMensagem.admin_only_settings === undefined) ? '#a78bfa' : 'var(--text-dim)',
              boxShadow: (novaMensagem.admin_only_settings === null || novaMensagem.admin_only_settings === undefined) ? '0 0 12px rgba(167,139,250,0.2)' : 'none'
            }}
          >
            <div style={{ fontSize: '1.2rem' }}>⚙️↔️</div>
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Manter Atual</span>
            <span style={{ fontSize: '0.7rem', opacity: 0.8, textAlign: 'center' }}>Não alterar configuração atual</span>
          </button>
        </div>
      </div>

      <div>
        <label className="label-premium">
          <MessageSquare size={12} /> Mensagem de Texto Junto à Alteração (Opcional)
        </label>
        <textarea 
          value={(novaMensagem.mensagem === 'fechar' || novaMensagem.mensagem === 'abrir') ? '' : (novaMensagem.mensagem || '')} 
          onChange={e => setNovaMensagem({ ...novaMensagem, mensagem: e.target.value, link_midia: novaMensagem.link_midia || (isAbrir ? 'abrir' : 'fechar') })} 
          placeholder="Digite a mensagem a ser enviada no grupo junto com a ação (deixe em branco se não desejar enviar nenhuma mensagem)..." 
          style={{ width: '100%', minHeight: '100px', resize: 'vertical', fontSize: '1rem', lineHeight: '1.5', padding: '1rem' }} 
        />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic', display: 'block', marginTop: '4px' }}>
          * Se deixar este campo em branco, apenas a permissão do grupo será alterada, sem disparar mensagem de texto.
        </span>
      </div>
    </div>
  );
};

export default GroupStatusActionForm;
