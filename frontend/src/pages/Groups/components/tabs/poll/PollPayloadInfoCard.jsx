import React from 'react';
import { Info, CheckCircle2 } from 'lucide-react';

const PollPayloadInfoCard = () => {
  return (
    <div style={{
      background: 'rgba(236, 72, 153, 0.05)',
      border: '1px solid rgba(236, 72, 153, 0.18)',
      borderRadius: '10px',
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Info size={16} style={{ color: '#ec4899', flexShrink: 0 }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ec4899' }}>
          Quais dados são enviados para o seu Webhook?
        </span>
      </div>
      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: '1.5' }}>
        Toda vez que um participante marcar ou alterar o voto em uma enquete do grupo, o sistema enviará um payload JSON contendo:
      </p>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '8px', 
        marginTop: '4px' 
      }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={13} style={{ color: '#22c55e' }} /> <strong>Conteúdo & Pergunta</strong>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={13} style={{ color: '#22c55e' }} /> <strong>Opção Selecionada</strong>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={13} style={{ color: '#22c55e' }} /> <strong>Nome do Usuário</strong>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={13} style={{ color: '#22c55e' }} /> <strong>Número de WhatsApp</strong>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={13} style={{ color: '#22c55e' }} /> <strong>ID & Nome do Grupo</strong>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={13} style={{ color: '#22c55e' }} /> <strong>Data & Horário (Brasília)</strong>
        </div>
      </div>
    </div>
  );
};

export default PollPayloadInfoCard;
