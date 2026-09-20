import React, { useState, useRef } from 'react';
import { Sparkles, Loader2, Users, AlertCircle, FileUp, FileText, CheckCircle2, X } from 'lucide-react';
import axiosInstance from '../../../services/api';
import { toast } from 'react-hot-toast';

const AITextInput = ({
  rawText,
  setRawText,
  selectedGroupIds,
  setSelectedGroupIds,
  grupos = [],
  onProcess,
  processing,
  error,
  isMaximized = false
}) => {
  const [extractingFile, setExtractingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef(null);

  const toggleGroup = (id) => {
    if (selectedGroupIds.includes(id)) {
      setSelectedGroupIds(selectedGroupIds.filter(g => g !== id));
    } else {
      setSelectedGroupIds([...selectedGroupIds, id]);
    }
  };

  const handleSelectAllGroups = () => {
    if (selectedGroupIds.length === grupos.length) {
      setSelectedGroupIds([]);
    } else {
      setSelectedGroupIds(grupos.map(g => g.id));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reseta o input para permitir selecionar o mesmo arquivo se desejado
    e.target.value = '';

    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const lowerName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some(ext => lowerName.endsWith(ext));

    if (!isAllowed) {
      toast.error('Formato não suportado. Por favor, envie arquivos PDF (.pdf), Word (.docx) ou Texto (.txt).');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setExtractingFile(true);
    try {
      const res = await axiosInstance.post('/mensagens/extrair-texto-arquivo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const extraido = res.data?.texto || '';
      if (!extraido.trim()) {
        toast.error('Nenhum texto legível foi extraído do arquivo.');
        return;
      }
      setRawText(extraido);
      setUploadedFileName(file.name);
      toast.success(`Texto de "${file.name}" extraído com sucesso!`);
    } catch (err) {
      console.error('Erro ao extrair arquivo:', err);
      toast.error(err.response?.data?.detail || 'Erro ao extrair texto do arquivo.');
    } finally {
      setExtractingFile(false);
    }
  };

  const handleClearUploadedFile = () => {
    setUploadedFileName('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: isMaximized ? '100%' : 'auto' }}>
      {/* Seleção de Grupos de Destino */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={14} /> Grupos de Destino Padrão:
          </label>
          {grupos.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAllGroups}
              style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
            >
              {selectedGroupIds.length === grupos.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
            </button>
          )}
        </div>

        {grupos.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>Nenhum grupo ativo cadastrado.</p>
        ) : (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '6px',
            maxHeight: isMaximized ? '120px' : '85px', overflowY: 'auto', padding: '8px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px'
          }}>
            {grupos.map(g => {
              const isSelected = selectedGroupIds.includes(g.id);
              return (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => toggleGroup(g.id)}
                  style={{
                    padding: '4px 10px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: 600,
                    cursor: 'pointer', border: isSelected ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)',
                    background: isSelected ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.03)',
                    color: isSelected ? '#60a5fa' : 'var(--text-dim)', transition: 'all 0.2s ease'
                  }}
                >
                  {g.nome || 'Grupo sem nome'}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Opção de Upload de Arquivo (PDF / DOCX / TXT) */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.08))',
        border: '1px dashed rgba(124,58,237,0.3)', flexWrap: 'wrap', gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {extractingFile ? <Loader2 size={16} className="spin" style={{ color: '#c4b5fd' }} /> : <FileText size={16} style={{ color: '#a78bfa' }} />}
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
              Importar de Arquivo (PDF, Word DOCX ou TXT)
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              Extrai todo o texto automaticamente para o campo abaixo
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {uploadedFileName && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 8px', borderRadius: '6px',
              background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)',
              color: '#34d399', fontSize: '0.75rem', fontWeight: 600
            }}>
              <CheckCircle2 size={13} />
              <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {uploadedFileName}
              </span>
              <button
                type="button"
                onClick={handleClearUploadedFile}
                title="Limpar arquivo"
                style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                <X size={13} />
              </button>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.docx,.doc,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={extractingFile}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '8px',
              background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.5)',
              color: '#c4b5fd', fontSize: '0.78rem', fontWeight: 700,
              cursor: extractingFile ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
            }}
          >
            {extractingFile ? (
              <>
                <Loader2 size={13} className="spin" />
                <span>Extraindo...</span>
              </>
            ) : (
              <>
                <FileUp size={14} />
                <span>{uploadedFileName ? 'Trocar Arquivo' : 'Carregar PDF / DOCX'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Área para colar texto */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: isMaximized ? 1 : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Roteiro de Mensagens (Cole ou edite o texto extraído):
          </label>
          {rawText.length > 0 && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              {rawText.length} caracteres
            </span>
          )}
        </div>
        <textarea
          rows={isMaximized ? 18 : 8}
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          placeholder={`Cole aqui o roteiro de mensagens do seu lançamento ou campanha...\n\nExemplo:\nDia 1 às 09:00 - Texto: Bom dia pessoal! Sejam bem-vindos!\nÀs 14:00 - Imagem: https://exemplo.com/banner.png\nDia 2 às 18:00 - Enquete: Qual seu horário favorito? Opções: Manhã, Tarde, Noite`}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff', fontSize: '0.85rem', lineHeight: '1.5', fontFamily: 'inherit',
            resize: isMaximized ? 'none' : 'vertical', boxSizing: 'border-box',
            height: isMaximized ? '100%' : 'auto', minHeight: isMaximized ? '260px' : '160px'
          }}
        />
      </div>

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

      {/* Botão de Ação */}
      <button
        type="button"
        onClick={onProcess}
        disabled={processing || !rawText.trim()}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '12px 20px', borderRadius: '10px',
          background: (processing || !rawText.trim()) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
          border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.9rem',
          cursor: (processing || !rawText.trim()) ? 'not-allowed' : 'pointer',
          boxShadow: (processing || !rawText.trim()) ? 'none' : '0 4px 15px rgba(37, 99, 235, 0.35)',
          transition: 'all 0.2s', flexShrink: 0
        }}
      >
        {processing ? (
          <>
            <Loader2 size={18} className="spin" />
            <span>Processando com IA (gpt-4o-mini)...</span>
          </>
        ) : (
          <>
            <Sparkles size={18} />
            <span>Processar Roteiro com IA</span>
          </>
        )}
      </button>
    </div>
  );
};

export default AITextInput;
