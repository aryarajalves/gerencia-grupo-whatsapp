import React from 'react';
import { UserPlus } from 'lucide-react';

const UserHeader = ({ setShowModal }) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Gestão de Usuários
                </h1>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Controle quem tem acesso ao painel administrativo.</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ height: '50px', padding: '0 2rem', borderRadius: '14px', boxShadow: '0 8px 25px rgba(var(--primary-rgb), 0.3)' }}>
                <UserPlus size={20} /> Adicionar Novo Usuário
            </button>
        </div>
    );
};

export default UserHeader;
