import React from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';

const CaptureWebhookTab = ({
  webhookUrl = '',
  copiedId = null,
  handleCopy
}) => {
  const webhookFantasmaUrl = webhookUrl ? webhookUrl.replace('/whatsapp', '/fantasma') : '';

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
      {/* Card 1: Webhook Principal */}
      <div className="card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.05), transparent)', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(34, 211, 238, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ExternalLink size={18} style={{ color: '#22d3ee' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>Webhook da Instância Principal</h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Endpoint para captura de mensagens nos grupos administrados (Sua URL de Webhook Principal)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
          <input 
            readOnly 
            value={webhookUrl} 
            style={{ flex: 1, background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)', fontFamily: 'monospace', fontSize: '0.9rem', height: '46px', padding: '0 14px' }} 
          />
          <button 
            type="button"
            className="btn btn-primary" 
            onClick={() => handleCopy && handleCopy(webhookUrl, 'webhook_principal', 'URL do Webhook Principal copiada!')}
            style={{ minWidth: '140px', height: '46px' }}
          >
            {copiedId === 'webhook_principal' ? <><Check size={16} /> Copiado</> : <><Copy size={16} /> Copiar URL</>}
          </button>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          Insira esta URL nas configurações de Webhook da sua <strong>instância W-API Principal</strong> para receber e registrar mensagens dos grupos.
        </p>
      </div>

      {/* Card 2: Webhook do Número Fantasma */}
      <div className="card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05), transparent)', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ExternalLink size={18} style={{ color: '#c084fc' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#c084fc' }}>Webhook do Número Fantasma (Sentinela de Grupos)</h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Endpoint para monitoramento de abordagens no privado do número fantasma (Sua URL de Webhook Fantasma)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
          <input 
            readOnly 
            value={webhookFantasmaUrl} 
            style={{ flex: 1, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(168, 85, 247, 0.3)', fontFamily: 'monospace', fontSize: '0.9rem', height: '46px', padding: '0 14px', color: '#e9d5ff' }} 
          />
          <button 
            type="button"
            className="btn btn-primary" 
            onClick={() => handleCopy && handleCopy(webhookFantasmaUrl, 'webhook_fantasma', 'URL do Webhook do Número Fantasma copiada!')}
            style={{ minWidth: '140px', height: '46px', background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}
          >
            {copiedId === 'webhook_fantasma' ? <><Check size={16} /> Copiado</> : <><Copy size={16} /> Copiar URL</>}
          </button>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          Insira esta URL nas configurações de Webhook da sua <strong>instância W-API do Número Fantasma</strong>. Quando o número fantasma receber mensagens privadas, a IA analisará automaticamente se o remetente é membro de algum dos seus grupos ativos tentando pescar leads.
        </p>
      </div>
    </div>
  );
};

export default CaptureWebhookTab;
