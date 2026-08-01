import React from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';

const UserFilters = ({ searchTerm, setSearchTerm, cargoFilter, setCargoFilter }) => {
    return (
        <div style={{ 
            display: 'flex', gap: '1.25rem', marginBottom: '2.5rem', 
            background: 'rgba(23, 25, 33, 0.6)', padding: '1.5rem', 
            borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)',
            alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
            <div style={{ position: 'relative', flex: 1 }}>
                <Search size={20} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.8 }} />
                <input 
                    type="text" 
                    placeholder="Pesquisar por nome, cargo ou e-mail..."
                    className="premium-field"
                    style={{ 
                        width: '100%', height: '54px', padding: '0 1.5rem 0 3.75rem', 
                        borderRadius: '14px', background: 'rgba(0,0,0,0.3)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '1rem', color: '#fff'
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div style={{ width: '260px' }}>
                <div style={{ position: 'relative' }}>
                    <Filter size={16} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
                    <select 
                        value={cargoFilter}
                        onChange={(e) => setCargoFilter(e.target.value)}
                        style={{ 
                            height: '54px', width: '100%', borderRadius: '14px', 
                            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff', fontSize: '0.95rem', fontWeight: 600,
                            padding: '0 1.25rem 0 3rem', cursor: 'pointer',
                            appearance: 'none', WebkitAppearance: 'none'
                        }}
                    >
                        <option value="" style={{ background: '#1c1e26', color: '#fff' }}>Todos os Cargos</option>
                        <option value="SUPER_ADMIN" style={{ background: '#1c1e26', color: '#fff' }}>Super Admin</option>
                        <option value="ADMIN" style={{ background: '#1c1e26', color: '#fff' }}>Administrador</option>
                        <option value="USER" style={{ background: '#1c1e26', color: '#fff' }}>Usuário Padrão</option>
                    </select>
                    <div style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }}>
                        <ChevronDown size={18} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserFilters;
