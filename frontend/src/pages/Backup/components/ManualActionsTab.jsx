import React from 'react';
import { UploadCloud, RefreshCw } from 'lucide-react';

const ManualActionsTab = ({
  handleCreateBackup,
  creatingBackup,
  handleFileUpload,
  uploadingBackup,
  fileInputRef
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.2s ease-in-out' }}>
      {/* Card 1: Backup Manual Imediato */}
      <div className="glass-card" style={{ padding: '1.75rem', background: 'rgba(15, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ maxWidth: '600px' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UploadCloud size={22} style={{ color: '#3b82f6' }} />
            Criar Backup Manual Imediato
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-dim)', lineHeight: '1.5' }}>
            Gera um snapshot completo de todas as tabelas e dados do banco de dados neste exato momento e faz o upload automático para o seu bucket no Backblaze B2 S3.
          </p>
        </div>

        <button
          onClick={handleCreateBackup}
          disabled={creatingBackup}
          className="btn btn-primary"
          style={{ padding: '12px 28px', fontSize: '0.95rem', fontWeight: 700, borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37,99,235,0.3)' }}
        >
          {creatingBackup ? <RefreshCw size={18} className="animate-spin" /> : <UploadCloud size={18} />}
          {creatingBackup ? 'Gerando Backup...' : 'Fazer Backup Agora'}
        </button>
      </div>

      {/* Card 2: Importar Backup Externo */}
      <div className="glass-card" style={{ padding: '1.75rem', background: 'rgba(15, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ maxWidth: '600px' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UploadCloud size={22} style={{ color: '#f59e0b' }} />
            Importar Backup Externo
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-dim)', lineHeight: '1.5' }}>
            Envie um arquivo de backup previamente gerado (formatos <code>.dump</code>, <code>.dump.gz</code> ou <code>.sql</code>) para salvá-lo no seu armazenamento S3 e poder restaurá-lo com 1 clique a qualquer momento.
          </p>
        </div>

        <input 
          type="file" 
          accept=".dump,.gz,.sql" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileUpload} 
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingBackup}
          style={{ padding: '12px 28px', fontSize: '0.95rem', fontWeight: 700, borderRadius: '10px', background: '#d97706', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(217,119,6,0.3)' }}
        >
          {uploadingBackup ? <RefreshCw size={18} className="animate-spin" /> : <UploadCloud size={18} />}
          {uploadingBackup ? 'Enviando Arquivo...' : 'Fazer Upload de Backup'}
        </button>
      </div>
    </div>
  );
};

export default ManualActionsTab;
