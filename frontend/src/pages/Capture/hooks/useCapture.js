import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../../services/api';
import { useCopy } from '../../../hooks/useCopy';
import { toastDeletado } from '../../../utils/toastNotifications';

export const useCapture = ({ openConfirm } = {}) => {
  const [activeTab, setActiveTab] = useState('mensagens'); // 'mensagens' | 'webhook'
  const [mensagens, setMensagens] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [filtroOrigem, setFiltroOrigem] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [webhookUrl, setWebhookUrl] = useState('');

  const { copiedId, handleCopy } = useCopy();

  const fetchWebhookUrl = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/captura/webhook-url');
      setWebhookUrl(res.data.url);
    } catch (err) {
      console.error('Erro ao buscar URL do webhook:', err);
    }
  }, []);

  const fetchGrupos = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/grupos/');
      setGrupos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Erro ao buscar lista de grupos:', err);
      setGrupos([]);
    }
  }, []);

  const fetchMensagens = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/captura/mensagens/', {
        params: {
          limit: resultsPerPage,
          offset: (currentPage - 1) * resultsPerPage,
          search: searchTerm || undefined,
          group_jid: filtroGrupo || undefined,
          origem: filtroOrigem || undefined,
          data_inicio: filtroDataInicio || undefined,
          data_fim: filtroDataFim || undefined
        }
      });
      setMensagens(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar capturas:', error);
    } finally {
      setLoading(false);
    }
  }, [resultsPerPage, currentPage, searchTerm, filtroGrupo, filtroOrigem, filtroDataInicio, filtroDataFim]);

  useEffect(() => {
    fetchWebhookUrl();
    fetchGrupos();

    const handleConfigUpdated = () => {
      fetchWebhookUrl();
      fetchGrupos();
      fetchMensagens();
    };
    window.addEventListener('config-updated', handleConfigUpdated);

    return () => {
      window.removeEventListener('config-updated', handleConfigUpdated);
    };
  }, [fetchWebhookUrl, fetchGrupos, fetchMensagens]);

  useEffect(() => {
    fetchMensagens();
    const interval = setInterval(fetchMensagens, 15000);
    return () => clearInterval(interval);
  }, [fetchMensagens]);

  const handleDelete = (id) => {
    const doDelete = async () => {
      try {
        await axiosInstance.delete(`/captura/mensagens/${id}`);
        toastDeletado('Mensagem Capturada Excluída', 'A mensagem foi removida do histórico de capturas.');
        setSelectedIds(prev => prev.filter(item => item !== id));
        fetchMensagens();
      } catch (err) {
        console.error('Erro ao excluir captura:', err);
      }
    };

    if (typeof openConfirm === 'function') {
      openConfirm('Excluir Captura', 'Deseja remover este registro de captura?', doDelete);
    } else if (window.confirm('Deseja remover este registro de captura?')) {
      doDelete();
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === mensagens.length && mensagens.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(mensagens.map(m => m.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    const doDeleteBatch = async () => {
      try {
        await Promise.all(selectedIds.map(id => axiosInstance.delete(`/captura/mensagens/${id}`)));
        toastDeletado('Capturas Excluídas', `${selectedIds.length} capturas foram removidas.`);
        setSelectedIds([]);
        fetchMensagens();
      } catch (err) {
        console.error('Erro ao excluir algumas capturas:', err);
      }
    };

    if (typeof openConfirm === 'function') {
      openConfirm(
        'Excluir Selecionados',
        `Deseja remover permanentemente as ${selectedIds.length} capturas selecionadas?`,
        doDeleteBatch
      );
    } else if (window.confirm(`Deseja remover permanentemente as ${selectedIds.length} capturas selecionadas?`)) {
      doDeleteBatch();
    }
  };

  const totalPages = Math.ceil(total / resultsPerPage) || 1;

  const limparFiltros = () => {
    setSearchTerm('');
    setFiltroGrupo('');
    setFiltroOrigem('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setCurrentPage(1);
  };

  return {
    activeTab,
    setActiveTab,
    mensagens,
    grupos,
    loading,
    total,
    currentPage,
    setCurrentPage,
    resultsPerPage,
    setResultsPerPage,
    searchTerm,
    setSearchTerm,
    filtroGrupo,
    setFiltroGrupo,
    filtroOrigem,
    setFiltroOrigem,
    filtroDataInicio,
    setFiltroDataInicio,
    filtroDataFim,
    setFiltroDataFim,
    selectedIds,
    setSelectedIds,
    webhookUrl,
    copiedId,
    handleCopy,
    fetchWebhookUrl,
    fetchGrupos,
    fetchMensagens,
    handleDelete,
    toggleSelect,
    toggleSelectAll,
    handleDeleteSelected,
    limparFiltros,
    totalPages
  };
};

export default useCapture;
