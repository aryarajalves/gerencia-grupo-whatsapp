import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useGroupSets } from './hooks/useGroupSets';
import GroupSetsHeader from './components/GroupSetsHeader';
import GroupSetsStats from './components/GroupSetsStats';
import GroupSetsSearchBar from './components/GroupSetsSearchBar';
import GroupSetsList from './components/GroupSetsList';
import GroupSetModal from './components/GroupSetModal';

const GroupSets = ({ openConfirm }) => {
  const {
    sets,
    availableGroups,
    loading,
    showModal,
    setShowModal,
    editingSet,
    searchTerm,
    setSearchTerm,
    toast,
    formData,
    setFormData,
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
  } = useGroupSets({ openConfirm });

  const activeSetsCount = sets.filter(s => s.ativo).length;

  return (
    <div className="fade-in" style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
      {/* Cabeçalho */}
      <GroupSetsHeader onOpenCreate={handleOpenCreate} />

      {/* Estatísticas */}
      <GroupSetsStats 
        totalSets={sets.length} 
        activeSets={activeSetsCount} 
      />

      {/* Barra de Busca */}
      <GroupSetsSearchBar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
      />

      {/* Listagem de Conjuntos */}
      <GroupSetsList
        filteredSets={filteredSets}
        loading={loading}
        getRedirectLink={getRedirectLink}
        copyToClipboard={copyToClipboard}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      {/* Modal de Criação / Edição */}
      <GroupSetModal
        showModal={showModal}
        editingSet={editingSet}
        formData={formData}
        setFormData={setFormData}
        availableGroups={availableGroups}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        handleAddGroup={handleAddGroup}
        handleRemoveGroup={handleRemoveGroup}
        handleUpdateMaxLeads={handleUpdateMaxLeads}
        handleAddSocial={handleAddSocial}
        handleRemoveSocial={handleRemoveSocial}
        handleUpdateSocial={handleUpdateSocial}
      />

      {/* Toast Feedback */}
      {toast.show && (
        <div className="fade-in" style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 10000, padding: '1rem 1.5rem', borderRadius: '14px', background: toast.type === 'error' ? 'var(--danger)' : toast.type === 'success' ? '#10b981' : 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)' }}>
          {toast.type === 'error' ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default GroupSets;
