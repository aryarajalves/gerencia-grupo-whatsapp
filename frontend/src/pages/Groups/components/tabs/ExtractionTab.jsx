import React from 'react';
import { Users, Webhook } from 'lucide-react';

const ExtractionTab = ({ novoGrupo, setNovoGrupo }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s ease-in-out' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="label-premium"><Users size={12} /> Extração de Contatos</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${novoGrupo.extrair_contatos !== false ? 'rgba(34, 197, 94, 0.5)' : 'var(--border)'}`, background: novoGrupo.extrair_contatos !== false ? 'rgba(34, 197, 94, 0.08)' : 'transparent', transition: 'all 0.2s' }}>
              <input type="radio" name="extrair_contatos" value="sim" checked={novoGrupo.extrair_contatos !== false} onChange={() => setNovoGrupo({ ...novoGrupo, extrair_contatos: true })} style={{ accentColor: '#22c55e' }} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: novoGrupo.extrair_contatos !== false ? '#22c55e' : 'var(--text)' }}>Habilitada</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>Extrai os leads do grupo</div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${novoGrupo.extrair_contatos === false ? 'rgba(239, 68, 68, 0.5)' : 'var(--border)'}`, background: novoGrupo.extrair_contatos === false ? 'rgba(239, 68, 68, 0.08)' : 'transparent', transition: 'all 0.2s' }}>
              <input type="radio" name="extrair_contatos" value="nao" checked={novoGrupo.extrair_contatos === false} onChange={() => setNovoGrupo({ ...novoGrupo, extrair_contatos: false })} style={{ accentColor: '#ef4444' }} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: novoGrupo.extrair_contatos === false ? '#ef4444' : 'var(--text)' }}>Desabilitada</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>Não busca contatos</div>
              </div>
            </label>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="label-premium">Intervalo de Extração</label>
          <select 
            value={novoGrupo.intervalo_extracao_minutos || 30} 
            onChange={e => setNovoGrupo({ ...novoGrupo, intervalo_extracao_minutos: parseInt(e.target.value) })}
            disabled={novoGrupo.extrair_contatos === false}
            style={{ width: '100%', opacity: novoGrupo.extrair_contatos === false ? 0.5 : 1 }}
          >
            <option value={1}>A cada 1 minuto</option>
            <option value={5}>A cada 5 minutos</option>
            <option value={10}>A cada 10 minutos</option>
            <option value={15}>A cada 15 minutos</option>
            <option value={30}>A cada 30 minutos (Padrão)</option>
            <option value={60}>A cada 1 hora</option>
            <option value={120}>A cada 2 horas</option>
            <option value={360}>A cada 6 horas</option>
            <option value={1440}>A cada 24 horas (1x ao dia)</option>
          </select>
        </div>
      </div>

      {/* Webhook de Extração de Contatos */}
      {novoGrupo.extrair_contatos !== false && (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="label-premium">
            <Webhook size={12} /> Webhook de Contatos <span style={{ color: 'var(--text-dim)', fontWeight: 400, fontSize: '0.7rem' }}>(Opcional)</span>
          </label>
          <div style={{ position: 'relative' }}>
            <Webhook
              size={13}
              style={{
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                color: novoGrupo.webhook_extracao_url ? 'var(--accent)' : 'var(--text-dim)',
                transition: 'color 0.2s'
              }}
            />
            <input
              value={novoGrupo.webhook_extracao_url || ''}
              onChange={e => setNovoGrupo({ ...novoGrupo, webhook_extracao_url: e.target.value })}
              placeholder="https://hook.plataforma.com/webhook/..."
              style={{
                width: '100%',
                paddingLeft: '2.2rem',
                border: novoGrupo.webhook_extracao_url
                  ? '1px solid rgba(124,58,237,0.5)'
                  : '1px solid var(--border)',
                background: novoGrupo.webhook_extracao_url
                  ? 'rgba(124,58,237,0.04)'
                  : undefined,
                transition: 'border 0.2s, background 0.2s'
              }}
            />
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            {novoGrupo.webhook_extracao_url
              ? <><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />Novos contatos extraídos serão enviados automaticamente via POST para esta URL.</>
              : <>Deixe em branco para não usar. Quando preenchida, cada novo contato extraído é enviado via POST automaticamente.</>
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ExtractionTab;
