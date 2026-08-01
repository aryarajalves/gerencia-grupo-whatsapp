import React from 'react';
import { Users, RefreshCw, PlusCircle, Pencil, ListChecks } from 'lucide-react';
import { useGroups } from '../../hooks/useGroups';
import { useCopy } from '../../hooks/useCopy';
import GroupForm from './components/GroupForm';
import GroupsTable from './components/GroupsTable';
import MessagesModal from './components/MessagesModal';

const GerenciarGrupos = ({ grupos, setGrupos, mensagens, onRefresh, openConfirm }) => {
  const {
    activeSubTab, setActiveSubTab,
    novoGrupo, setNovoGrupo,
    editingId, processing,
    wapiGrupos, wapiLoading, wapiErro,
    handleSubmit, handleToggle, finalizeDelete, startEdit, cancelEdit,
    mensagensModalGrupo, setMensagensModalGrupo,
    mensagensAssociadas,
    loadingMensagens, savingMensagens,
    abrirModalMensagens, toggleMensagem, salvarMensagensDoGrupo,
    deletingId, setDeletingId, syncData,
    extrairContatosAgora,
    selectedGroupIds, toggleSelectGroup, toggleSelectAll, clearSelection, finalizeBulkDelete
  } = useGroups(onRefresh, setGrupos, openConfirm);

  const { copiedId, handleCopy } = useCopy();

  // Handle deletion confirmation
  React.useEffect(() => {
    if (deletingId) {
      const grupo = grupos.find(g => g.id === deletingId);
      if (grupo) {
        openConfirm({
          title: 'Confirmar Exclusão',
          message: `Tem certeza que deseja excluir o grupo "${grupo.nome}"? Esta ação removerá o monitoramento e histórico deste grupo permanentemente.`,
          type: 'danger',
          confirmText: 'Excluir Grupo',
          onConfirm: () => finalizeDelete(deletingId)
        });
        setDeletingId(null);
      }
    }
  }, [deletingId, grupos, openConfirm, finalizeDelete, setDeletingId]);

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(37,99,235,0.25))', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={19} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 style={{ margin: 0 }}>Gerenciamento de Grupos</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', margin: 0 }}>Configure e monitore os grupos de lançamento do WhatsApp</p>
          </div>
        </div>
        
        <button 
          onClick={syncData}
          disabled={processing}
          className="btn-primary"
          style={{ 
            padding: '10px 20px', 
            fontSize: '0.875rem', 
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <RefreshCw size={16} className={processing ? 'spin' : ''} />
          {processing ? 'Sincronizando...' : 'Sincronizar Links/Dados'}
        </button>
      </div>

      {/* Navegação de Abas */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '1.5rem', 
        borderBottom: '1px solid var(--border)',
        paddingBottom: '12px'
      }}>
        <button
          onClick={cancelEdit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeSubTab === 'list' ? 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.15))' : 'rgba(255,255,255,0.03)',
            color: activeSubTab === 'list' ? '#fff' : 'var(--text-dim)',
            border: `1px solid ${activeSubTab === 'list' ? 'rgba(37,99,235,0.4)' : 'var(--border)'}`,
            boxShadow: activeSubTab === 'list' ? '0 4px 15px rgba(37,99,235,0.2)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          <ListChecks size={16} style={{ color: activeSubTab === 'list' ? 'var(--primary)' : 'inherit' }} />
          <span>Grupos Monitorados</span>
          <span style={{ 
            fontSize: '0.75rem', 
            background: activeSubTab === 'list' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', 
            color: '#fff', 
            padding: '2px 7px', 
            borderRadius: '12px' 
          }}>
            {grupos.length}
          </span>
        </button>

        <button
          onClick={() => {
            if (activeSubTab === 'form' && editingId) cancelEdit();
            else setActiveSubTab('form');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeSubTab === 'form' ? 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.15))' : 'rgba(255,255,255,0.03)',
            color: activeSubTab === 'form' ? '#fff' : 'var(--text-dim)',
            border: `1px solid ${activeSubTab === 'form' ? 'rgba(124,58,237,0.4)' : 'var(--border)'}`,
            boxShadow: activeSubTab === 'form' ? '0 4px 15px rgba(124,58,237,0.2)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          {editingId ? (
            <>
              <Pencil size={16} style={{ color: '#f59e0b' }} />
              <span>Editar Grupo</span>
              <span style={{ fontSize: '0.7rem', background: '#f59e0b', color: '#000', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>Editando</span>
            </>
          ) : (
            <>
              <PlusCircle size={16} style={{ color: 'var(--accent)' }} />
              <span>Cadastrar Novo Grupo</span>
            </>
          )}
        </button>
      </div>

      {/* Conteúdo da Aba Ativa */}
      {activeSubTab === 'form' ? (
        <GroupForm 
          novoGrupo={novoGrupo}
          setNovoGrupo={setNovoGrupo}
          onSubmit={handleSubmit}
          onCancel={cancelEdit}
          editingId={editingId}
          processing={processing}
          wapiGrupos={wapiGrupos}
          wapiLoading={wapiLoading}
          wapiErro={wapiErro}
        />
      ) : (
        <GroupsTable 
          grupos={grupos}
          editingId={editingId}
          copiedId={copiedId}
          handleCopy={handleCopy}
          abrirModalMensagens={abrirModalMensagens}
          startEdit={startEdit}
          handleToggle={handleToggle}
          setDeletingId={setDeletingId}
          onOpenNewGroupForm={() => setActiveSubTab('form')}
          extrairContatosAgora={extrairContatosAgora}
          openConfirm={openConfirm}
          selectedGroupIds={selectedGroupIds}
          toggleSelectGroup={toggleSelectGroup}
          toggleSelectAll={toggleSelectAll}
          clearSelection={clearSelection}
          finalizeBulkDelete={finalizeBulkDelete}
        />
      )}


      {mensagensModalGrupo && (
        <MessagesModal 
          grupo={mensagensModalGrupo}
          mensagens={mensagens}
          mensagensAssociadas={mensagensAssociadas}
          toggleMensagem={toggleMensagem}
          onSave={salvarMensagensDoGrupo}
          onClose={() => setMensagensModalGrupo(null)}
          loading={loadingMensagens}
          saving={savingMensagens}
        />
      )}
    </div>
  );
};

export default GerenciarGrupos;
