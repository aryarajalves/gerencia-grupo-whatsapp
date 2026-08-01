import { useState } from 'react';
import axiosInstance from '../services/api';
import { toast } from 'react-hot-toast';
import { toastPlanoInsuficiente } from '../utils/toastPlano';
import { toastDeletado } from '../utils/toastNotifications';
import { useWaStatus } from '../contexts/WaStatusContext';

export const useScheduling = (onRefresh) => {
  const { waStatus } = useWaStatus();
  const [activeSubTab, setActiveSubTab] = useState('list'); // 'list' | 'form'
  const [novaMensagem, setNovaMensagem] = useState({ 
    mensagem: '', 
    horario_do_disparo: '', 
    dia_do_lancamento: 1, 
    tipo_de_mensagem: 'texto', 
    link_midia: '',
    opcoes_enquete: '',
    enquete_multipla: false,
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

      if (file) {
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
        dia_do_lancamento: 1, 
        tipo_de_mensagem: 'texto', 
        link_midia: '',
        opcoes_enquete: '',
        enquete_multipla: false,
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
    setNovaMensagem({
      mensagem: m.mensagem || '',
      horario_do_disparo: m.horario_do_disparo || '',
      dia_do_lancamento: m.dia_do_lancamento || 1,
      tipo_de_mensagem: m.tipo_de_mensagem || 'texto',
      link_midia: m.link_midia || '',
      opcoes_enquete: m.opcoes_enquete || '',
      enquete_multipla: m.enquete_multipla || false,
      grupo_ids: m.grupo_ids || []
    });
    setPreviewUrl(m.link_midia);
    setActiveSubTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNovaMensagem({ 
      mensagem: '', 
      horario_do_disparo: '', 
      dia_do_lancamento: 1, 
      tipo_de_mensagem: 'texto', 
      link_midia: '',
      opcoes_enquete: '',
      enquete_multipla: false,
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
          toast.error(error.response?.data?.detail || 'Erro ao excluir mensagem');
        } finally {
          setProcessing(false);
        }
      }
    );
  };

  return {
    activeSubTab, setActiveSubTab,
    novaMensagem, setNovaMensagem,
    editingId, processing,
    file, setFile, previewUrl, setPreviewUrl, uploadProgress,
    handleFileChange, handleSubmit, startEdit, cancelEdit, handleDelete
  };
};
