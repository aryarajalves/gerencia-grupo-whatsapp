import React from 'react';
import { UserPlus, Pencil, X, User, Mail, Lock, EyeOff, Eye, Layers } from 'lucide-react';
import { ModalPortal } from '../../../components/common';

const UserModal = ({ 
    showModal, 
    setShowModal, 
    newUser, 
    setNewUser, 
    showPass, 
    setShowPass, 
    handleSaveUser 
}) => {
    if (!showModal) return null;

    return (
        <ModalPortal>
            <div className="fullscreen-modal-overlay" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <div className="fullscreen-modal-container" style={{ 
                    maxWidth: '500px', height: 'auto', overflow: 'visible',
                    background: 'rgba(23, 25, 33, 0.9)',
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
                                width: '44px', height: '44px', borderRadius: '12px', 
                                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', boxShadow: '0 8px 20px rgba(var(--primary-rgb), 0.4)'
                            }}>
                                {newUser.id ? <Pencil size={22} /> : <UserPlus size={22} />}
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    {newUser.id ? 'Refinar Usuário' : 'Novo Colaborador'}
                                </h2>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 500 }}>Acesso e permissões.</span>
                            </div>
                        </div>
                        <button className="btn-close-modal" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', width: '32px', height: '32px' }} onClick={() => { setShowModal(false); setShowPass(false); setNewUser({ id: null, nome: '', email: '', password: '', cargo: 'USER' }); }}><X size={18} /></button>
                    </div>

                    <form onSubmit={handleSaveUser} style={{ padding: 'var(--modal-padding)', display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem' }}>
                        <div className="input-group-premium">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                <User size={13} /> Nome Completo
                            </label>
                            <input 
                                required
                                type="text" 
                                placeholder="Ex: João Silva"
                                style={{ 
                                    height: 'var(--input-height)', padding: '0 1.25rem', borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                                    fontSize: '0.95rem', transition: 'all 0.3s'
                                }}
                                className="premium-field"
                                value={newUser.nome}
                                onChange={(e) => setNewUser({...newUser, nome: e.target.value})}
                            />
                        </div>
                        <div className="input-group-premium">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
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
                                value={newUser.email}
                                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                            />
                        </div>
                        <div className="input-group-premium">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                <Lock size={13} /> Senha de Segurança
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    required={!newUser.id}
                                    type={showPass ? "text" : "password"} 
                                    autoComplete="new-password"
                                    placeholder={newUser.id ? "Manter senha atual" : "Segredo de acesso"}
                                    style={{ 
                                        width: '100%', height: 'var(--input-height)', padding: '0 3.5rem 0 1.25rem', borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                                        fontSize: '0.95rem'
                                    }}
                                    className="premium-field"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    style={{ 
                                        position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--text-dim)',
                                        width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(var(--primary-rgb), 0.2)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="input-group-premium">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                <Layers size={13} /> Nível de Permissão
                            </label>
                            <select 
                                value={newUser.cargo}
                                style={{ 
                                    height: 'var(--input-height)', padding: '0 1.25rem', borderRadius: '12px',
                                    background: 'rgba(25, 27, 35, 0.6)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff', cursor: 'pointer', fontSize: '0.95rem'
                                }}
                                onChange={(e) => setNewUser({...newUser, cargo: e.target.value})}
                            >
                                <option value="ADMIN">Administrador (Controle Total)</option>
                                <option value="USER">Usuário (Apenas Leitura)</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: '12px', marginTop: '0.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <button type="submit" className="btn btn-primary" style={{ 
                                flex: 1, height: '48px', justifyContent: 'center', fontSize: '1rem', fontWeight: 800,
                                boxShadow: '0 10px 25px rgba(var(--primary-rgb), 0.3)', borderRadius: '14px'
                            }}>
                                {newUser.id ? 'Atualizar Perfil' : 'Finalizar Cadastro'}
                            </button>
                            <button type="button" className="btn btn-secondary" style={{ flex: 0.4, height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)' }} onClick={() => { setShowModal(false); setShowPass(false); }}>
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
