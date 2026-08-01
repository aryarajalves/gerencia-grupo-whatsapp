import React from 'react';
import { LogOut } from 'lucide-react';
import ModalPortal from './ModalPortal';

const LogoutModal = ({ show, onConfirm, onCancel }) => {
    if (!show) return null;
    
    return (
        <ModalPortal>
            <div className="fullscreen-modal-overlay">
                <div className="card fade-in" style={{ maxWidth: '400px', width: '90%', textAlign: 'center', padding: '2.5rem', margin: 'auto' }}>
                    <div style={{ 
                        backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                        width: '60px', height: '60px', borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', 
                        color: 'var(--danger)' 
                    }}>
                        <LogOut size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Encerrar Sessão?</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', marginBottom: '2rem' }}>Você precisará de suas credenciais para acessar o painel novamente.</p>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onCancel}>
                            Cancelar
                        </button>
                        <button className="btn" style={{ flex: 1, background: 'var(--danger)', justifyContent: 'center', color: '#fff' }} onClick={onConfirm}>
                            Sair Agora
                        </button>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
};

export default LogoutModal;
