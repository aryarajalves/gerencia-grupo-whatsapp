import React, { useState, useEffect } from 'react';
import { Ghost, Zap, Layers, Eye, EyeOff, ShieldAlert, Sparkles, Bot, ExternalLink, Copy, Check } from 'lucide-react';
import axiosInstance from '../../../services/api';
import { useCopy } from '../../../hooks/useCopy';

const GhostNumberTab = ({ configs, setConfigs }) => {
    const [showGhostToken, setShowGhostToken] = useState(false);
    const [webhookFantasmaUrl, setWebhookFantasmaUrl] = useState('');
    const { copiedId, handleCopy } = useCopy();

    useEffect(() => {
        const fetchWebhookUrl = async () => {
            try {
                const res = await axiosInstance.get('/captura/webhook-url');
                setWebhookFantasmaUrl(res.data.url_fantasma || `${res.data.url?.replace('/whatsapp', '/fantasma')}`);
            } catch (err) {
                console.error('Erro ao buscar URL do webhook do fantasma:', err);
            }
        };
        fetchWebhookUrl();
    }, []);

    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header / Banner Explicativo */}
            <div style={{ 
                background: 'rgba(168, 85, 247, 0.08)', 
                padding: '1.25rem', 
                borderRadius: '12px', 
                border: '1px solid rgba(168, 85, 247, 0.2)',
                display: 'flex',
                gap: '15px',
                alignItems: 'flex-start'
            }}>
                <div style={{ 
                    width: '42px', height: '42px', borderRadius: '10px', 
                    background: 'rgba(168, 85, 247, 0.18)', color: '#c084fc',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                    <Ghost size={24} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#c084fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Credenciais do WhatsApp / Número Fantasma
                        </h4>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: '1.5', margin: 0 }}>
                        Cadastre aqui as credenciais da instância W-API do seu <strong>Número Fantasma</strong>. 
                        Este número deve entrar nos grupos como um <strong>membro comum (não admin)</strong> para fins de segurança e monitoramento de mensagens privadas. A ativação do monitoramento é configurada individualmente em cada grupo.
                    </p>
                </div>
            </div>

            {/* URL do Webhook do Número Fantasma */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.06), rgba(0, 0, 0, 0.2))',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                borderRadius: '12px',
                padding: '1.25rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <ExternalLink size={16} style={{ color: '#c084fc' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        URL de Webhook da Instância Fantasma
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        readOnly 
                        value={webhookFantasmaUrl} 
                        style={{ 
                            flex: 1, 
                            background: 'rgba(0,0,0,0.3)', 
                            border: '1px solid rgba(168, 85, 247, 0.3)', 
                            borderRadius: '8px', 
                            fontFamily: 'monospace', 
                            fontSize: '0.85rem', 
                            height: '42px', 
                            padding: '0 12px', 
                            color: '#e9d5ff' 
                        }} 
                    />
                    <button 
                        type="button"
                        className="btn btn-primary" 
                        onClick={() => handleCopy(webhookFantasmaUrl, 'ghost_webhook', 'URL do Webhook do Número Fantasma copiada!')}
                        style={{ height: '42px', padding: '0 18px', background: 'linear-gradient(135deg, #7c3aed, #9333ea)', fontSize: '0.85rem' }}
                    >
                        {copiedId === 'ghost_webhook' ? <><Check size={15} /> Copiado</> : <><Copy size={15} /> Copiar</>}
                    </button>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Cole esta URL no campo de Webhook da instância fantasma no painel da W-API para receber as mensagens privadas em tempo real.
                </p>
            </div>

            {/* Caixa Informativa de Boas Práticas */}
            <div style={{
                background: 'rgba(245, 158, 11, 0.06)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <ShieldAlert size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#fcd34d', lineHeight: '1.4' }}>
                    <strong>Regra de Operação:</strong> Nunca dê cargo de Administrador a esse número no WhatsApp. Ele deve permanecer como participante comum no grupo.
                </p>
            </div>

            {/* Campos do Formulário */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                {/* WAPI Token do Fantasma */}
                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <Zap size={14} /> WAPI Access Token (Fantasma)
                    </label>
                    <div style={{ position: 'relative' }}>
                        <input 
                            type={showGhostToken ? "text" : "password"} 
                            name="wapi_fantasma_token"
                            autoComplete="new-password"
                            style={{ 
                                width: '100%', 
                                padding: '0 3.5rem 0 1rem', 
                                height: '48px', 
                                fontSize: '0.95rem',
                                letterSpacing: showGhostToken ? 'normal' : '0.3em'
                            }}
                            className="premium-field"
                            placeholder="Bearer Token da instância fantasma..."
                            value={configs.WAPI_FANTASMA_TOKEN || ''}
                            onChange={e => setConfigs({ ...configs, WAPI_FANTASMA_TOKEN: e.target.value })}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowGhostToken(!showGhostToken)}
                            style={{ 
                                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-dim)',
                                width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                            }}
                            aria-label={showGhostToken ? "Ocultar token" : "Exibir token"}
                        >
                            {showGhostToken ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Grid com Instance ID e Dropdown do Plano */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <Layers size={14} /> WAPI Instance ID (Fantasma)
                        </label>
                        <input 
                            type="text" 
                            name="wapi_fantasma_instance_id"
                            autoComplete="off"
                            className="premium-field"
                            style={{ width: '100%', height: '48px', fontSize: '0.95rem', padding: '0 1rem' }}
                            placeholder="Ex: GHOST-M3SOUT-..."
                            value={configs.WAPI_FANTASMA_INSTANCE_ID || ''}
                            onChange={e => setConfigs({ ...configs, WAPI_FANTASMA_INSTANCE_ID: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <Sparkles size={14} /> Plano da Instância W-API (Fantasma)
                        </label>
                        <select
                            className="premium-field"
                            style={{ width: '100%', height: '48px', fontSize: '0.95rem', padding: '0 1rem', cursor: 'pointer' }}
                            value={configs.WAPI_FANTASMA_PLAN_TYPE || 'PRO'}
                            onChange={e => setConfigs({ ...configs, WAPI_FANTASMA_PLAN_TYPE: e.target.value })}
                        >
                            <option value="PRO">⚡ Plano PRO</option>
                            <option value="LITE">🔹 Plano LITE</option>
                        </select>
                    </div>
                </div>

                {/* Modelo de IA para Análise de Mensagens */}
                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <Bot size={14} style={{ color: '#c084fc' }} /> Modelo de IA (OpenAI)
                    </label>
                    <select
                        className="premium-field"
                        style={{ width: '100%', height: '48px', fontSize: '0.95rem', padding: '0 1rem', cursor: 'pointer' }}
                        value={configs.OPENAI_MODEL || 'gpt-4o-mini'}
                        onChange={e => setConfigs({ ...configs, OPENAI_MODEL: e.target.value })}
                    >
                        <option value="gpt-4o-mini">⚡ GPT-4o Mini (Rápido e Econômico - Recomendado)</option>
                        <option value="gpt-5-mini">🚀 GPT-5 Mini (Série GPT-5)</option>
                        <option value="o3-mini">🧠 o3-Mini (Raciocínio Avançado)</option>
                        <option value="gpt-4o">💎 GPT-4o (Flagship Multimodal)</option>
                    </select>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                        Modelo de Inteligência Artificial que analisará as mensagens privadas recebidas pelo Número Fantasma.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GhostNumberTab;
