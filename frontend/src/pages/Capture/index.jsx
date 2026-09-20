import React from 'react';
import { useCapture } from './hooks/useCapture';
import CaptureHeader from './components/CaptureHeader';
import CaptureWebhookTab from './components/CaptureWebhookTab';
import CaptureFilters from './components/CaptureFilters';
import CaptureTable from './components/CaptureTable';

const CapturaMensagens = ({ openConfirm }) => {
  const {
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
    webhookUrl,
    copiedId,
    handleCopy,
    handleDelete,
    toggleSelect,
    toggleSelectAll,
    handleDeleteSelected,
    limparFiltros,
    totalPages
  } = useCapture({ openConfirm });

  return (
    <div className="fade-in">
      {/* Header com Seletor de Abas */}
      <CaptureHeader 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Conteúdo da Aba 2: Webhook URL */}
      {activeTab === 'webhook' && (
        <CaptureWebhookTab
          webhookUrl={webhookUrl}
          copiedId={copiedId}
          handleCopy={handleCopy}
        />
      )}

      {/* Conteúdo da Aba 1: Lista e Filtros */}
      {activeTab === 'mensagens' && (
        <div className="fade-in">
          <CaptureFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filtroGrupo={filtroGrupo}
            setFiltroGrupo={setFiltroGrupo}
            filtroOrigem={filtroOrigem}
            setFiltroOrigem={setFiltroOrigem}
            filtroDataInicio={filtroDataInicio}
            setFiltroDataInicio={setFiltroDataInicio}
            filtroDataFim={filtroDataFim}
            setFiltroDataFim={setFiltroDataFim}
            resultsPerPage={resultsPerPage}
            setResultsPerPage={setResultsPerPage}
            setCurrentPage={setCurrentPage}
            grupos={grupos}
            limparFiltros={limparFiltros}
          />

          <CaptureTable
            mensagens={mensagens}
            selectedIds={selectedIds}
            total={total}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            toggleSelect={toggleSelect}
            toggleSelectAll={toggleSelectAll}
            handleDelete={handleDelete}
            handleDeleteSelected={handleDeleteSelected}
          />
        </div>
      )}
    </div>
  );
};

export default CapturaMensagens;
