import { Users, Key, PauseCircle, PlayCircle, Trash2 } from 'lucide-react';

const UserTable = ({ filteredUsers, startEditUser, toggleStatus, handleDeleteUser, currentPage = 1, setCurrentPage, itemsPerPage = 10, setItemsPerPage }) => {
    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

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

            <div style={{ minHeight: '120px' }}>
                {paginatedUsers.length === 0 ? (
                    <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                        <div style={{ marginBottom: '1rem', opacity: 0.2 }}><Users size={64} style={{ margin: '0 auto' }} /></div>
                        Nenhum usuário encontrado com os filtros atuais.
                    </div>
                ) : (
                    paginatedUsers.map((user) => (
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

            {/* Barra de Paginação */}
            <div style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                fontSize: '0.82rem',
                color: 'var(--text-dim)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>Exibindo <strong style={{ color: '#fff' }}>{totalItems > 0 ? startIndex + 1 : 0}</strong> a <strong style={{ color: '#fff' }}>{Math.min(startIndex + itemsPerPage, totalItems)}</strong> de <strong style={{ color: '#fff' }}>{totalItems}</strong> usuários</span>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
                        <span style={{ fontSize: '0.78rem' }}>Exibir:</span>
                        <select 
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '8px',
                                color: '#fff',
                                padding: '4px 8px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            <option value={5} style={{ background: '#1c1e26', color: '#fff' }}>5 por página</option>
                            <option value={10} style={{ background: '#1c1e26', color: '#fff' }}>10 por página</option>
                            <option value={20} style={{ background: '#1c1e26', color: '#fff' }}>20 por página</option>
                            <option value={50} style={{ background: '#1c1e26', color: '#fff' }}>50 por página</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                        disabled={safePage <= 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        style={{
                            padding: '6px 14px',
                            background: safePage <= 1 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: safePage <= 1 ? 'var(--text-dim)' : '#fff',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Anterior
                    </button>

                    <span style={{ fontSize: '0.8rem', padding: '0 6px', color: '#fff', fontWeight: 700 }}>
                        Página {safePage} de {totalPages}
                    </span>

                    <button
                        disabled={safePage >= totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        style={{
                            padding: '6px 14px',
                            background: safePage >= totalPages ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: safePage >= totalPages ? 'var(--text-dim)' : '#fff',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Próximo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserTable;
