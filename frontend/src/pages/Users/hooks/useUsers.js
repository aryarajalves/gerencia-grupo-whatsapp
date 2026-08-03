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

    const [activeTab, setActiveTab] = useState('usuarios');
    const [invites, setInvites] = useState([]);

    const fetchUsers = async () => {
        try {
            const res = await axiosInstance.get('/usuarios/');
            setUsuarios(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchInvites = async () => {
        try {
            const res = await axiosInstance.get('/convites');
            setInvites(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchInvites();
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

    const handleDeleteInvite = async (id) => {
        openConfirm({
            title: 'Excluir Convite',
            message: 'Tem certeza que deseja revogar este link de convite?',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await axiosInstance.delete(`/convites/${id}`);
                    fetchInvites();
                    showToast("Convite removido com sucesso!", "success");
                } catch (err) {
                    showToast(err.response?.data?.detail || "Erro ao deletar convite", "error");
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

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Resetar para a primeira página ao alterar filtros ou abas
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, cargoFilter, activeTab]);

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
        refreshInvites: fetchInvites
    };
};
