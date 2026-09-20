import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import axiosInstance from '../../../services/api';
import { toast } from 'react-hot-toast';
import ModalPortal from '../../../components/common/ModalPortal';
import AITextInput from './AITextInput';
import AIPreviewList from './AIPreviewList';

const ImportMessagesModal = ({ isOpen, onClose, onImportSuccess, grupos = [] }) => {
  const [activeTab, setActiveTab] = useState('file'); // 'file' | 'ai'
  const [isMaximized, setIsMaximized] = useState(false);

  // Estado da aba JSON
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Estado da aba IA
  const [rawText, setRawText] = useState('');
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiStep, setAiStep] = useState('input'); // 'input' | 'preview'
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiError, setAiError] = useState('');

  // Ao abrir o modal, inicializa grupos selecionados com todos os grupos ativos
  useEffect(() => {
    if (isOpen && grupos.length > 0 && selectedGroupIds.length === 0) {
      setSelectedGroupIds(grupos.map(g => g.id));
    }
  }, [isOpen, grupos]);

  if (!isOpen) return null;

  // Lógica da Aba JSON
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

  const handleConfirmImportJSON = async () => {
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

  // Lógica da Aba IA
  const handleProcessAI = async () => {
    if (!rawText.trim()) return;

    setAiProcessing(true);
    setAiError('');
    try {
      const res = await axiosInstance.post('/mensagens/parse-roteiro-ia', { texto: rawText });
      const extraidas = res.data?.mensagens || [];
      if (extraidas.length === 0) {
        setAiError('A IA não conseguiu identificar mensagens no texto informado. Verifique e tente novamente.');
        return;
      }
      setAiMessages(extraidas);
      setAiStep('preview');
      toast.success(`${extraidas.length} mensagem(ns) identificada(s) pela IA!`);
    } catch (err) {
      console.error('Erro ao processar roteiro com IA:', err);
      setAiError(err.response?.data?.detail || 'Erro ao comunicar com o assistente de IA.');
    } finally {
      setAiProcessing(false);
    }
  };

  const handleConfirmImportAI = async () => {
    if (!aiMessages || aiMessages.length === 0) return;

    try {
      setLoading(true);
      const res = await axiosInstance.post('/mensagens/import', {
        items: aiMessages,
        grupo_ids: selectedGroupIds
      });
      toast.success(res.data?.message || `${aiMessages.length} mensagens importadas e vinculadas aos grupos!`);
      if (onImportSuccess) onImportSuccess();
      handleClose();
    } catch (err) {
      console.error('Erro ao salvar mensagens da IA:', err);
      toast.error(err.response?.data?.detail || 'Erro ao salvar mensagens.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData(null);
    setError('');
    setLoading(false);
    setRawText('');
    setAiMessages([]);
    setAiStep('input');
    setAiError('');
    setAiProcessing(false);
    setIsMaximized(false);
    onClose();
  };

  return (
    <ModalPortal>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10000, padding: '1rem', animation: 'fadeIn 0.2s ease-out'
      }}>
      <div style={{
        background: 'rgba(23, 25, 35, 0.95)', border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        width: isMaximized ? '96vw' : '100%',
        maxWidth: isMaximized ? '1350px' : '580px',
        height: isMaximized ? '92vh' : 'auto',
        maxHeight: isMaximized ? '92vh' : '90vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header com Abas */}
        <div style={{
          padding: '1.25rem 1.5rem 0 1.5rem', borderBottom: '1px solid var(--border)',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
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
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {activeTab === 'file' ? 'Carregue um arquivo JSON exportado de outro cliente' : 'Cole um roteiro bruto e deixe a IA organizar automaticamente'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsMaximized(!isMaximized)}
                title={isMaximized ? "Restaurar tamanho normal" : "Maximizar popup"}
                style={{
                  background: isMaximized ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: isMaximized ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: isMaximized ? '#60a5fa' : 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={handleClose}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Abas */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('file')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', background: 'transparent', border: 'none',
                borderBottom: activeTab === 'file' ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === 'file' ? '#fff' : 'var(--text-dim)',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <FileText size={15} />
              <span>Arquivo JSON</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', background: 'transparent', border: 'none',
                borderBottom: activeTab === 'ai' ? '2px solid #8b5cf6' : '2px solid transparent',
                color: activeTab === 'ai' ? '#c4b5fd' : 'var(--text-dim)',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <Sparkles size={15} style={{ color: '#a78bfa' }} />
              <span>Colar Texto com IA</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{
          padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
          flex: 1, overflowY: 'auto', minHeight: 0
        }}>
          {activeTab === 'file' ? (
            <>
              {/* File Input Box */}
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '1.5rem', border: '2px dashed rgba(255,255,255,0.15)', borderRadius: '14px',
                background: 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center'
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
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px',
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
                    <span>Roteiro Válido Identificado</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', padding: '3px 8px', borderRadius: '8px', fontWeight: 700 }}>
                    {parsedData.length} mensagem(ns)
                  </span>
                </div>
              )}
            </>
          ) : (
            /* Aba IA */
            aiStep === 'input' ? (
              <AITextInput
                rawText={rawText}
                setRawText={setRawText}
                selectedGroupIds={selectedGroupIds}
                setSelectedGroupIds={setSelectedGroupIds}
                grupos={grupos}
                onProcess={handleProcessAI}
                processing={aiProcessing}
                error={aiError}
                isMaximized={isMaximized}
              />
            ) : (
              <AIPreviewList
                messages={aiMessages}
                setMessages={setAiMessages}
                onConfirm={handleConfirmImportAI}
                onBack={() => setAiStep('input')}
                loading={loading}
                isMaximized={isMaximized}
              />
            )
          )}
        </div>

        {/* Footer para a Aba JSON */}
        {activeTab === 'file' && (
          <div style={{
            padding: '1rem 1.5rem', borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            gap: '10px', background: 'rgba(0, 0, 0, 0.2)'
          }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              style={{
                padding: '8px 16px', borderRadius: '8px', background: 'transparent',
                border: '1px solid var(--border)', color: 'var(--text-dim)',
                fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
              }}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleConfirmImportJSON}
              disabled={!parsedData || loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 18px', borderRadius: '8px',
                background: (!parsedData || loading) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                cursor: (!parsedData || loading) ? 'not-allowed' : 'pointer',
                boxShadow: (!parsedData || loading) ? 'none' : '0 4px 15px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              {loading ? <Loader2 size={16} className="spin" /> : <Upload size={16} />}
              <span>Importar Mensagens</span>
            </button>
          </div>
        )}
      </div>
    </div>
    </ModalPortal>
  );
};

export default ImportMessagesModal;
