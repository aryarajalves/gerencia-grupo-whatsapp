import { useState } from 'react';
import axiosInstance from '../services/api';
import { toast } from 'react-hot-toast';
import { toastPlanoInsuficiente } from '../utils/toastPlano';
import { toastDeletado } from '../utils/toastNotifications';
import { useWaStatus } from '../contexts/WaStatusContext';

const extractErrorMessage = (error, defaultMsg = 'Ocorreu um erro na operação') => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map(item => typeof item === 'string' ? item : item.msg || JSON.stringify(item)).join('; ');
  }
  if (detail && typeof detail === 'object') {
    return detail.msg || JSON.stringify(detail);
  }
  return error?.message || defaultMsg;
};

export const useScheduling = (onRefresh, mensagens = []) => {
  const { waStatus } = useWaStatus();

  // Calcular o maior dia de lançamento entre as mensagens existentes
  const getMaxDay = (msgs) => {
    if (!msgs || msgs.length === 0) return 1;
    return Math.max(...msgs.map(m => m.dia_do_lancamento || 1));
  };

  const [activeSubTab, setActiveSubTab] = useState('list'); // 'list' | 'form'
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDay, setActiveDay] = useState('ALL');
  const [activeTag, setActiveTag] = useState('ALL');
  const [activeType, setActiveType] = useState('ALL');

  const [novaMensagem, setNovaMensagem] = useState({ 
    mensagem: '', 
    horario_do_disparo: '', 
    dia_do_lancamento: getMaxDay(mensagens), 
    tipo_de_mensagem: 'texto', 
    link_midia: '',
    opcoes_enquete: '',
    enquete_multipla: false,
    webhook_enquete_ativo: true,
    admin_only_settings: null,
    etiqueta: '',
    grupo_ids: []
  });
  const [editingId, setEditingId] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Validação de Plano para Enquete
    if (novaMensagem.tipo_de_mensagem === 'enquete' && waStatus?.plan_type === 'LITE') {
      toastPlanoInsuficiente('O disparo de enquetes é um recurso exclusivo do plano PRO da W-API.');
      return;
    }

    setProcessing(true);
    setUploadProgress(0);
    try {
      let finalLink = novaMensagem.link_midia;

      if (novaMensagem.tipo_de_mensagem === 'status_grupo') {
        const action = (novaMensagem.link_midia === 'abrir' || novaMensagem.mensagem === 'abrir') ? 'abrir' : 'fechar';
        const optText = (novaMensagem.mensagem === 'fechar' || novaMensagem.mensagem === 'abrir') ? '' : (novaMensagem.mensagem || '');
        finalLink = action;
        novaMensagem.mensagem = optText;
      } else if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await axiosInstance.post('/upload/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total))
        });
        finalLink = uploadRes.data.url;
      }

      const payload = { ...novaMensagem, link_midia: finalLink };

      if (editingId) {
        await axiosInstance.put(`/mensagens/${editingId}`, payload);
        setEditingId(null);
      } else {
        await axiosInstance.post('/mensagens/', payload);
      }

      setNovaMensagem({ 
        mensagem: '', 
        horario_do_disparo: '', 
        dia_do_lancamento: getMaxDay(mensagens), 
        tipo_de_mensagem: 'texto', 
        link_midia: '',
        opcoes_enquete: '',
        enquete_multipla: false,
        webhook_enquete_ativo: true,
        admin_only_settings: null,
        etiqueta: '',
        grupo_ids: []
      });
      setFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
      setActiveSubTab('list');
      onRefresh();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      const detail = error.response?.data?.detail;
      const errorMsg = typeof detail === 'string' ? detail : JSON.stringify(detail);
      alert('Erro ao salvar: ' + (errorMsg || error.message));
    } finally {
      setProcessing(false);
    }
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setFile(null);
    setUploadProgress(0);
    const isStatus = (m.tipo_de_mensagem === 'status_grupo');
    const act = m.link_midia || (m.mensagem === 'abrir' ? 'abrir' : 'fechar');
    const txt = (m.mensagem === 'fechar' || m.mensagem === 'abrir') ? '' : (m.mensagem || '');

    setNovaMensagem({
      mensagem: isStatus ? txt : (m.mensagem || ''),
      horario_do_disparo: m.horario_do_disparo || '',
      dia_do_lancamento: m.dia_do_lancamento || 1,
      tipo_de_mensagem: m.tipo_de_mensagem || 'texto',
      link_midia: isStatus ? act : (m.link_midia || ''),
      opcoes_enquete: m.opcoes_enquete || '',
      enquete_multipla: m.enquete_multipla || false,
      webhook_enquete_ativo: m.webhook_enquete_ativo !== undefined ? m.webhook_enquete_ativo : true,
      admin_only_settings: m.admin_only_settings !== undefined ? m.admin_only_settings : null,
      etiqueta: m.etiqueta || '',
      grupo_ids: m.grupo_ids || []
    });
    setPreviewUrl(m.link_midia);
    setActiveSubTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openNewForm = () => {
    setEditingId(null);
    setNovaMensagem({ 
      mensagem: '', 
      horario_do_disparo: '', 
      dia_do_lancamento: getMaxDay(mensagens), 
      tipo_de_mensagem: 'texto', 
      link_midia: '',
      opcoes_enquete: '',
      enquete_multipla: false,
      webhook_enquete_ativo: true,
      admin_only_settings: null,
      etiqueta: '',
      grupo_ids: []
    });
    setFile(null);
    setPreviewUrl(null);
    setActiveSubTab('form');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNovaMensagem({ 
      mensagem: '', 
      horario_do_disparo: '', 
      dia_do_lancamento: getMaxDay(mensagens), 
      tipo_de_mensagem: 'texto', 
      link_midia: '',
      opcoes_enquete: '',
      enquete_multipla: false,
      webhook_enquete_ativo: true,
      admin_only_settings: null,
      etiqueta: '',
      grupo_ids: []
    });
    setFile(null);
    setPreviewUrl(null);
    setActiveSubTab('list');
  };

  const handleDelete = async (id, openConfirm) => {
    openConfirm(
      'Excluir Template',
      'Tem certeza que deseja remover esta mensagem do roteiro? Esta ação é irreversível.',
      async () => {
        setProcessing(true);
        try {
          await axiosInstance.delete(`/mensagens/${id}`);
          toastDeletado('Mensagem Agendada Excluída', 'A mensagem foi removida do roteiro.');
          onRefresh();
        } catch (error) {
          toast.error(extractErrorMessage(error, 'Erro ao excluir mensagem'));
        } finally {
          setProcessing(false);
        }
      }
    );
  };

  const handleBulkDelete = async (selectedIds, openConfirm, onSuccess) => {
    if (!selectedIds || selectedIds.length === 0) return;
    openConfirm(
      'Excluir Mensagens em Lote',
      `Tem certeza que deseja excluir ${selectedIds.length} mensagem(ns) selecionada(s)? Esta ação é irreversível.`,
      async () => {
        setProcessing(true);
        try {
          let res;
          try {
            res = await axiosInstance.delete('/mensagens/bulk', { data: { ids: selectedIds } });
          } catch (deleteErr) {
            // Fallback caso algum proxy ou cliente bloqueie corpo em DELETE
            if (deleteErr.response?.status === 405 || deleteErr.response?.status === 422) {
              res = await axiosInstance.post('/mensagens/bulk-delete', { ids: selectedIds });
            } else {
              throw deleteErr;
            }
          }
          toastDeletado('Mensagens Excluídas em Lote', res.data?.message || `${selectedIds.length} mensagens deletadas com sucesso.`);
          if (onSuccess) onSuccess();
          onRefresh();
        } catch (error) {
          toast.error(extractErrorMessage(error, 'Erro ao excluir mensagens em lote'));
        } finally {
          setProcessing(false);
        }
      }
    );
  };

  const handleBulkAssignGroups = async (selectedIds, grupoIds, onSuccess) => {
    if (!selectedIds || selectedIds.length === 0) return;
    setProcessing(true);
    try {
      const res = await axiosInstance.patch('/mensagens/bulk-grupos', { ids: selectedIds, grupo_ids: grupoIds });
      toast.success(res.data?.message || 'Grupos atualizados com sucesso!');
      if (onSuccess) onSuccess();
      onRefresh();
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Erro ao atribuir grupos em lote'));
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkDuplicate = async (selectedIds, diaDoLancamento, grupoIds, onSuccess) => {
    if (!selectedIds || selectedIds.length === 0) return;
    setProcessing(true);
    try {
      const res = await axiosInstance.post('/mensagens/bulk-duplicate', { 
        ids: selectedIds, 
        dia_do_lancamento: diaDoLancamento,
        grupo_ids: grupoIds 
      });
      toast.success(res.data?.message || `${selectedIds.length} mensagem(ns) duplicada(s) com sucesso!`);
      if (onSuccess) onSuccess();
      onRefresh();
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Erro ao duplicar mensagens em lote'));
    } finally {
      setProcessing(false);
    }
  };

  return {
    activeSubTab, setActiveSubTab,
    searchTerm, setSearchTerm,
    activeDay, setActiveDay,
    activeTag, setActiveTag,
    activeType, setActiveType,
    novaMensagem, setNovaMensagem,
    editingId, processing,
    file, setFile, previewUrl, setPreviewUrl, uploadProgress,
    handleFileChange, handleSubmit, startEdit, openNewForm, cancelEdit, handleDelete,
    handleBulkDelete, handleBulkAssignGroups, handleBulkDuplicate
  };
};
