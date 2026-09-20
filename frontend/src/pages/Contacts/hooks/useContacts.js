import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../../services/api';
import { toastDeletado } from '../../../utils/toastNotifications';

export const useContacts = ({ openConfirm } = {}) => {
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [totalContacts, setTotalContacts] = useState(0);
  const [stats, setStats] = useState({ total_contatos: 0, total_grupos: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectingAllFiltered, setIsSelectingAllFiltered] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const toggleSelectPage = () => {
    const pageIds = contacts.map(c => c.id);
    const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.includes(id));
    if (allPageSelected) {
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
      setIsSelectingAllFiltered(false);
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleSelectAllFiltered = async () => {
    setLoading(true);
    try {
      const params = {
        limit: 10000,
        skip: 0,
        search: search || undefined,
        jid_grupo: groupFilter || undefined,
        no_grupo: statusFilter === 'all' ? undefined : (statusFilter === 'in'),
        is_admin: roleFilter === 'all' ? undefined : (roleFilter === 'admin')
      };
      const res = await axiosInstance.get('/contatos/', { params });
      const allIds = (res.data.items || []).map(c => c.id);
      setSelectedIds(allIds);
      setIsSelectingAllFiltered(true);
      showToast(`${allIds.length} contato(s) selecionados no total!`, 'success');
    } catch (error) {
      console.error('Erro ao selecionar todos os contatos:', error);
      showToast('Erro ao selecionar todos os contatos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = useCallback(async () => {
    try {
      const resGroups = await axiosInstance.get('/contatos/grupos');
      setGroups(resGroups.data || []);
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit: resultsPerPage,
        skip: (currentPage - 1) * resultsPerPage,
        search: search || undefined,
        jid_grupo: groupFilter || undefined,
        no_grupo: statusFilter === 'all' ? undefined : (statusFilter === 'in'),
        is_admin: roleFilter === 'all' ? undefined : (roleFilter === 'admin')
      };
      const [res, resStats] = await Promise.all([
        axiosInstance.get('/contatos/', { params }),
        axiosInstance.get('/contatos/stats')
      ]);
      setContacts(res.data.items || []);
      setTotalContacts(res.data.total || 0);
      setStats(resStats.data || { total_contatos: 0, total_grupos: 0 });
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      showToast('Erro ao carregar contatos', 'error');
    } finally {
      setLoading(false);
    }
  }, [resultsPerPage, currentPage, search, groupFilter, statusFilter, roleFilter]);

  const handleDeleteSingle = (contact) => {
    const doDelete = async () => {
      try {
        await axiosInstance.delete(`/contatos/${contact.id}`);
        toastDeletado('Contato Excluído', `O contato ${contact.nome || contact.numero} foi removido.`);
        setSelectedIds(prev => prev.filter(i => i !== contact.id));
        fetchContacts();
      } catch (err) {
        console.error('Erro ao excluir contato:', err);
      }
    };

    if (typeof openConfirm === 'function') {
      openConfirm('Excluir Contato', `Tem certeza que deseja remover o contato "${contact.nome || contact.numero}"?`, doDelete);
    } else if (window.confirm(`Tem certeza que deseja remover o contato ${contact.nome || contact.numero}?`)) {
      doDelete();
    }
  };

  const handleDeleteBatch = () => {
    if (selectedIds.length === 0) return;
    const doDeleteBatch = async () => {
      try {
        await axiosInstance.post('/contatos/batch-delete', { ids: selectedIds });
        toastDeletado('Contatos Excluídos', `${selectedIds.length} contato(s) foram removidos do sistema.`);
        setSelectedIds([]);
        fetchContacts();
      } catch (err) {
        console.error('Erro ao excluir lote de contatos:', err);
      }
    };

    if (typeof openConfirm === 'function') {
      openConfirm('Excluir Contatos Selecionados', `Deseja excluir definitivamente os ${selectedIds.length} contato(s) selecionados?`, doDeleteBatch);
    } else if (window.confirm(`Deseja excluir os ${selectedIds.length} contatos selecionados?`)) {
      doDeleteBatch();
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = {
        search: search || undefined,
        jid_grupo: groupFilter || undefined,
        no_grupo: statusFilter === 'all' ? undefined : (statusFilter === 'in'),
        is_admin: roleFilter === 'all' ? undefined : (roleFilter === 'admin')
      };
      const response = await axiosInstance.get('/contatos/export', { 
        params, 
        responseType: 'blob' 
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contatos_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Exportação concluída!', 'success');
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      showToast('Erro na exportação', 'error');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    const handleConfigUpdated = () => {
      fetchInitialData();
      fetchContacts();
    };
    window.addEventListener('config-updated', handleConfigUpdated);
    return () => window.removeEventListener('config-updated', handleConfigUpdated);
  }, [fetchInitialData, fetchContacts]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchContacts();
    }, 500);
    return () => clearTimeout(timeout);
  }, [search, groupFilter, statusFilter, roleFilter, resultsPerPage]);

  useEffect(() => {
    fetchContacts();
  }, [currentPage]);

  const totalPages = Math.ceil(totalContacts / resultsPerPage) || 1;

  return {
    contacts,
    groups,
    loading,
    exporting,
    isImportModalOpen,
    setIsImportModalOpen,
    search,
    setSearch,
    groupFilter,
    setGroupFilter,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    totalContacts,
    stats,
    currentPage,
    setCurrentPage,
    resultsPerPage,
    setResultsPerPage,
    selectedIds,
    setSelectedIds,
    isSelectingAllFiltered,
    setIsSelectingAllFiltered,
    toast,
    showToast,
    totalPages,
    toggleSelect,
    toggleSelectPage,
    handleSelectAllFiltered,
    handleDeleteSingle,
    handleDeleteBatch,
    handleExportCSV,
    fetchContacts,
    fetchInitialData
  };
};

export default useContacts;
