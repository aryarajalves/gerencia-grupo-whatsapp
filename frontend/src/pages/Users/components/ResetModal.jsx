import React, { useState } from 'react';
import { Key, X, CheckCircle2, Link, Copy, RefreshCcw } from 'lucide-react';
import { ModalPortal } from '../../../components/common';
import axiosInstance from '../../../services/api';
import toast from 'react-hot-toast';

const ResetModal = ({ showModal, setShowModal, user }) => {
    const [loading, setLoading] = useState(false);
    const [generatedLink, setGeneratedLink] = useState('');

    if (!showModal || !user) return null;

    const handleGenerateReset = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.post('/convite', {
                usuario_id: user.id,
                tipo: 'reset',
                cargo: user.cargo,
                expira_horas: 24 
            });
            if (res.data && res.data.link) {
                setGeneratedLink(res.data.link);
                toast.success('Link de recuperação gerado!');
            } else {
                throw new Error('Link não retornado pela API');
            }
        } catch (error) {
            console.error('Erro ao gerar link de reset:', error);
            toast.error(error.response?.data?.detail || error.message || 'Erro ao gerar link');
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
                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff'
                            }}>
                                <Key size={22} />
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                                    Redefinir Senha
                                </h2>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Usuário: <strong>{user.nome}</strong></span>
                            </div>
                        </div>
                        <button className="btn-close-modal" onClick={resetAndClose}><X size={18} /></button>
                    </div>

                    <div style={{ padding: 'var(--modal-padding)' }}>
                        {!generatedLink ? (
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                    O administrador não pode alterar a senha diretamente. <br />
                                    Gere um link e envie para o colaborador realizar a troca.
                                </p>
                                <button onClick={handleGenerateReset} className="btn btn-primary" disabled={loading} style={{ height: '50px', width: '100%', justifyContent: 'center', fontWeight: 800 }}>
                                    {loading ? <RefreshCcw size={20} className="spin" /> : 'Gerar Link de Recuperação'}
                                </button>
                            </div>
                        ) : (
                            <div className="fade-in" style={{ textAlign: 'center' }}>
                                <div style={{ 
                                    background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)',
                                    padding: '1.25rem', borderRadius: '16px', marginBottom: '1.5rem'
                                }}>
                                    <CheckCircle2 size={32} color="#f59e0b" style={{ marginBottom: '8px' }} />
                                    <h3 style={{ color: '#fff', marginBottom: '4px', fontSize: '1.1rem' }}>Link de Recuperação!</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Válido por 24 horas.</p>
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

export default ResetModal;
