import React from 'react';
import { XCircle, CheckCircle2 } from 'lucide-react';
import { useUsers } from './hooks/useUsers';
import UserHeader from './components/UserHeader';
import UserFilters from './components/UserFilters';
import UserTable from './components/UserTable';
import InviteModal from './components/InviteModal';
import ResetModal from './components/ResetModal';

const GestaoUsuarios = ({ openConfirm }) => {
    const {
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
        handleDeleteUser,
        toggleStatus,
        startResetPassword
    } = useUsers(openConfirm);

    return (
        <div className="fade-in" style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
            <UserHeader setShowModal={setShowInviteModal} />

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
            />

            <InviteModal 
                showModal={showInviteModal}
                setShowModal={setShowInviteModal}
            />

            <ResetModal 
                showModal={showResetModal}
                setShowModal={setShowResetModal}
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
