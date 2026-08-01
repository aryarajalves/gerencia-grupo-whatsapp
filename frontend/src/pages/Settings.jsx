import React, { useState, useEffect } from 'react';
import { 
  Lock, Zap, Layers, RefreshCcw, CheckCircle2, Eye, EyeOff, 
  Upload, Image as ImageIcon, Moon, Clock, Building2, Sliders 
} from 'lucide-react';
import axiosInstance from '../services/api';
import toast from 'react-hot-toast';

const Configuracoes = () => {
    const [activeTab, setActiveTab] = useState('api'); // 'api' | 'brand' | 'silence'
    const [configs, setConfigs] = useState({ WAPI_TOKEN: '', WAPI_INSTANCE_ID: '' });
    const [saveStatus, setSaveStatus] = useState('');
    const [showToken, setShowToken] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        let isMounted = true;
        const fetchConfig = async () => {
            try {
                const res = await axiosInstance.get('/config/');
                if (isMounted && res.data) {
                    setConfigs(res.data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchConfig();

        const handleConfigUpdated = () => fetchConfig();
        window.addEventListener('config-updated', handleConfigUpdated);

        return () => {
            isMounted = false;
            window.removeEventListener('config-updated', handleConfigUpdated);
        };
    }, []);

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            await axiosInstance.post('/config/', configs);
            setSaveStatus('Sucesso');
            toast.success('Configurações salvas com sucesso!');
            window.dispatchEvent(new CustomEvent('config-updated'));
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (err) {
            setSaveStatus('Erro');
            toast.error('Erro ao salvar configurações.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Formato inválido. Use PNG, JPEG ou SVG.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Arquivo muito grande. Máximo 2MB.');
            return;
        }

        setUploadingLogo(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axiosInstance.post('/upload/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setConfigs({ ...configs, COMPANY_LOGO: res.data.url });
            toast.success('Logo enviada com sucesso!');
        } catch (err) {
            console.error(err);
            toast.error('Erro ao enviar logo.');
        } finally {
            setUploadingLogo(false);
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, var(--text-dim))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Configurações do Sistema
                </h1>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>
                    Gerencie credenciais, identidade da marca e regras de funcionamento da plataforma
                </p>
            </div>

            {/* Abas de Navegação das Configurações */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div className="view-switcher" style={{ background: 'rgba(255,255,255,0.03)', padding: '5px', borderRadius: '14px', border: '1px solid var(--border)', display: 'inline-flex', gap: '6px' }}>
                    <button 
                        className={`view-btn ${activeTab === 'api' ? 'active' : ''}`}
                        onClick={() => setActiveTab('api')}
                        style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 600 }}
                    >
                        <Zap size={16} /> Credenciais W-API
                    </button>
                    <button 
                        className={`view-btn ${activeTab === 'brand' ? 'active' : ''}`}
                        onClick={() => setActiveTab('brand')}
                        style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 600 }}
                    >
                        <Building2 size={16} /> Identidade & Logo
                    </button>
                    <button 
                        className={`view-btn ${activeTab === 'silence' ? 'active' : ''}`}
                        onClick={() => setActiveTab('silence')}
                        style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 600 }}
                    >
                        <Moon size={16} /> Horário de Silêncio
                    </button>
                </div>
            </div>

            {/* Card Principal */}
            <div className="card" style={{ 
                padding: '2.25rem',
                border: '1px solid var(--border)',
                background: 'linear-gradient(145deg, rgba(23, 25, 35, 0.5), rgba(23, 25, 35, 0.2))',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}>
                {/* Honeypot anti-autofill */}
                <div style={{ display: 'none', position: 'absolute', opacity: 0, height: 0, width: 0, overflow: 'hidden' }}>
                    <input type="text" name="email" autoComplete="username" />
                    <input type="password" name="password" autoComplete="current-password" />
                </div>

                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                    
                    {/* ABA 1: CREDENCIAIS W-API */}
                    {activeTab === 'api' && (
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
                    )}

                    {/* ABA 2: IDENTIDADE & LOGO (WHITE LABEL) */}
                    {activeTab === 'brand' && (
                        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ 
                                background: 'rgba(139, 92, 246, 0.08)', 
                                padding: '1.25rem', 
                                borderRadius: '12px', 
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                display: 'flex',
                                gap: '15px',
                                alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    {configs.COMPANY_LOGO ? (
                                        <img src={configs.COMPANY_LOGO} alt="Logo" style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'contain' }} />
                                    ) : (
                                        <div style={{ 
                                            width: '44px', height: '44px', borderRadius: '12px', 
                                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.5rem', fontWeight: 900, color: '#fff',
                                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                                        }}>
                                            {configs.COMPANY_NAME ? configs.COMPANY_NAME[0].toUpperCase() : 'Z'}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700, color: '#8b5cf6' }}>Personalização da Marca</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: '1.5', margin: 0 }}>
                                        Personalize o nome da empresa e a logomarca exibidos no cabeçalho e menu lateral.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Nome da Empresa (White Label)
                                    </label>
                                    <input 
                                        type="text" 
                                        className="premium-field"
                                        style={{ width: '100%', height: '48px', fontSize: '0.95rem', padding: '0 1rem' }}
                                        placeholder="Ex: Zap Group"
                                        value={configs.COMPANY_NAME || ''}
                                        onChange={e => setConfigs({...configs, COMPANY_NAME: e.target.value})}
                                    />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>Substitui o título no menu lateral.</p>
                                </div>

                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Logo do App (White Label)
                                    </label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                    />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current.click()}
                                            className="btn"
                                            disabled={uploadingLogo}
                                            style={{
                                                flex: 1, height: '48px', background: 'rgba(255,255,255,0.05)',
                                                border: '1px dashed var(--border)', borderRadius: '10px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                                fontSize: '0.9rem', color: 'var(--text-dim)'
                                            }}
                                        >
                                            {uploadingLogo ? <RefreshCcw size={18} className="spin" /> : <Upload size={18} />}
                                            {uploadingLogo ? 'Enviando...' : 'Fazer Upload da Logo'}
                                        </button>
                                        {configs.COMPANY_LOGO && (
                                            <button
                                                type="button"
                                                onClick={() => setConfigs({ ...configs, COMPANY_LOGO: '' })}
                                                className="btn btn-danger"
                                                style={{ width: '48px', height: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                title="Remover Logo"
                                            >
                                                &times;
                                            </button>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>PNG, JPEG ou SVG (Recomendado proporção 1:1).</p>
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        <ImageIcon size={14} /> Tamanho da Logo no Sidebar
                                    </label>
                                    <select
                                        className="premium-field"
                                        style={{ width: '100%', height: '48px', fontSize: '0.95rem', padding: '0 1rem', cursor: 'pointer' }}
                                        value={configs.COMPANY_LOGO_SIZE || '44'}
                                        onChange={e => {
                                            const size = e.target.value;
                                            setConfigs({ ...configs, COMPANY_LOGO_SIZE: size });
                                            window.dispatchEvent(new CustomEvent('logo-size-preview', { detail: size }));
                                        }}
                                    >
                                        <option value="32">Pequena — 32px</option>
                                        <option value="44">Média — 44px (padrão)</option>
                                        <option value="56">Grande — 56px</option>
                                        <option value="72">Extra Grande — 72px</option>
                                    </select>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>Ajusta a dimensão da imagem no menu lateral de navegação.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ABA 3: HORÁRIO DE SILÊNCIO */}
                    {activeTab === 'silence' && (
                        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ 
                                background: 'rgba(16, 185, 129, 0.08)', 
                                padding: '1.25rem', 
                                borderRadius: '12px', 
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                display: 'flex',
                                gap: '15px',
                                alignItems: 'flex-start'
                            }}>
                                <div style={{ 
                                    width: '38px', height: '38px', borderRadius: '10px', 
                                    background: 'rgba(16, 185, 129, 0.15)', color: '#10b981',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <Moon size={20} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#10b981' }}>Regra do Horário de Silêncio</h4>
                                        <button 
                                            type="button"
                                            onClick={() => setConfigs({ ...configs, SILENCE_HOURS_ENABLED: configs.SILENCE_HOURS_ENABLED === 'true' ? 'false' : 'true' })}
                                            style={{ 
                                                padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                                                background: configs.SILENCE_HOURS_ENABLED === 'true' ? '#10b981' : 'rgba(255,255,255,0.05)',
                                                color: configs.SILENCE_HOURS_ENABLED === 'true' ? '#fff' : 'var(--text-dim)',
                                                border: '1px solid ' + (configs.SILENCE_HOURS_ENABLED === 'true' ? '#10b981' : 'var(--border)'),
                                                cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            {configs.SILENCE_HOURS_ENABLED === 'true' ? '✓ Ativado' : '✕ Desativado'}
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: '1.5', margin: 0 }}>
                                        Quando ativado, os disparos automáticos nos grupos serão pausados durante o período de descanso especificado.
                                    </p>
                                </div>
                            </div>

                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1fr 1fr', 
                                gap: '1.5rem', 
                                opacity: configs.SILENCE_HOURS_ENABLED === 'true' ? 1 : 0.4,
                                pointerEvents: configs.SILENCE_HOURS_ENABLED === 'true' ? 'auto' : 'none',
                                transition: 'opacity 0.2s'
                            }}>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        <Clock size={14} /> Início do Silêncio (Pausa)
                                    </label>
                                    <input 
                                        type="time" 
                                        className="premium-field"
                                        style={{ width: '100%', height: '48px', fontSize: '1rem', padding: '0 1rem' }}
                                        value={configs.SILENCE_HOURS_START || '22:00'}
                                        onChange={e => setConfigs({...configs, SILENCE_HOURS_START: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        <Clock size={14} /> Fim do Silêncio (Retomada)
                                    </label>
                                    <input 
                                        type="time" 
                                        className="premium-field"
                                        style={{ width: '100%', height: '48px', fontSize: '1rem', padding: '0 1rem' }}
                                        value={configs.SILENCE_HOURS_END || '08:00'}
                                        onChange={e => setConfigs({...configs, SILENCE_HOURS_END: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botão Global de Salvamento */}
                    <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem' }}>
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={loading}
                            style={{ 
                                width: '100%', 
                                height: '50px', 
                                justifyContent: 'center', 
                                fontSize: '1rem',
                                fontWeight: 700,
                                boxShadow: '0 8px 25px rgba(37, 99, 235, 0.2)'
                            }}
                        >
                            {loading ? (
                                <RefreshCcw size={20} className="spin" />
                            ) : (
                                <>
                                    <CheckCircle2 size={20} /> Salvar Alterações
                                </>
                            )}
                        </button>
                    </div>
                    
                    {saveStatus === 'Sucesso' && (
                        <div className="fade-in" style={{ padding: '12px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: 'var(--success)', fontSize: '0.9rem', textAlign: 'center', fontWeight: 600 }}>
                            Configurações salvas com sucesso!
                        </div>
                    )}
                    {saveStatus === 'Erro' && (
                        <div className="fade-in" style={{ padding: '12px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center', fontWeight: 600 }}>
                            Erro ao salvar configurações. Tente novamente.
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Configuracoes;
