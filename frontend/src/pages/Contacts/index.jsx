import React from 'react';
import { XCircle, CheckCircle2 } from 'lucide-react';
import { useContacts } from './hooks/useContacts';
import ContactsHeader from './components/ContactsHeader';
import ContactsFilters from './components/ContactsFilters';
import ContactsSelectionBanner from './components/ContactsSelectionBanner';
import ContactsTable from './components/ContactsTable';
import ImportContactsModal from './components/ImportContactsModal';
import { toastSucesso } from '../../utils/toastNotifications';

const Contacts = ({ openConfirm }) => {
  const {
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
    totalPages,
    toggleSelect,
    toggleSelectPage,
    handleSelectAllFiltered,
    handleDeleteSingle,
    handleDeleteBatch,
    handleExportCSV,
    fetchContacts,
    fetchInitialData
  } = useContacts({ openConfirm });

  return (
    <div className="fade-in">
      {/* Cabeçalho e Métricas */}
      <ContactsHeader stats={stats} />

      {/* Barra de Filtros e Ações */}
      <ContactsFilters
        search={search}
        setSearch={setSearch}
        groupFilter={groupFilter}
        setGroupFilter={setGroupFilter}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        resultsPerPage={resultsPerPage}
        setResultsPerPage={setResultsPerPage}
        setCurrentPage={setCurrentPage}
        groups={groups}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        totalContacts={totalContacts}
        isSelectingAllFiltered={isSelectingAllFiltered}
        setIsSelectingAllFiltered={setIsSelectingAllFiltered}
        handleSelectAllFiltered={handleSelectAllFiltered}
        handleDeleteBatch={handleDeleteBatch}
        setIsImportModalOpen={setIsImportModalOpen}
        handleExportCSV={handleExportCSV}
        exporting={exporting}
        fetchContacts={fetchContacts}
        loading={loading}
        contactsCount={contacts.length}
      />

      {/* Modal de Importação */}
      <ImportContactsModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        groups={groups}
        onSuccess={(msg) => {
          toastSucesso('Importação Concluída', msg);
          fetchInitialData();
          fetchContacts();
        }}
      />

      {/* Banner de Seleção Total */}
      <ContactsSelectionBanner
        selectedCount={selectedIds.length}
        totalContacts={totalContacts}
        onSelectAll={handleSelectAllFiltered}
      />

      {/* Tabela de Contatos e Paginação */}
      <ContactsTable
        contacts={contacts}
        selectedIds={selectedIds}
        loading={loading}
        totalContacts={totalContacts}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        toggleSelect={toggleSelect}
        toggleSelectPage={toggleSelectPage}
        handleDeleteSingle={handleDeleteSingle}
      />

      {/* Toast Feedback */}
      {toast.show && (
        <div className="fade-in" style={{
          position: 'fixed', bottom: '30px', right: '30px', zIndex: 10000,
          padding: '1rem 1.5rem', borderRadius: '12px',
          background: toast.type === 'error' ? 'var(--danger)' : 'var(--success)',
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

export default Contacts;
