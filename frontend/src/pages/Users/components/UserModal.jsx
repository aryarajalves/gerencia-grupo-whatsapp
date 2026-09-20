import React from 'react';
import { Pencil, X, User, Mail, Layers } from 'lucide-react';
import { ModalPortal } from '../../../components/common';

const UserModal = ({ 
    showModal, 
    setShowModal, 
    editUser, 
    setEditUser, 
    handleSaveUser,
    submitting = false
}) => {
    if (!showModal || !editUser) return null;

    return (
        <ModalPortal>
            <div className="fullscreen-modal-overlay" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                <div className="fullscreen-modal-container" style={{ 
                    maxWidth: '480px', height: 'auto', overflow: 'visible',
                    background: 'rgba(23, 25, 33, 0.95)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 30px 100px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05)',
                    borderRadius: 'var(--modal-radius)',
                    padding: '0'
                }}>
                    <div className="fullscreen-modal-header" style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.08)', 
                        padding: 'var(--modal-header-padding)',
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.02), transparent)',
                        borderRadius: 'var(--modal-radius) var(--modal-radius) 0 0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ 
                                width: '42px', height: '42px', borderRadius: '12px', 
                                background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', boxShadow: '0 8px 20px rgba(56, 189, 248, 0.3)'
                            }}>
                                <Pencil size={20} />
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                                    Editar Usuário
                                </h2>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 500 }}>
                                    Atualize o perfil do colaborador.
                                </span>
                            </div>
                        </div>
                        <button 
                            type="button"
                            className="btn-close-modal" 
                            style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', width: '32px', height: '32px' }} 
                            onClick={() => setShowModal(false)}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSaveUser} style={{ padding: 'var(--modal-padding)', display: 'grid', gridTemplateColumns: '1fr', gap: '1.1rem' }}>
                        <div className="input-group-premium">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                <User size={13} /> Nome Completo
                            </label>
                            <input 
                                required
                                type="text" 
                                placeholder="Ex: João Silva"
                                style={{ 
                                    height: 'var(--input-height)', padding: '0 1.25rem', borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                                    fontSize: '0.95rem'
                                }}
                                className="premium-field"
                                value={editUser.nome || ''}
                                onChange={(e) => setEditUser({...editUser, nome: e.target.value})}
                            />
                        </div>

                        <div className="input-group-premium">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                <Mail size={13} /> E-mail de Trabalho
                            </label>
                            <input 
                                required
                                type="email" 
                                autoComplete="off"
                                placeholder="nome@empresa.com"
                                style={{ 
                                    height: 'var(--input-height)', padding: '0 1.25rem', borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                                    fontSize: '0.95rem'
                                }}
                                className="premium-field"
                                value={editUser.email || ''}
                                onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                            />
                        </div>

                        <div className="input-group-premium">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                <Layers size={13} /> Nível de Acesso
                            </label>
                            <select 
                                value={editUser.cargo || 'ADMIN'}
                                style={{ 
                                    height: 'var(--input-height)', padding: '0 1.25rem', borderRadius: '12px',
                                    background: 'rgba(25, 27, 35, 0.9)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff', cursor: 'pointer', fontSize: '0.95rem'
                                }}
                                onChange={(e) => setEditUser({...editUser, cargo: e.target.value})}
                            >
                                <option value="ADMIN">ADMIN</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: '12px', marginTop: '0.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                disabled={submitting}
                                style={{ 
                                    flex: 1, height: '46px', justifyContent: 'center', fontSize: '0.95rem', fontWeight: 800,
                                    boxShadow: '0 10px 25px rgba(var(--primary-rgb), 0.3)', borderRadius: '12px'
                                }}
                            >
                                {submitting ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                style={{ flex: 0.4, height: '46px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }} 
                                onClick={() => setShowModal(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </ModalPortal>
    );
};

export default UserModal;
