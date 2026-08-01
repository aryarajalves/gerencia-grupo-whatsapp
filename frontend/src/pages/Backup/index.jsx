import React, { useState, useEffect, useRef } from 'react';
import { Database, CheckCircle2, Clock, Shield, UploadCloud, Download, RotateCcw, Trash2, RefreshCw, Calendar, FileText, Settings } from 'lucide-react';
import axiosInstance from '../../services/api';
import { toastSucesso, toastErro } from '../../utils/toastNotifications';

const Backup = ({ openConfirm }) => {
  const [info, setInfo] = useState({
    ultimo_backup: null,
    proximo_backup: null,
    retencao_count: 30,
    interval_hours: 6,
    agendamento_ativo: true,
    s3_configurado: false
  });

  const [frequencyType, setFrequencyType] = useState('hours');
  const [intervalValue, setIntervalValue] = useState(6);
  const [s3Folder, setS3Folder] = useState('backups/');
  const [retencaoCount, setRetencaoCount] = useState(30);
  const [agendamentoAtivo, setAgendamentoAtivo] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (info) {
      if (info.frequency_type) setFrequencyType(info.frequency_type);
      if (info.interval_value) setIntervalValue(info.interval_value);
      if (info.s3_folder) setS3Folder(info.s3_folder);
      if (info.retencao_count) setRetencaoCount(info.retencao_count);
      if (info.agendamento_ativo !== undefined) setAgendamentoAtivo(info.agendamento_ativo);
    }
  }, [info]);

  const handleSaveAllSettings = async () => {
    try {
      setSavingSettings(true);
      await axiosInstance.post('/backup/settings', {
        frequency_type: frequencyType,
        interval_value: Number(intervalValue),
        s3_folder: s3Folder,
        retencao_count: Number(retencaoCount),
        agendamento_ativo: agendamentoAtivo
      });
      toastSucesso('Configuração Salva!', 'As preferências de agendamento automático foram atualizadas.');
      fetchBackupInfo();
    } catch (err) {
      toastErro('Erro ao Salvar', 'Não foi possível atualizar as configurações de agendamento.');
    } finally {
      setSavingSettings(false);
    }
  };
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [uploadingBackup, setUploadingBackup] = useState(false);
  const [actionFilename, setActionFilename] = useState(null);

  const fileInputRef = useRef(null);

  const fetchBackupInfo = async () => {
    try {
      setLoadingInfo(true);
      const res = await axiosInstance.get('/backup/info');
      setInfo(res.data || {});
    } catch (err) {
      console.error('Erro ao carregar resumo de backup:', err);
    } finally {
      setLoadingInfo(false);
    }
  };

  const fetchBackupList = async () => {
    try {
      setLoadingList(true);
      const res = await axiosInstance.get('/backup/list');
      setBackups(res.data.items || []);
    } catch (err) {
      console.error('Erro ao carregar lista de backups:', err);
      setBackups([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchBackupInfo();
    fetchBackupList();
  }, []);

  const handleCreateBackup = async () => {
    try {
      setCreatingBackup(true);
      const res = await axiosInstance.post('/backup/create');
      toastSucesso('Backup Realizado!', res.data.message || 'Backup do banco criado com sucesso no Backblaze B2 S3.');
      fetchBackupInfo();
      fetchBackupList();
    } catch (err) {
      toastErro('Erro ao Gerar Backup', err.response?.data?.detail || 'Não foi possível gerar o backup.');
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingBackup(true);
      const res = await axiosInstance.post('/backup/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toastSucesso('Upload Concluído!', res.data.message || `Arquivo ${file.name} enviado para o S3.`);
      fetchBackupInfo();
      fetchBackupList();
    } catch (err) {
      toastErro('Erro no Upload', err.response?.data?.detail || 'Falha ao enviar arquivo de backup.');
    } finally {
      setUploadingBackup(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleToggleAuto = async (newVal) => {
    try {
      setInfo(prev => ({ ...prev, agendamento_ativo: newVal }));
      await axiosInstance.post('/backup/settings', { agendamento_ativo: newVal });
      toastSucesso('Agendamento Atualizado', `Agendamento automático ${newVal ? 'ativado' : 'desativado'}.`);
      fetchBackupInfo();
    } catch (err) {
      toastErro('Erro ao Salvar', 'Não foi possível atualizar o agendamento.');
      fetchBackupInfo();
    }
  };

  const handleUpdateSettings = async (key, val) => {
    try {
      await axiosInstance.post('/backup/settings', { [key]: val });
      toastSucesso('Configuração Salva', 'Parâmetro de backup atualizado.');
      fetchBackupInfo();
    } catch (err) {
      toastErro('Erro ao Salvar', 'Não foi possível salvar a configuração.');
    }
  };

  const handleDownload = async (filename) => {
    try {
      setActionFilename(filename);
      const response = await axiosInstance.get(`/backup/download/${filename}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toastSucesso('Download Iniciado', `Arquivo ${filename} baixado.`);
    } catch (err) {
      toastErro('Erro no Download', 'Não foi possível baixar o arquivo de backup.');
    } finally {
      setActionFilename(null);
    }
  };

  const handleRestore = (filename) => {
    openConfirm({
      title: 'Restaurar Banco de Dados?',
      message: `Tem certeza que deseja restaurar o banco a partir do backup "${filename}"? Esta ação substituirá os dados atuais.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          setActionFilename(filename);
          const res = await axiosInstance.post(`/backup/restore/${filename}`);
          toastSucesso('Restauração Concluída', res.data.message || 'Banco restaurado com sucesso!');
        } catch (err) {
          toastErro('Erro na Restauração', err.response?.data?.detail || 'Falha ao restaurar banco de dados.');
        } finally {
          setActionFilename(null);
        }
      }
    });
  };

  const handleDelete = (filename) => {
    openConfirm({
      title: 'Excluir Backup?',
      message: `Deseja apagar permanentemente o arquivo "${filename}" do Backblaze B2 S3?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          setActionFilename(filename);
          await axiosInstance.delete(`/backup/delete/${filename}`);
          toastSucesso('Backup Excluído', `Arquivo ${filename} removido.`);
          fetchBackupInfo();
          fetchBackupList();
        } catch (err) {
          toastErro('Erro ao Excluir', 'Não foi possível excluir o backup.');
        } finally {
          setActionFilename(null);
        }
      }
    });
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '-';
    try {
      return new Date(isoStr).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="page-container" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header da Página */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            Backup Banco
          </h1>
        </div>

        <button 
          onClick={() => { fetchBackupInfo(); fetchBackupList(); }}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px' }}
        >
          <RefreshCw size={16} className={(loadingInfo || loadingList) ? "animate-spin" : ""} />
          Atualizar
        </button>
      </div>

      {/* Cards de Resumo no Topo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* Card 1: Último Backup */}
        <div className="glass-card" style={{ padding: '1.25rem', background: 'rgba(15, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <CheckCircle2 size={20} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Último Backup
            </span>
          </div>

          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>
            {info.ultimo_backup?.filename || 'Nenhum backup realizado'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            {info.ultimo_backup?.datetime || 'Realize o primeiro backup'}
          </div>
        </div>

        {/* Card 2: Próximo Backup */}
        <div className="glass-card" style={{ padding: '1.25rem', background: 'rgba(15, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <Clock size={20} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Próximo Backup
            </span>
          </div>

          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            {info.agendamento_ativo ? (info.proximo_backup?.datetime || '-') : 'Agendamento desativado'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            {info.agendamento_ativo ? `A cada ${info.interval_hours} hora(s)` : 'Ative o agendamento abaixo'}
          </div>
        </div>

        {/* Card 3: Retenção */}
        <div className="glass-card" style={{ padding: '1.25rem', background: 'rgba(15, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
              <Shield size={20} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Retenção
            </span>
          </div>

          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '2px' }}>
            {info.retencao_count}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            backups mantidos no S3
          </div>
        </div>
      </div>

      {/* Seção 1: Backup Manual */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(15, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UploadCloud size={20} style={{ color: '#3b82f6' }} />
            Backup Manual
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            Clique para criar um backup imediato do banco de dados e enviar ao Backblaze S3.
          </p>
        </div>

        <button
          onClick={handleCreateBackup}
          disabled={creatingBackup}
          className="btn btn-primary"
          style={{ padding: '10px 24px', fontSize: '0.9rem', fontWeight: 700, borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {creatingBackup ? <RefreshCw size={18} className="animate-spin" /> : <UploadCloud size={18} />}
          {creatingBackup ? 'Gerando Backup...' : 'Fazer Backup Agora'}
        </button>
      </div>

      {/* Seção 2: Importar Backup Externo */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(15, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UploadCloud size={20} style={{ color: '#f59e0b' }} />
            Importar Backup Externo
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            Envie um arquivo de backup (.dump ou .dump.gz) de outro servidor para salvá-lo no S3 e restaurar quando desejar.
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
          style={{ padding: '10px 24px', fontSize: '0.9rem', fontWeight: 700, borderRadius: '10px', background: '#d97706', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
        >
          {uploadingBackup ? <RefreshCw size={18} className="animate-spin" /> : <UploadCloud size={18} />}
          {uploadingBackup ? 'Enviando...' : 'Fazer Upload de Backup'}
        </button>
      </div>

      {/* Seção 3: Agendamento Automático */}
      <div className="glass-card" style={{ padding: '1.75rem', background: 'rgba(15, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={22} style={{ color: '#a855f7' }} />
          Agendamento Automático
        </h3>

        {/* Sub-card do Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255, 255, 255, 0.03)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px', cursor: 'pointer', flexShrink: 0 }}>
            <input 
              type="checkbox" 
              checked={agendamentoAtivo}
              onChange={e => setAgendamentoAtivo(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }} 
            />
            <span style={{
              position: 'absolute', inset: 0,
              backgroundColor: agendamentoAtivo ? '#2563eb' : 'rgba(255,255,255,0.2)',
              borderRadius: '34px', transition: '0.3s'
            }}>
              <span style={{
                position: 'absolute', content: '""', height: '20px', width: '20px',
                left: agendamentoAtivo ? '26px' : '3px', bottom: '3px',
                backgroundColor: 'white', borderRadius: '50%', transition: '0.3s'
              }} />
            </span>
          </label>

          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Agendamento Ativado</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Backups serão realizados automaticamente.</div>
          </div>
        </div>

        {/* Linha 1: Frequência e Valor do Intervalo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Frequência</label>
            <select
              value={frequencyType}
              onChange={e => setFrequencyType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            >
              <option value="hours" style={{ background: '#161822' }}>A cada X horas</option>
              <option value="days" style={{ background: '#161822' }}>A cada X dias</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Valor do Intervalo</label>
            <input 
              type="number"
              min="1"
              value={intervalValue}
              onChange={e => setIntervalValue(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Backup a cada <strong>{intervalValue || 6}</strong> {frequencyType === 'hours' ? 'hora(s)' : 'dia(s)'}
            </div>
          </div>
        </div>

        {/* Linha 2: Pasta do Backup no S3 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Pasta do Backup no S3</label>
          <input 
            type="text"
            value={s3Folder}
            onChange={e => setS3Folder(e.target.value)}
            placeholder="backups/"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '0.9rem',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Subpasta onde os backups serão salvos no bucket do Backblaze S3. Ex: backups/ ou backups/cliente1/.
          </div>
        </div>

        {/* Linha 3: Retenção */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Retenção — Máximo de Backups no S3</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <input 
              type="number"
              min="1"
              value={retencaoCount}
              onChange={e => setRetencaoCount(e.target.value)}
              style={{
                width: '100px',
                padding: '10px 14px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              backups — os mais antigos serão excluídos automaticamente.
            </span>
          </div>
        </div>

        {/* Botão Roxo Salvar Configuração */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button
            onClick={handleSaveAllSettings}
            disabled={savingSettings}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 26px',
              background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(147, 51, 234, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            {savingSettings ? <RefreshCw size={18} className="animate-spin" /> : <Settings size={18} />}
            {savingSettings ? 'Salvando...' : 'Salvar Configuração'}
          </button>
        </div>
      </div>

      {/* Seção 4: Tabela de Backups Armazenados */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(15, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={20} style={{ color: '#3b82f6' }} />
          Backups Armazenados no Backblaze S3
        </h3>

        {loadingList ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 10px' }} />
            <p>Carregando backups...</p>
          </div>
        ) : backups.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            <Database size={32} opacity={0.3} style={{ margin: '0 auto 10px' }} />
            <p>Nenhum backup encontrado no armazenamento.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '10px 12px' }}>Nome do Arquivo</th>
                  <th style={{ padding: '10px 12px' }}>Tamanho</th>
                  <th style={{ padding: '10px 12px' }}>Data de Criação</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b, idx) => (
                  <tr key={b.filename || idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background 0.2s' }} className="hover-bg-glass">
                    <td style={{ padding: '12px', fontWeight: 600, color: '#fff', fontFamily: 'monospace' }}>
                      {b.filename}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-dim)' }}>
                      {formatSize(b.size_bytes)}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-dim)' }}>
                      {formatDate(b.last_modified)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => handleRestore(b.filename)}
                          disabled={actionFilename === b.filename}
                          style={{ padding: '6px 10px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Restaurar este backup"
                        >
                          <RotateCcw size={13} />
                          Restaurar
                        </button>

                        <button
                          onClick={() => handleDownload(b.filename)}
                          disabled={actionFilename === b.filename}
                          style={{ padding: '6px 10px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Baixar arquivo"
                        >
                          <Download size={13} />
                          Baixar
                        </button>

                        <button
                          onClick={() => handleDelete(b.filename)}
                          disabled={actionFilename === b.filename}
                          style={{ padding: '6px 10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Excluir do S3"
                        >
                          <Trash2 size={13} />
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Backup;
