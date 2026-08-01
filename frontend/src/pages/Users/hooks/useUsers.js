import { useState, useEffect } from 'react';
import axiosInstance from '../../../services/api';

export const useUsers = (openConfirm) => {
    const [usuarios, setUsuarios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cargoFilter, setCargoFilter] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
    };

    const fetchUsers = async () => {
        try {
            const res = await axiosInstance.get('/usuarios/');
            setUsuarios(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const startResetPassword = (user) => {
        setSelectedUser(user);
        setShowResetModal(true);
    };

    const handleDeleteUser = async (id) => {
        openConfirm({
            title: 'Excluir Usuário',
            message: 'Tem certeza que deseja remover este usuário? Ele perderá o acesso ao painel instantaneamente.',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await axiosInstance.delete(`/usuarios/${id}`);
                    fetchUsers();
                    showToast("Usuário removido com sucesso!", "success");
                } catch (err) {
                    showToast(err.response?.data?.detail || "Erro ao deletar usuário", "error");
                }
            }
        });
    };

    const toggleStatus = async (id) => {
        try {
            await axiosInstance.patch(`/usuarios/${id}/toggle`);
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredUsers = usuarios.filter(u => {
        const matchesSearch = (u.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                             (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesCargo = cargoFilter === '' || u.cargo === cargoFilter;
        return matchesSearch && matchesCargo;
    })
    .map(u => ({ ...u, isFixed: u.cargo === 'SUPER_ADMIN' }))
    .sort((a, b) => {
        if (a.cargo === 'SUPER_ADMIN' && b.cargo !== 'SUPER_ADMIN') return -1;
        if (a.cargo !== 'SUPER_ADMIN' && b.cargo === 'SUPER_ADMIN') return 1;
        return (a.nome || '').localeCompare(b.nome || '');
    });

    return {
        usuarios,
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
    };
};
