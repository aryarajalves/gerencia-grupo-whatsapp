import React from 'react';
import { Webhook, Clock, RefreshCw, Send } from 'lucide-react';

const PollWebhookConfig = ({
  webhookUrl = '',
  delaySegundos = 0,
  onChangeUrl,
  onChangeDelay,
  onTestWebhook,
  testing = false
}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.25rem', marginBottom: '14px' }}>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <label className="label-premium" style={{ margin: 0 }}>
            <Webhook size={12} /> URL do Webhook de Enquete <span style={{ color: '#ec4899', fontWeight: 600 }}>*</span>
          </label>
          <button
            type="button"
            onClick={onTestWebhook}
            disabled={testing || !webhookUrl}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: '1px solid rgba(236, 72, 153, 0.4)',
              background: 'rgba(236, 72, 153, 0.1)',
              color: '#f472b6',
              cursor: testing || !webhookUrl ? 'not-allowed' : 'pointer',
              opacity: testing || !webhookUrl ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
            title="Dispara um payload de teste para esta URL"
          >
            {testing ? (
              <>
                <RefreshCw size={11} className="spin" /> Testando...
              </>
            ) : (
              <>
                <Send size={11} /> Testar Webhook
              </>
            )}
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <Webhook
            size={13}
            style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              color: webhookUrl ? '#ec4899' : 'var(--text-dim)',
              transition: 'color 0.2s'
            }}
          />
          <input
            value={webhookUrl}
            onChange={e => onChangeUrl && onChangeUrl(e.target.value)}
            placeholder="https://sua-api.com/webhook/enquetes ou n8n/make..."
            style={{
              width: '100%',
              paddingLeft: '2.2rem',
              border: webhookUrl
                ? '1px solid rgba(236,72,153,0.5)'
                : '1px solid var(--border)',
              background: webhookUrl
                ? 'rgba(236,72,153,0.04)'
                : undefined,
              transition: 'border 0.2s, background 0.2s'
            }}
          />
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          {webhookUrl ? (
            <>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
              Os votos consolidados serão enviados via POST para esta URL.
            </>
          ) : (
            <>Insira o endereço HTTP/HTTPS de destino.</>
          )}
        </p>
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="label-premium">
          <Clock size={12} /> Tempo de Espera / Delay (Debounce)
        </label>
        <select
          value={delaySegundos !== undefined ? delaySegundos : 0}
          onChange={e => onChangeDelay && onChangeDelay(parseInt(e.target.value, 10))}
          style={{ width: '100%' }}
        >
          <option value={0}>Sem delay (Envio Imediato)</option>
          <option value={15}>15 segundos</option>
          <option value={30}>30 segundos</option>
          <option value={60}>1 minuto (Recomendado)</option>
          <option value={120}>2 minutos</option>
          <option value={300}>5 minutos</option>
          <option value={600}>10 minutos</option>
        </select>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
          {delaySegundos > 0 ? (
            <>Se o usuário mudar de ideia ou trocar de opção neste tempo, apenas a <strong>opção mais recente</strong> será enviada 1 única vez.</>
          ) : (
            <>Dispara o webhook assim que o usuário clicar em qualquer opção.</>
          )}
        </p>
      </div>
    </div>
  );
};

export default PollWebhookConfig;
