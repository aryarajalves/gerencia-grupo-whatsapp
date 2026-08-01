import React, { useState } from 'react';
import { Send, PlusCircle, Pencil, ListChecks, Download, Upload } from 'lucide-react';
import { useScheduling } from '../../hooks/useScheduling';
import MessageForm from './components/MessageForm';
import MessagesList from './components/MessagesList';
import ImportMessagesModal from './components/ImportMessagesModal';
import axiosInstance from '../../services/api';
import { toast } from 'react-hot-toast';

const AgendarMensagens = ({ mensagens, grupos, onRefresh, openConfirm }) => {
  const {
    activeSubTab, setActiveSubTab,
    novaMensagem, setNovaMensagem,
    editingId, processing,
    file, setFile, previewUrl, setPreviewUrl, uploadProgress,
    handleFileChange, handleSubmit, startEdit, cancelEdit, handleDelete
  } = useScheduling(onRefresh);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExportMessages = async () => {
    try {
      setExporting(true);
      const res = await axiosInstance.get('/mensagens/export');
      const data = res.data;

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `roteiro_mensagens_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`${data.total_messages || 0} mensagens exportadas com sucesso!`);
    } catch (err) {
      console.error('Erro ao exportar mensagens:', err);
      toast.error('Erro ao exportar o roteiro de mensagens.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(37,99,235,0.25), rgba(124,58,237,0.25))', border: '1px solid rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Send size={19} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h1 style={{ margin: 0 }}>Roteiro de Mensagens</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', margin: 0 }}>Configure a sequência de disparos para o funil de vendas</p>
          </div>
        </div>

        {/* Botões de Exportar e Importar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleExportMessages}
            disabled={exporting || (mensagens || []).length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 14px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: (exporting || (mensagens || []).length === 0) ? 'not-allowed' : 'pointer',
              background: 'rgba(255,255,255,0.05)',
              color: (exporting || (mensagens || []).length === 0) ? 'var(--text-dim)' : '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s'
            }}
            title="Exportar roteiro de mensagens em arquivo JSON"
          >
            <Download size={16} />
            <span>Exportar Roteiro</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 14px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.2))',
              color: '#a78bfa',
              border: '1px solid rgba(167, 139, 250, 0.3)',
              transition: 'all 0.2s'
            }}
            title="Importar roteiro de mensagens a partir de um arquivo JSON"
          >
            <Upload size={16} />
            <span>Importar Roteiro</span>
          </button>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '1.5rem', 
        borderBottom: '1px solid var(--border)',
        paddingBottom: '12px'
      }}>
        <button
          onClick={() => setActiveSubTab('list')}
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
          <span>Roteiro Configurado</span>
          <span style={{ 
            fontSize: '0.75rem', 
            background: activeSubTab === 'list' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', 
            color: '#fff', 
            padding: '2px 7px', 
            borderRadius: '12px' 
          }}>
            {(mensagens || []).length}
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
              <span>Editar Template</span>
              <span style={{ fontSize: '0.7rem', background: '#f59e0b', color: '#000', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>Editando</span>
            </>
          ) : (
            <>
              <PlusCircle size={16} style={{ color: 'var(--accent)' }} />
              <span>Cadastrar Novo Template</span>
            </>
          )}
        </button>
      </div>

      {/* Conteúdo da Aba Ativa */}
      {activeSubTab === 'form' ? (
        <MessageForm 
          novaMensagem={novaMensagem}
          setNovaMensagem={setNovaMensagem}
          onSubmit={handleSubmit}
          onCancel={cancelEdit}
          editingId={editingId}
          processing={processing}
          file={file}
          previewUrl={previewUrl}
          setFile={setFile}
          setPreviewUrl={setPreviewUrl}
          uploadProgress={uploadProgress}
          handleFileChange={handleFileChange}
          grupos={grupos || []}
        />
      ) : (
        <MessagesList 
          mensagens={mensagens}
          onEdit={startEdit}
          onDelete={handleDelete}
          openConfirm={openConfirm}
          editingId={editingId}
          onOpenNewForm={() => setActiveSubTab('form')}
        />
      )}

      {/* Modal de Importação de Roteiro */}
      <ImportMessagesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={onRefresh}
      />
    </div>
  );
};

export default AgendarMensagens;
