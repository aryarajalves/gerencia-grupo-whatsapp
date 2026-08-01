import { Users, Key, PauseCircle, PlayCircle, Trash2 } from 'lucide-react';

const UserTable = ({ filteredUsers, startEditUser, toggleStatus, handleDeleteUser }) => {
    return (
        <div style={{ 
            background: 'rgba(23, 25, 33, 0.4)', 
            borderRadius: '24px', 
            border: '1px solid rgba(255,255,255,0.05)',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
        }}>
            <div style={{ 
                display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr', 
                padding: '1.5rem 2rem', background: 'rgba(255,255,255,0.02)',
                fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div>Nome / E-mail</div>
                <div>Cargo</div>
                <div style={{ textAlign: 'center' }}>Status</div>
                <div style={{ textAlign: 'right' }}>Ações</div>
            </div>

            <div style={{ maxHeight: 'calc(100vh - 450px)', overflowY: 'auto', overflowX: 'hidden' }}>
                {filteredUsers.length === 0 ? (
                    <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                        <div style={{ marginBottom: '1rem', opacity: 0.2 }}><Users size={64} style={{ margin: '0 auto' }} /></div>
                        Nenhum usuário encontrado com os filtros atuais.
                    </div>
                ) : (
                    filteredUsers.map((user) => (
                        <div key={user.id} className="user-row-premium" style={{ 
                            display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr', 
                            padding: '1.25rem 2rem', alignItems: 'center',
                            transition: 'all 0.2s', borderBottom: '1px solid rgba(255,255,255,0.02)'
                        }}>
                            <div style={{ 
                                display: 'flex', alignItems: 'center', gap: '1.25rem',
                                opacity: user.ativo ? 1 : 0.5,
                                transition: 'opacity 0.3s'
                            }}>
                                <div className="user-avatar" style={{ 
                                    width: '44px', height: '44px', borderRadius: '12px', fontSize: '1rem',
                                    background: user.cargo === 'SUPER_ADMIN' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, var(--primary), var(--accent))',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                    filter: user.ativo ? 'none' : 'grayscale(100%)'
                                }}>
                                    {user.nome.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ 
                                        fontWeight: 700, fontSize: '0.95rem', color: '#fff',
                                        textDecoration: user.ativo ? 'none' : 'line-through',
                                        transition: 'all 0.3s'
                                    }}>{user.nome}</div>
                                    <div style={{ 
                                        fontSize: '0.8rem', color: 'var(--text-dim)', 
                                        overflow: 'hidden', textOverflow: 'ellipsis',
                                        textDecoration: user.ativo ? 'none' : 'line-through'
                                    }}>{user.email}</div>
                                </div>
                            </div>
                            <div>
                                <span style={{ 
                                    padding: '5px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800,
                                    background: user.cargo === 'SUPER_ADMIN' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(var(--primary-rgb), 0.1)',
                                    color: user.cargo === 'SUPER_ADMIN' ? '#fbbf24' : 'var(--primary)',
                                    border: `1px solid ${user.cargo === 'SUPER_ADMIN' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(var(--primary-rgb), 0.2)'}`,
                                    textTransform: 'uppercase', letterSpacing: '0.05em'
                                }}>
                                    {user.cargo === 'SUPER_ADMIN' ? 'Diretor / CEO' : user.cargo}
                                </span>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ 
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600,
                                    background: user.ativo ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: user.ativo ? '#34d399' : '#f87171'
                                }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: user.ativo ? '#10b981' : '#ef4444' }}></div>
                                    {user.ativo ? 'Ativo' : 'Inativo'}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                {!user.isFixed ? (
                                    <>
                                        <button 
                                            className="btn-action-premium" 
                                            title="Gerar link de senha"
                                            onClick={() => startEditUser(user)}
                                            style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.05)', padding: '8px', borderRadius: '10px' }}
                                        >
                                            <Key size={18} />
                                        </button>
                                        <button 
                                            className="btn-action-premium" 
                                            title={user.ativo ? 'Bloquear' : 'Desbloquear'}
                                            onClick={() => toggleStatus(user.id)}
                                            style={{ color: user.ativo ? '#fbbf24' : '#10b981', background: user.ativo ? 'rgba(245, 158, 11, 0.05)' : 'rgba(16, 185, 129, 0.05)', padding: '8px', borderRadius: '10px' }}
                                        >
                                            {user.ativo ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
                                        </button>
                                        <button 
                                            className="btn-action-premium" 
                                            title="Remover"
                                            onClick={() => handleDeleteUser(user.id)}
                                            style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)', padding: '8px', borderRadius: '10px' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </>
                                ) : (
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, padding: '8px' }}>Sistema</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UserTable;
