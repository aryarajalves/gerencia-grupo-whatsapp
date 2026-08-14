import React from 'react';
import { Building2, Upload, RefreshCcw, Image as ImageIcon } from 'lucide-react';

const BrandTab = ({ 
    configs, 
    setConfigs, 
    uploadingLogo, 
    handleLogoUpload, 
    fileInputRef 
}) => {
    return (
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
    );
};

export default BrandTab;
