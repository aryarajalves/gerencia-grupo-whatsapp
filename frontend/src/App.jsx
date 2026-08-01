import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from './services/api';
import { useAuth } from './contexts/AuthContext';
import { useWaStatus } from './contexts/WaStatusContext';
import { useCompany } from './contexts/CompanyContext';

// Layout & Common
import Sidebar from './components/layout/Sidebar';
import { LogoutModal, ConfirmModal } from './components/common';
import { Toaster } from 'react-hot-toast';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import GerenciarGrupos from './pages/Groups';
import AgendarMensagens from './pages/Scheduling';
import CapturaMensagens from './pages/Capture';
import HistoricoEnvios from './pages/Logs';
import Contatos from './pages/Contacts';
import GroupSets from './pages/GroupSets';
import Configuracoes from './pages/Settings';
import Chat from './pages/Chat';
import Register from './pages/Register';
import SetupProfile from './pages/SetupProfile';
import FullSet from './pages/FullSet';
import Backup from './pages/Backup';

import './App.css';

function App() {
  const { isLoggedIn, userRole, userName, handleLoginSuccess, handleLogout } = useAuth();
  const { waStatus } = useWaStatus();
  const { companyInfo } = useCompany();

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'dashboard');
  
  // UI States
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ show: false, title: '', message: '', onConfirm: null, type: 'danger', hideCancel: false });

  // Data States (Specific to operational pages)
  const [grupos, setGrupos] = useState([]);
  const [mensagens, setMensagens] = useState([]);
  const [stats, setStats] = useState({});

  // Persistence
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('activeTab', activeTab);
    }
  }, [activeTab, isLoggedIn]);

  // Operational Data Fetcher
  const fetchData = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const [resG, resM, resS] = await Promise.all([
        axiosInstance.get('/grupos/'),
        axiosInstance.get('/mensagens/'),
        axiosInstance.get('/dashboard/stats')
      ]);
      setGrupos(Array.isArray(resG.data) ? resG.data : []);
      setMensagens(resM.data?.items || (Array.isArray(resM.data) ? resM.data : []));
      setStats(resS.data || {});
    } catch (error) {
      console.error('Erro ao buscar dados operacionais:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  }, [isLoggedIn, handleLogout]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
      const interval = setInterval(fetchData, 15000); // 15s para dados operacionais
      const handleConfigUpdated = () => fetchData();
      window.addEventListener('config-updated', handleConfigUpdated);

      return () => {
        clearInterval(interval);
        window.removeEventListener('config-updated', handleConfigUpdated);
      };
    }
  }, [isLoggedIn, fetchData]);

  // Auth Handlers
  // Auth Handlers moved to AuthContext

  // Confirmation Handler
  const openConfirm = (arg1, arg2, arg3, arg4) => {
    // Suporte para novo formato: openConfirm({ title, message, type, onConfirm, confirmText })
    if (typeof arg1 === 'object' && arg1 !== null) {
      const { title, message, type = 'info', onConfirm = null, confirmText = null } = arg1;
      setConfirmDialog({ 
        show: true, 
        title, 
        message, 
        onConfirm: onConfirm ? () => { onConfirm(); closeConfirm(); } : closeConfirm, 
        type,
        confirmText,
        hideCancel: !onConfirm // Se não tem callback de confirmação, é só um alerta
      });
    } else {
      // Suporte para formato antigo: openConfirm(title, message, callback, type)
      setConfirmDialog({ 
        show: true, 
        title: arg1, 
        message: arg2, 
        onConfirm: arg3 ? () => { arg3(); closeConfirm(); } : closeConfirm, 
        type: arg4 || 'danger',
        confirmText: null,
        hideCancel: false
      });
    }
  };

  const closeConfirm = () => {
    setConfirmDialog({ show: false, title: '', message: '', onConfirm: null, type: 'danger', confirmText: null, hideCancel: false });
  };


  // Path detection for public pages
  const path = window.location.pathname;
  if (path.startsWith('/registrar/')) {
    const token = path.split('/')[2];
    return <Register token={token} />;
  }
  if (path.startsWith('/setup/')) {
    const token = path.split('/')[2];
    return <SetupProfile token={token} />;
  }
  if (path === '/esgotado') {
    return <FullSet />;
  }

  if (!isLoggedIn) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard stats={stats} grupos={grupos} waStatus={waStatus} onRefresh={fetchData} />;
      case 'usuarios':  return <Users openConfirm={openConfirm} />;
      case 'backup':    return <Backup openConfirm={openConfirm} />;
      case 'grupos':    return <GerenciarGrupos grupos={grupos} setGrupos={setGrupos} mensagens={mensagens} onRefresh={fetchData} openConfirm={openConfirm} />;
      case 'agendar':   return <AgendarMensagens mensagens={mensagens} grupos={grupos} waStatus={waStatus} onRefresh={fetchData} openConfirm={openConfirm} />;
      case 'captura':   return <CapturaMensagens openConfirm={openConfirm} />;
      case 'logs':      return <HistoricoEnvios openConfirm={openConfirm} />;
      case 'contatos':  return <Contatos openConfirm={openConfirm} />;
      case 'chat':      return <Chat openConfirm={openConfirm} />;
      case 'conjuntos': return <GroupSets openConfirm={openConfirm} />;
      case 'config':    return <Configuracoes />;
      default:          return <Dashboard stats={stats} grupos={grupos} waStatus={waStatus} onRefresh={fetchData} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => setShowLogoutModal(true)} 
        conjuntosAlertaCount={stats.conjuntos_quase_cheios?.length || 0}
        gruposAlertaCount={stats.grupos_sem_mensagens?.length || 0}
      />
      
      <main className="main-content">
        {renderContent()}
      </main>

      <Toaster 
        position="top-right" 
        containerStyle={{ zIndex: 99999 }}
        toastOptions={{
          style: {
            background: '#1e1e2d',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          }
        }} 
      />

      {/* Modals Globais */}
      <LogoutModal 
        show={showLogoutModal} 
        onCancel={() => setShowLogoutModal(false)} 
        onConfirm={handleLogout} 
      />

      <ConfirmModal 
        {...confirmDialog} 
        onCancel={closeConfirm} 
      />
    </div>
  );
}

export default App;
