import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Database, UploadCloud, Calendar } from 'lucide-react';
import axiosInstance from '../../services/api';
import { toastSucesso, toastErro } from '../../utils/toastNotifications';

import BackupSummaryCards from './components/BackupSummaryCards';
import StorageTab from './components/StorageTab';
import ManualActionsTab from './components/ManualActionsTab';
import ScheduleTab from './components/ScheduleTab';

const Backup = ({ openConfirm }) => {
  const [activeTab, setActiveTab] = useState('storage'); // 'storage' | 'manual' | 'schedule'
  const [info, setInfo] = useState({
    ultimo_backup: null,
    proximo_backup: null,
    retencao_count: 30,
    interval_hours: 6,
    agendamento_ativo: true,
    s3_configurado: false
  });

  const [backups, setBackups] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [frequencyType, setFrequencyType] = useState('hours');
  const [intervalValue, setIntervalValue] = useState(6);
  const [s3Folder, setS3Folder] = useState('backups/');
  const [retencaoCount, setRetencaoCount] = useState(30);
  const [agendamentoAtivo, setAgendamentoAtivo] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const [loadingInfo, setLoadingInfo] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [uploadingBackup, setUploadingBackup] = useState(false);
  const [actionFilename, setActionFilename] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, backups.length]);

  const totalPages = Math.ceil(backups.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBackups = backups.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    if (info) {
      if (info.frequency_type) setFrequencyType(info.frequency_type);
      if (info.interval_value) setIntervalValue(info.interval_value);
      if (info.s3_folder) setS3Folder(info.s3_folder);
      if (info.retencao_count) setRetencaoCount(info.retencao_count);
      if (info.agendamento_ativo !== undefined) setAgendamentoAtivo(info.agendamento_ativo);
    }
  }, [info]);

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

  const handleRefreshAll = async () => {
    try {
      setLoadingInfo(true);
      setLoadingList(true);
      await Promise.all([fetchBackupInfo(), fetchBackupList()]);
      toastSucesso('Dados Atualizados!', 'A lista de backups e informações do banco foram recarregadas.');
    } catch (err) {
      toastErro('Erro ao Atualizar', 'Não foi possível recarregar as informações.');
    } finally {
      setLoadingInfo(false);
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchBackupInfo();
    fetchBackupList();
  }, []);

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

  const handleCreateBackup = async () => {
    try {
      setCreatingBackup(true);
      const res = await axiosInstance.post('/backup/create');
      toastSucesso('Backup Realizado!', res.data.message || 'Backup do banco criado com sucesso no Backblaze B2 S3.');
      fetchBackupInfo();
      fetchBackupList();
      setActiveTab('storage');
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
      setActiveTab('storage');
    } catch (err) {
      toastErro('Erro no Upload', err.response?.data?.detail || 'Falha ao enviar arquivo de backup.');
    } finally {
      setUploadingBackup(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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

  const TABS = [
    { id: 'storage', label: 'Backups Armazenados', icon: Database, color: '#3b82f6', count: backups.length },
    { id: 'manual', label: 'Operações Manuais', icon: UploadCloud, color: '#f59e0b' },
    { id: 'schedule', label: 'Agendamento & Retenção', icon: Calendar, color: '#a855f7' }
  ];

  return (
    <div className="page-container" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header da Página */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            Backup Banco
          </h1>
        </div>

        <button 
          onClick={handleRefreshAll}
          disabled={loadingInfo || loadingList}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px' }}
        >
          <RefreshCw size={16} className={(loadingInfo || loadingList) ? "animate-spin" : ""} />
          Atualizar
        </button>
      </div>

      {/* Cards de Resumo no Topo */}
      <BackupSummaryCards info={info} />

      {/* Barra de Abas do Backup */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        borderBottom: '1px solid var(--border)', 
        paddingBottom: '4px',
        overflowX: 'auto'
      }}>
        {TABS.map(tab => {
          const isSelected = activeTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                color: isSelected ? '#fff' : 'var(--text-dim)',
                border: isSelected ? `1px solid ${tab.color}` : '1px solid var(--border)',
                boxShadow: isSelected ? `0 0 16px -4px ${tab.color}40` : 'none'
              }}
            >
              <TabIcon size={16} style={{ color: isSelected ? tab.color : 'var(--text-dim)' }} />
              {tab.label}
              {tab.count !== undefined && (
                <span style={{ 
                  padding: '2px 7px', 
                  borderRadius: '12px', 
                  fontSize: '0.72rem', 
                  background: isSelected ? `${tab.color}25` : 'rgba(255,255,255,0.06)',
                  color: isSelected ? '#fff' : 'var(--text-dim)',
                  fontWeight: 700
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Conteúdo da Aba Ativa */}
      {activeTab === 'storage' && (
        <StorageTab
          backups={backups}
          currentBackups={currentBackups}
          loadingList={loadingList}
          actionFilename={actionFilename}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          indexOfFirstItem={indexOfFirstItem}
          indexOfLastItem={indexOfLastItem}
          handleRestore={handleRestore}
          handleDownload={handleDownload}
          handleDelete={handleDelete}
          formatSize={formatSize}
          formatDate={formatDate}
        />
      )}

      {activeTab === 'manual' && (
        <ManualActionsTab
          handleCreateBackup={handleCreateBackup}
          creatingBackup={creatingBackup}
          handleFileUpload={handleFileUpload}
          uploadingBackup={uploadingBackup}
          fileInputRef={fileInputRef}
        />
      )}

      {activeTab === 'schedule' && (
        <ScheduleTab
          agendamentoAtivo={agendamentoAtivo}
          setAgendamentoAtivo={setAgendamentoAtivo}
          frequencyType={frequencyType}
          setFrequencyType={setFrequencyType}
          intervalValue={intervalValue}
          setIntervalValue={setIntervalValue}
          s3Folder={s3Folder}
          setS3Folder={setS3Folder}
          retencaoCount={retencaoCount}
          setRetencaoCount={setRetencaoCount}
          handleSaveAllSettings={handleSaveAllSettings}
          savingSettings={savingSettings}
        />
      )}

    </div>
  );
};

export default Backup;
