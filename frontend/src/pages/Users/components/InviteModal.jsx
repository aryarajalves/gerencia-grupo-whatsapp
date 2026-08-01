import React, { useState } from 'react';
import { UserPlus, X, Layers, Clock, Copy, CheckCircle2, Link, RefreshCcw } from 'lucide-react';
import { ModalPortal } from '../../../components/common';
import axiosInstance from '../../../services/api';
import toast from 'react-hot-toast';

const InviteModal = ({ showModal, setShowModal }) => {
    const [loading, setLoading] = useState(false);
    const [inviteData, setInviteData] = useState({
        cargo: 'ADMIN',
        expira_horas: 24
    });
    const [generatedLink, setGeneratedLink] = useState('');

    if (!showModal) return null;

    const handleGenerateInvite = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axiosInstance.post('/convite', {
                ...inviteData,
                tipo: 'convite'
            });
            if (res.data && res.data.link) {
                setGeneratedLink(res.data.link);
                toast.success('Convite gerado com sucesso!');
            } else {
                throw new Error('Link não retornado pela API');
            }
        } catch (error) {
            console.error('Erro ao gerar convite:', error);
            toast.error(error.response?.data?.detail || error.message || 'Erro ao gerar convite');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        toast.success('Link copiado!');
    };

    const resetAndClose = () => {
        setShowModal(false);
        setGeneratedLink('');
        setInviteData({ cargo: 'ADMIN', expira_horas: 24 });
    };

    return (
        <ModalPortal>
            <div className="fullscreen-modal-overlay" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <div className="fullscreen-modal-container" style={{ 
                    maxWidth: '500px', height: 'auto',
                    background: 'rgba(23, 25, 33, 0.95)',
                    backdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 'var(--modal-radius)',
                    padding: '0'
                }}>
                    <div className="fullscreen-modal-header" style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.08)', 
                        padding: 'var(--modal-header-padding)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ 
                                width: '44px', height: '44px', borderRadius: '12px', 
                                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff'
                            }}>
                                <UserPlus size={22} />
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                                    Convidar Colaborador
                                </h2>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Gere um link de acesso seguro.</span>
                            </div>
                        </div>
                        <button className="btn-close-modal" onClick={resetAndClose}><X size={18} /></button>
                    </div>

                    <div style={{ padding: 'var(--modal-padding)' }}>
                        {!generatedLink ? (
                            <form onSubmit={handleGenerateInvite} style={{ display: 'grid', gap: '1.25rem' }}>
                                <div className="input-group-premium">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                                        <Layers size={13} /> Nível de Permissão
                                    </label>
                                    <select 
                                        value={inviteData.cargo}
                                        style={{ width: '100%', height: 'var(--input-height)', padding: '0 1.25rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '0.95rem' }}
                                        onChange={(e) => setInviteData({...inviteData, cargo: e.target.value})}
                                    >
                                        <option value="ADMIN" style={{ background: '#1e1e2d', color: '#fff' }}>Administrador (Controle Total)</option>
                                        <option value="USER" style={{ background: '#1e1e2d', color: '#fff' }}>Usuário (Apenas Leitura)</option>
                                    </select>
                                </div>

                                <div className="input-group-premium">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                                        <Clock size={13} /> Expiração do Link
                                    </label>
                                    <select 
                                        value={inviteData.expira_horas || ''}
                                        style={{ width: '100%', height: 'var(--input-height)', padding: '0 1.25rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '0.95rem' }}
                                        onChange={(e) => setInviteData({...inviteData, expira_horas: e.target.value ? parseInt(e.target.value) : null})}
                                    >
                                        <option value="1" style={{ background: '#1e1e2d', color: '#fff' }}>1 Hora</option>
                                        <option value="4" style={{ background: '#1e1e2d', color: '#fff' }}>4 Horas</option>
                                        <option value="8" style={{ background: '#1e1e2d', color: '#fff' }}>8 Horas</option>
                                        <option value="12" style={{ background: '#1e1e2d', color: '#fff' }}>12 Horas</option>
                                        <option value="24" style={{ background: '#1e1e2d', color: '#fff' }}>24 Horas</option>
                                        <option value="" style={{ background: '#1e1e2d', color: '#fff' }}>Ilimitado (Não expira)</option>
                                    </select>
                                </div>

                                <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '50px', width: '100%', justifyContent: 'center', fontWeight: 800 }}>
                                    {loading ? <RefreshCcw size={20} className="spin" /> : 'Gerar Link de Convite'}
                                </button>
                            </form>
                        ) : (
                            <div className="fade-in" style={{ textAlign: 'center' }}>
                                <div style={{ 
                                    background: 'rgba(var(--success-rgb), 0.1)', border: '1px solid rgba(var(--success-rgb), 0.2)',
                                    padding: '1.25rem', borderRadius: '16px', marginBottom: '1.5rem'
                                }}>
                                    <CheckCircle2 size={32} color="var(--success)" style={{ marginBottom: '8px' }} />
                                    <h3 style={{ color: '#fff', marginBottom: '4px', fontSize: '1.1rem' }}>Link Gerado!</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Copie e envie para o novo colaborador.</p>
                                </div>

                                <div style={{ 
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', 
                                    padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px',
                                    marginBottom: '1.5rem'
                                }}>
                                    <Link size={16} color="var(--primary)" />
                                    <input 
                                        readOnly 
                                        value={generatedLink} 
                                        style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', flex: 1 }} 
                                    />
                                    <button onClick={copyToClipboard} style={{ background: 'var(--primary)', border: 'none', padding: '6px', borderRadius: '6px', color: '#fff' }}>
                                        <Copy size={16} />
                                    </button>
                                </div>

                                <button onClick={resetAndClose} className="btn btn-secondary" style={{ width: '100%', height: '48px' }}>
                                    Fechar Janela
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
};

export default InviteModal;
