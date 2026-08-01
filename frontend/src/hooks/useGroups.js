import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../services/api';
import { toast } from 'react-hot-toast';
import { toastDeletado, toastExtraindo, toastSucesso, toastErro } from '../utils/toastNotifications';

const initialGroupState = { 
  nome: '', 
  id_do_grupo: '', 
  dia_inicio_semana: 0, 
  dia_fim_semana: 4, 
  ativo: true, 
  link_convite: '', 
  tipo_ciclo: 'semanal',
  extrair_contatos: true,
  intervalo_extracao_minutos: 30,
  webhook_extracao_url: ''
};

export const useGroups = (onRefresh, setGrupos, openConfirm) => {
  const [activeSubTab, setActiveSubTab] = useState('list'); // 'list' | 'form'
  const [novoGrupo, setNovoGrupo] = useState(initialGroupState);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [wapiGrupos, setWapiGrupos] = useState([]);
  const [wapiLoading, setWapiLoading] = useState(false);
  const [wapiErro, setWapiErro] = useState('');

  // Modal Mensagens
  const [mensagensModalGrupo, setMensagensModalGrupo] = useState(null);
  const [mensagensAssociadas, setMensagensAssociadas] = useState([]);
  const [loadingMensagens, setLoadingMensagens] = useState(false);
  const [savingMensagens, setSavingMensagens] = useState(false);

  const fetchWapiGrupos = async () => {
    setWapiLoading(true);
    setWapiErro('');
    try {
      const res = await axiosInstance.get('/wapi/grupos/');
      setWapiGrupos(res.data);
    } catch (err) {
      setWapiErro(err.response?.data?.detail || 'Erro ao buscar grupos da W-API');
    } finally {
      setWapiLoading(false);
    }
  };

  useEffect(() => {
    fetchWapiGrupos();
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setProcessing(true);
    try {
      if (editingId) {
        await axiosInstance.put(`/grupos/${editingId}`, novoGrupo);
        setEditingId(null);
      } else {
        await axiosInstance.post('/grupos/', novoGrupo);
      }
      setNovoGrupo(initialGroupState);
      setActiveSubTab('list');
      onRefresh();
    } catch (error) {
      openConfirm({
        title: 'Opa! Algo deu errado',
        message: 'Erro ao salvar grupo: ' + (error.response?.data?.detail || error.message),
        type: 'danger'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleToggle = async (id) => {
    // Optimistic Update
    setGrupos(prev => prev.map(g => g.id === id ? { ...g, ativo: !g.ativo } : g));
    
    try {
      await axiosInstance.patch(`/grupos/${id}/toggle`);
      // No need to refresh immediately if we updated locally
      // but we do it anyway to sync with server just in case
      onRefresh();
    } catch (error) {
      // Revert on error
      setGrupos(prev => prev.map(g => g.id === id ? { ...g, ativo: !g.ativo } : g));
      openConfirm({
        title: 'Erro de Conexão',
        message: 'Não foi possível alterar o status do grupo agora.',
        type: 'warning'
      });
    }
  };

  const finalizeDelete = async (id) => {
    let nomeGrupoExcluido = '';
    const backup = [];
    setGrupos(prev => {
      const g = prev.find(item => item.id === id);
      if (g) nomeGrupoExcluido = g.nome;
      backup.push(...prev.filter(item => item.id === id));
      return prev.filter(item => item.id !== id);
    });
    
    try {
      await axiosInstance.delete(`/grupos/${id}`);
      setDeletingId(null);
      toastDeletado(
        'Grupo Excluído com Sucesso!',
        nomeGrupoExcluido ? `O grupo "${nomeGrupoExcluido}" foi removido do sistema.` : 'O grupo foi removido com sucesso.'
      );
      onRefresh();
    } catch (error) {
      // Revert on error
      setGrupos(prev => [...prev, ...backup]);
      openConfirm({
        title: 'Erro ao Excluir',
        message: 'Ocorreu uma falha ao tentar remover este grupo.',
        type: 'danger'
      });
    }
  };

  const startEdit = (grupo) => {
    setDeletingId(null);
    setEditingId(grupo.id);
    setNovoGrupo({
      nome: grupo.nome,
      id_do_grupo: grupo.id_do_grupo,
      dia_inicio_semana: grupo.dia_inicio_semana,
      dia_fim_semana: grupo.dia_fim_semana || 4,
      ativo: grupo.ativo,
      link_convite: grupo.link_convite || '',
      tipo_ciclo: grupo.tipo_ciclo || 'semanal',
      extrair_contatos: grupo.extrair_contatos !== undefined ? grupo.extrair_contatos : true,
      intervalo_extracao_minutos: grupo.intervalo_extracao_minutos || 30,
      webhook_extracao_url: grupo.webhook_extracao_url || ''
    });
    setActiveSubTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDeletingId(null);
    setNovoGrupo(initialGroupState);
    setActiveSubTab('list');
  };

  const abrirModalMensagens = async (grupo) => {
    setMensagensModalGrupo(grupo);
    setLoadingMensagens(true);
    try {
      const res = await axiosInstance.get(`/grupos/${grupo.id}/mensagens/`);
      setMensagensAssociadas(res.data);
    } catch {
      setMensagensAssociadas([]);
    } finally {
      setLoadingMensagens(false);
    }
  };

  const toggleMensagem = (id) => {
    setMensagensAssociadas(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const salvarMensagensDoGrupo = async () => {
    setSavingMensagens(true);
    try {
      const res = await axiosInstance.get(`/grupos/${mensagensModalGrupo.id}/mensagens/`);
      const atual = res.data;
      const adicionar = mensagensAssociadas.filter(id => !atual.includes(id));
      const remover = atual.filter(id => !mensagensAssociadas.includes(id));
      await Promise.all([
        ...adicionar.map(id => axiosInstance.post(`/grupos/${mensagensModalGrupo.id}/mensagens/${id}`)),
        ...remover.map(id => axiosInstance.delete(`/grupos/${mensagensModalGrupo.id}/mensagens/${id}`)),
      ]);
      setMensagensModalGrupo(null);
    } catch (err) {
      openConfirm({
        title: 'Falha no Salvamento',
        message: 'Erro ao salvar: ' + (err.response?.data?.detail || err.message),
        type: 'danger'
      });
    } finally {
      setSavingMensagens(false);
    }
  };

  const syncData = async () => {
    setProcessing(true);
    try {
      await axiosInstance.post('/grupos/sync');
      onRefresh();
      openConfirm({
        title: 'Sucesso Total!',
        message: 'Sincronização concluída com sucesso (Contatos e Links).',
        type: 'success'
      });
    } catch (error) {
      openConfirm({
        title: 'Erro na Sincronização',
        message: 'Ocorreu um problema ao sincronizar: ' + (error.response?.data?.detail || error.message),
        type: 'warning'
      });
    } finally {
      setProcessing(false);
    }
  };

  const extrairContatosAgora = async (grupoId, grupoNome = '') => {
    const toastId = toastExtraindo(grupoNome);
    setProcessing(true);
    try {
      const res = await axiosInstance.post(`/grupos/${grupoId}/extrair-contatos`);
      toast.dismiss(toastId);
      onRefresh();
      window.dispatchEvent(new CustomEvent('config-updated'));
      toastSucesso('Extração Concluída!', res.data.message || 'Contatos extraídos com sucesso!');
    } catch (error) {
      toast.dismiss(toastId);
      toastErro('Erro na Extração', error.response?.data?.detail || 'Ocorreu um problema ao extrair contatos.');
    } finally {
      setProcessing(false);
    }
  };


  // Seleção em Massa
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);

  const toggleSelectGroup = (id) => {
    setSelectedGroupIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (gruposParaSelecionar) => {
    const ids = gruposParaSelecionar.map(g => g.id);
    const todosJaSelecionados = ids.every(id => selectedGroupIds.includes(id));
    if (todosJaSelecionados) {
      setSelectedGroupIds(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelectedGroupIds(prev => Array.from(new Set([...prev, ...ids])));
    }
  };

  const clearSelection = () => setSelectedGroupIds([]);

  const finalizeBulkDelete = async (idsParaDeletar) => {
    const ids = idsParaDeletar || selectedGroupIds;
    if (ids.length === 0) return;

    setProcessing(true);
    try {
      const res = await axiosInstance.post('/grupos/bulk-delete', { grupo_ids: ids });
      toastDeletado(
        'Grupos Excluídos com Sucesso!',
        res.data.message || `${ids.length} grupos foram removidos permanentemente.`
      );
      setSelectedGroupIds([]);
      onRefresh();
    } catch (error) {
      openConfirm({
        title: 'Erro na Exclusão em Massa',
        message: 'Ocorreu uma falha ao excluir os grupos selecionados: ' + (error.response?.data?.detail || error.message),
        type: 'danger'
      });
    } finally {
      setProcessing(false);
    }
  };


  return {
    activeSubTab, setActiveSubTab,
    novoGrupo, setNovoGrupo,
    editingId, setEditingId,
    deletingId, setDeletingId,
    processing,
    wapiGrupos, wapiLoading, wapiErro,
    handleSubmit, handleToggle, finalizeDelete, startEdit, cancelEdit,
    mensagensModalGrupo, setMensagensModalGrupo,
    mensagensAssociadas, setMensagensAssociadas,
    loadingMensagens, savingMensagens,
    abrirModalMensagens, toggleMensagem, salvarMensagensDoGrupo,
    syncData,
    extrairContatosAgora,
    selectedGroupIds, setSelectedGroupIds,
    toggleSelectGroup, toggleSelectAll, clearSelection, finalizeBulkDelete
  };
};

