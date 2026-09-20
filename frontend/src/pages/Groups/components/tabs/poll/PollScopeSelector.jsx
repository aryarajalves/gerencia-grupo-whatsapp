import React from 'react';
import { Sparkles } from 'lucide-react';

const PollScopeSelector = ({ modo = 'todas', onChange }) => {
  const isModoSelecionadas = modo === 'selecionadas';

  return (
    <div style={{ marginBottom: '14px' }}>
      <label className="label-premium" style={{ marginBottom: '6px' }}>
        <Sparkles size={12} style={{ color: '#ec4899' }} /> Quais enquetes devem disparar este Webhook?
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <label style={{
          display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer',
          padding: '10px 12px', borderRadius: '8px',
          border: `1px solid ${!isModoSelecionadas ? 'rgba(236, 72, 153, 0.5)' : 'var(--border)'}`,
          background: !isModoSelecionadas ? 'rgba(236, 72, 153, 0.06)' : 'transparent',
          transition: 'all 0.2s'
        }}>
          <input
            type="radio"
            name="webhook_enquete_modo"
            value="todas"
            checked={!isModoSelecionadas}
            onChange={() => onChange && onChange('todas')}
            style={{ accentColor: '#ec4899', marginTop: '2px' }}
          />
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: !isModoSelecionadas ? '#ec4899' : 'var(--text)' }}>
              Todas as Enquetes do Grupo
            </div>
            <div style={{ fontSize: '0.70rem', color: 'var(--text-dim)', marginTop: '2px', lineHeight: 1.3 }}>
              Dispara para qualquer enquete realizada no grupo (enquetes manuais no WhatsApp ou automáticas).
            </div>
          </div>
        </label>

        <label style={{
          display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer',
          padding: '10px 12px', borderRadius: '8px',
          border: `1px solid ${isModoSelecionadas ? 'rgba(236, 72, 153, 0.5)' : 'var(--border)'}`,
          background: isModoSelecionadas ? 'rgba(236, 72, 153, 0.06)' : 'transparent',
          transition: 'all 0.2s'
        }}>
          <input
            type="radio"
            name="webhook_enquete_modo"
            value="selecionadas"
            checked={isModoSelecionadas}
            onChange={() => onChange && onChange('selecionadas')}
            style={{ accentColor: '#ec4899', marginTop: '2px' }}
          />
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: isModoSelecionadas ? '#ec4899' : 'var(--text)' }}>
              Apenas Enquetes Programadas / Selecionadas
            </div>
            <div style={{ fontSize: '0.70rem', color: 'var(--text-dim)', marginTop: '2px', lineHeight: 1.3 }}>
              Escolha abaixo exatamente quais enquetes agendadas enviarão os dados para o webhook.
            </div>
          </div>
        </label>
      </div>
    </div>
  );
};

export default PollScopeSelector;
