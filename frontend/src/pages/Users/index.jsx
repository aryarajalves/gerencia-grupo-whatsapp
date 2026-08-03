import React from 'react';
import { XCircle, CheckCircle2, Users, Link2 } from 'lucide-react';
import { useUsers } from './hooks/useUsers';
import UserHeader from './components/UserHeader';
import UserFilters from './components/UserFilters';
import UserTable from './components/UserTable';
import InviteTable from './components/InviteTable';
import InviteModal from './components/InviteModal';
import ResetModal from './components/ResetModal';

const GestaoUsuarios = ({ openConfirm }) => {
    const {
        invites,
        activeTab,
        setActiveTab,
        searchTerm,
        setSearchTerm,
        cargoFilter,
        setCargoFilter,
        showInviteModal,
        setShowInviteModal,
        showResetModal,
        setShowResetModal,
        selectedUser,
        toast,
        filteredUsers,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        handleDeleteUser,
        handleDeleteInvite,
        toggleStatus,
        startResetPassword,
        refreshInvites
    } = useUsers(openConfirm);

    return (
        <div className="fade-in" style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
            <UserHeader setShowModal={setShowInviteModal} />

            {/* Abas */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => setActiveTab('usuarios')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'usuarios' ? '2px solid var(--primary)' : '2px solid transparent',
                        padding: '0.75rem 1.25rem',
                        color: activeTab === 'usuarios' ? '#fff' : 'var(--text-dim)',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <Users size={18} /> Usuários Ativos ({filteredUsers.length})
                </button>

                <button
                    onClick={() => setActiveTab('convites')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'convites' ? '2px solid var(--primary)' : '2px solid transparent',
                        padding: '0.75rem 1.25rem',
                        color: activeTab === 'convites' ? '#fff' : 'var(--text-dim)',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <Link2 size={18} /> Links de Convite ({invites.length})
                </button>
            </div>

            {activeTab === 'usuarios' ? (
                <>
                    <UserFilters 
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        cargoFilter={cargoFilter}
                        setCargoFilter={setCargoFilter}
                    />

                    <UserTable 
                        filteredUsers={filteredUsers}
                        startEditUser={startResetPassword}
                        toggleStatus={toggleStatus}
                        handleDeleteUser={handleDeleteUser}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        setItemsPerPage={setItemsPerPage}
                    />
                </>
            ) : (
                <InviteTable 
                    invites={invites}
                    handleDeleteInvite={handleDeleteInvite}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    setItemsPerPage={setItemsPerPage}
                />
            )}

            <InviteModal 
                showModal={showInviteModal}
                setShowModal={(show) => {
                    setShowInviteModal(show);
                    if (!show) refreshInvites();
                }}
            />

            <ResetModal 
                showModal={showResetModal}
                setShowModal={(show) => {
                    setShowResetModal(show);
                    if (!show) refreshInvites();
                }}
                user={selectedUser}
            />

            {toast.show && (
                <div className={`fade-in`} style={{
                    position: 'fixed', bottom: '30px', right: '30px', zIndex: 10000,
                    padding: '1rem 1.5rem', borderRadius: '14px',
                    background: toast.type === 'error' ? 'var(--danger)' : toast.type === 'success' ? 'var(--success)' : 'var(--primary)',
                    color: '#fff', display: 'flex', alignItems: 'center', gap: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {toast.type === 'error' ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default GestaoUsuarios;
