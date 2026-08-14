import React, { useState, useEffect } from 'react';
import { 
  Zap, Building2, Moon, Ghost, RefreshCcw, CheckCircle2 
} from 'lucide-react';
import axiosInstance from '../services/api';
import toast from 'react-hot-toast';

import ApiTab from './Settings/components/ApiTab';
import BrandTab from './Settings/components/BrandTab';
import SilenceTab from './Settings/components/SilenceTab';
import GhostNumberTab from './Settings/components/GhostNumberTab';

const Configuracoes = () => {
    const [activeTab, setActiveTab] = useState('api'); // 'api' | 'ghost' | 'brand' | 'silence'
    const [configs, setConfigs] = useState({ 
        WAPI_TOKEN: '', 
        WAPI_INSTANCE_ID: '',
        WAPI_FANTASMA_TOKEN: '',
        WAPI_FANTASMA_INSTANCE_ID: '',
        WAPI_FANTASMA_PLAN_TYPE: 'PRO',
        OPENAI_MODEL: 'gpt-4o-mini'
    });
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
                    Gerencie credenciais, número fantasma, identidade da marca e regras de funcionamento da plataforma
                </p>
            </div>

            {/* Abas de Navegação das Configurações */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div className="view-switcher" style={{ background: 'rgba(255,255,255,0.03)', padding: '5px', borderRadius: '14px', border: '1px solid var(--border)', display: 'inline-flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button 
                        className={`view-btn ${activeTab === 'api' ? 'active' : ''}`}
                        onClick={() => setActiveTab('api')}
                        style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 600 }}
                    >
                        <Zap size={16} /> Credenciais W-API
                    </button>
                    <button 
                        className={`view-btn ${activeTab === 'ghost' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ghost')}
                        style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 600 }}
                    >
                        <Ghost size={16} /> Número Fantasma
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
                    
                    {/* ABA 1: CREDENCIAIS W-API PRINCIPAL */}
                    {activeTab === 'api' && (
                        <ApiTab 
                            configs={configs} 
                            setConfigs={setConfigs} 
                            showToken={showToken} 
                            setShowToken={setShowToken} 
                        />
                    )}

                    {/* ABA 2: NÚMERO FANTASMA */}
                    {activeTab === 'ghost' && (
                        <GhostNumberTab 
                            configs={configs} 
                            setConfigs={setConfigs} 
                        />
                    )}

                    {/* ABA 3: IDENTIDADE & LOGO (WHITE LABEL) */}
                    {activeTab === 'brand' && (
                        <BrandTab 
                            configs={configs} 
                            setConfigs={setConfigs} 
                            uploadingLogo={uploadingLogo} 
                            handleLogoUpload={handleLogoUpload} 
                            fileInputRef={fileInputRef} 
                        />
                    )}

                    {/* ABA 4: HORÁRIO DE SILÊNCIO */}
                    {activeTab === 'silence' && (
                        <SilenceTab 
                            configs={configs} 
                            setConfigs={setConfigs} 
                        />
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
