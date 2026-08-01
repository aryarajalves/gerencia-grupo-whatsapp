import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../services/api';
import { useAuth } from './AuthContext';

const WaStatusContext = createContext(null);

export const WaStatusProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [waStatus, setWaStatus] = useState({ status: 'desconhecido', last_check: null, plan_type: 'LITE' });

  const fetchWaStatus = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const response = await axiosInstance.get('/whatsapp/status');
      setWaStatus(response.data);
    } catch (error) {
      console.error('Erro ao buscar status do WhatsApp:', error);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchWaStatus();
      const interval = setInterval(fetchWaStatus, 60000); // Polling a cada 60s conforme MELHORIAS.md
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, fetchWaStatus]);

  useEffect(() => {
    const handleUpdate = () => fetchWaStatus();
    window.addEventListener('wa-status-update', handleUpdate);
    window.addEventListener('config-updated', handleUpdate);
    return () => {
      window.removeEventListener('wa-status-update', handleUpdate);
      window.removeEventListener('config-updated', handleUpdate);
    };
  }, [fetchWaStatus]);

  return (
    <WaStatusContext.Provider value={{ waStatus, refreshWaStatus: fetchWaStatus }}>
      {children}
    </WaStatusContext.Provider>
  );
};

export const useWaStatus = () => {
  const context = useContext(WaStatusContext);
  if (!context) {
    throw new Error('useWaStatus deve ser usado dentro de um WaStatusProvider');
  }
  return context;
};
