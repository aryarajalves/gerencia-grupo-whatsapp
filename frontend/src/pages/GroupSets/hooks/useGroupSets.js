import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../../services/api';

export const useGroupSets = ({ openConfirm } = {}) => {
  const [sets, setSets] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSet, setEditingSet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [baseUrl, setBaseUrl] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    nome: '',
    slug: '',
    ativo: true,
    grupos: [], // { grupo_id, posicao, max_leads }
    social_links: [] // { icon: 'instagram', url: '...' }
  });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resSets, resGroups, resConfig] = await Promise.all([
        axiosInstance.get('/conjuntos/'),
        axiosInstance.get('/grupos/'),
        axiosInstance.get('/config/')
      ]);
      setSets(Array.isArray(resSets.data) ? resSets.data : []);
      setAvailableGroups(Array.isArray(resGroups.data) ? resGroups.data : []);
      setBaseUrl(resConfig.data?.BASE_URL || window.location.origin.replace('5173', '8000').replace('5176', '8000'));
    } catch (error) {
      showToast('Erro ao buscar dados', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const handleConfigUpdated = () => fetchData();
    window.addEventListener('config-updated', handleConfigUpdated);

    return () => {
      window.removeEventListener('config-updated', handleConfigUpdated);
    };
  }, [fetchData]);

  const handleOpenCreate = () => {
    setEditingSet(null);
    setFormData({ nome: '', slug: '', ativo: true, grupos: [], social_links: [] });
    setShowModal(true);
  };

  const handleOpenEdit = (set) => {
    setEditingSet(set);
    setFormData({
      nome: set.nome,
      slug: set.slug,
      ativo: set.ativo,
      grupos: (set.grupos || []).map(g => ({
        grupo_id: g.grupo_id,
        posicao: g.posicao,
        max_leads: g.max_leads
      })),
      social_links: set.social_links ? (typeof set.social_links === 'string' ? JSON.parse(set.social_links) : set.social_links) : []
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const doDelete = async () => {
      try {
        await axiosInstance.delete(`/conjuntos/${id}`);
        showToast('Conjunto excluído', 'success');
        fetchData();
      } catch (error) {
        showToast('Erro ao excluir', 'error');
      }
    };

    if (typeof openConfirm === 'function') {
      openConfirm(
        'Excluir Conjunto',
        'Tem certeza que deseja excluir este conjunto? Todos os redirecionamentos para este link pararão de funcionar.',
        doDelete
      );
    } else if (window.confirm('Tem certeza que deseja excluir este conjunto?')) {
      doDelete();
    }
  };

  const handleAddGroup = (groupId) => {
    const idNum = typeof groupId === 'string' ? parseInt(groupId, 10) : groupId;
    if (formData.grupos.find(g => g.grupo_id === idNum || g.grupo_id === groupId)) {
      showToast('Grupo já adicionado', 'error');
      return;
    }
    const newPos = formData.grupos.length + 1;
    setFormData({
      ...formData,
      grupos: [...formData.grupos, { grupo_id: idNum, posicao: newPos, max_leads: 900 }]
    });
  };

  const handleRemoveGroup = (groupId) => {
    const filtered = formData.grupos.filter(g => g.grupo_id !== groupId);
    const reordered = filtered.map((g, idx) => ({ ...g, posicao: idx + 1 }));
    setFormData({ ...formData, grupos: reordered });
  };

  const handleUpdateMaxLeads = (groupId, value) => {
    const updated = formData.grupos.map(g => 
      g.grupo_id === groupId ? { ...g, max_leads: parseInt(value, 10) || 0 } : g
    );
    setFormData({ ...formData, grupos: updated });
  };

  const handleAddSocial = () => {
    setFormData({
      ...formData,
      social_links: [...formData.social_links, { icon: 'instagram', url: '' }]
    });
  };

  const handleRemoveSocial = (index) => {
    const updated = formData.social_links.filter((_, i) => i !== index);
    setFormData({ ...formData, social_links: updated });
  };

  const handleUpdateSocial = (index, field, value) => {
    const updated = formData.social_links.map((s, i) => 
      i === index ? { ...s, [field]: value } : s
    );
    setFormData({ ...formData, social_links: updated });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.slug) {
      showToast('Preencha os campos obrigatórios', 'error');
      return;
    }

    const payload = {
      ...formData,
      social_links: JSON.stringify(formData.social_links)
    };

    try {
      if (editingSet) {
        await axiosInstance.put(`/conjuntos/${editingSet.id}`, payload);
        showToast('Conjunto atualizado', 'success');
      } else {
        await axiosInstance.post('/conjuntos/', payload);
        showToast('Conjunto criado', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.detail || 'Erro ao salvar', 'error');
    }
  };

  const filteredSets = sets.filter(s => 
    (s.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.slug || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRedirectLink = (slug) => {
    return `${baseUrl}/join/${slug}`;
  };

  const copyToClipboard = (text) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    showToast('Link copiado!', 'success');
  };

  return {
    sets,
    availableGroups,
    loading,
    showModal,
    setShowModal,
    editingSet,
    searchTerm,
    setSearchTerm,
    toast,
    baseUrl,
    formData,
    setFormData,
    showToast,
    fetchData,
    handleOpenCreate,
    handleOpenEdit,
    handleDelete,
    handleAddGroup,
    handleRemoveGroup,
    handleUpdateMaxLeads,
    handleAddSocial,
    handleRemoveSocial,
    handleUpdateSocial,
    handleSave,
    filteredSets,
    getRedirectLink,
    copyToClipboard
  };
};

export default useGroupSets;
