import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import axiosInstance from '../../../services/api';
import { toast } from 'react-hot-toast';

const ImportMessagesModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const items = json.items || json.mensagens || (Array.isArray(json) ? json : null);

        if (!items || !Array.isArray(items) || items.length === 0) {
          setError('O arquivo selecionado não contém um roteiro de mensagens válido.');
          setParsedData(null);
          return;
        }

        setParsedData(items);
      } catch (err) {
        setError('Falha ao ler arquivo JSON. Certifique-se de que o arquivo está no formato correto.');
        setParsedData(null);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleConfirmImport = async () => {
    if (!parsedData || parsedData.length === 0) return;

    try {
      setLoading(true);
      const res = await axiosInstance.post('/mensagens/import', { items: parsedData });
      toast.success(res.data?.message || `${parsedData.length} mensagens importadas com sucesso!`);
      if (onImportSuccess) onImportSuccess();
      handleClose();
    } catch (err) {
      console.error('Erro ao importar mensagens:', err);
      toast.error(err.response?.data?.detail || 'Erro ao importar mensagens.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData(null);
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'rgba(23, 25, 35, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        width: '100%',
        maxWidth: '520px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(124,58,237,0.3))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(37,99,235,0.4)'
            }}>
              <Upload size={18} style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Importar Roteiro de Mensagens</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-dim)' }}>Carregue um arquivo JSON exportado de outro cliente</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* File Input Box */}
          <label style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            border: '2px dashed rgba(255,255,255,0.15)',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.02)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'center'
          }}>
            <FileText size={32} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
              {file ? file.name : 'Clique para selecionar o arquivo .json'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Formatos aceitos: JSON contendo array de templates de mensagem
            </span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>

          {/* Erro */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171', fontSize: '0.85rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Resumo do Arquivo Lido */}
          {parsedData && (
            <div style={{
              padding: '12px 16px', borderRadius: '12px',
              background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontSize: '0.9rem', fontWeight: 600 }}>
                <CheckCircle2 size={18} />
                <span>Roteiro Valido Identificado</span>
              </div>
              <span style={{ fontSize: '0.8rem', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', padding: '3px 8px', borderRadius: '8px', fontWeight: 700 }}>
                {parsedData.length} mensagem(ns)
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '10px',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-dim)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={!parsedData || loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '8px',
              background: (!parsedData || loading) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: (!parsedData || loading) ? 'not-allowed' : 'pointer',
              boxShadow: (!parsedData || loading) ? 'none' : '0 4px 15px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            {loading ? <Loader2 size={16} className="spin" /> : <Upload size={16} />}
            <span>Importar Mensagens</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportMessagesModal;
