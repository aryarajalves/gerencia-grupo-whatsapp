import React from 'react';
import { Lock, Zap, Layers, Eye, EyeOff } from 'lucide-react';

const ApiTab = ({ configs, setConfigs, showToken, setShowToken }) => {
    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ 
                background: 'rgba(59, 130, 246, 0.08)', 
                padding: '1.25rem', 
                borderRadius: '12px', 
                border: '1px solid rgba(59, 130, 246, 0.2)',
                display: 'flex',
                gap: '15px',
                alignItems: 'flex-start'
            }}>
                <div style={{ 
                    width: '38px', height: '38px', borderRadius: '10px', 
                    background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                    <Lock size={20} />
                </div>
                <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>Credenciais da W-API</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: '1.5', margin: 0 }}>
                        Chaves necessárias para o servidor sincronizar e enviar mensagens via WhatsApp. Mantenha-as em sigilo.
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <Zap size={14} /> WAPI Access Token
                    </label>
                    <div style={{ position: 'relative' }}>
                        <input 
                            type={showToken ? "text" : "password"} 
                            name="wapi_access_token"
                            autoComplete="new-password"
                            style={{ 
                                width: '100%', 
                                padding: '0 3.5rem 0 1rem', 
                                height: '48px', 
                                fontSize: '0.95rem',
                                letterSpacing: showToken ? 'normal' : '0.3em'
                            }}
                            className="premium-field"
                            placeholder="Bearer Token..."
                            value={configs.WAPI_TOKEN || ''}
                            onChange={e => setConfigs({...configs, WAPI_TOKEN: e.target.value})}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowToken(!showToken)}
                            style={{ 
                                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-dim)',
                                width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                            }}
                        >
                            {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <Layers size={14} /> WAPI Instance ID
                    </label>
                    <input 
                        type="text" 
                        name="wapi_instance_id"
                        autoComplete="off"
                        className="premium-field"
                        style={{ width: '100%', height: '48px', fontSize: '0.95rem', padding: '0 1rem' }}
                        placeholder="Ex: LITE-M3SOUT-..."
                        value={configs.WAPI_INSTANCE_ID || ''}
                        onChange={e => setConfigs({...configs, WAPI_INSTANCE_ID: e.target.value})}
                    />
                </div>

                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        ⚡ Plano da Instância W-API
                    </label>
                    <select
                        className="premium-field"
                        style={{ width: '100%', height: '48px', fontSize: '0.95rem', padding: '0 1rem', cursor: 'pointer' }}
                        value={configs.WHATSAPP_PLAN_TYPE || 'PRO'}
                        onChange={e => setConfigs({ ...configs, WHATSAPP_PLAN_TYPE: e.target.value })}
                    >
                        <option value="PRO">⚡ Plano PRO (Enquetes, Mídias e Revogação Ativos)</option>
                        <option value="LITE">🔹 Plano LITE (Recursos Básicos)</option>
                    </select>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                        Se você já utiliza o plano PRO na W-API, mantenha selecionado PRO para liberar o disparo de enquetes e apagar mensagens.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ApiTab;
