import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../services/api';
import { useAuth } from './AuthContext';

const CompanyContext = createContext(null);

export const CompanyProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [clients, setClients] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [companyInfo, setCompanyInfo] = useState({ 
    name: 'Empresa de Teste', 
    logo: '', 
    logoSize: '44' 
  });

  const fetchClients = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await axiosInstance.get('/clientes/');
      const clientsData = res.data || [];
      setClients(clientsData);

      // Busca a config para identificar qual é o cliente ativo
      const cfgRes = await axiosInstance.get('/config/');
      const activeId = cfgRes.data?.ACTIVE_CLIENT_ID;
      const found = clientsData.find(c => String(c.id) === String(activeId)) || clientsData[0];
      
      if (found) {
        setActiveClient(found);
        setCompanyInfo({
          name: found.nome || cfgRes.data?.COMPANY_NAME || 'Empresa de Teste',
          logo: found.logo_url || cfgRes.data?.COMPANY_LOGO || '',
          logoSize: String(found.logo_size || cfgRes.data?.COMPANY_LOGO_SIZE || '44')
        });
      } else if (cfgRes.data) {
        setCompanyInfo({
          name: cfgRes.data.COMPANY_NAME || 'Empresa de Teste',
          logo: cfgRes.data.COMPANY_LOGO || '',
          logoSize: String(cfgRes.data.COMPANY_LOGO_SIZE || '44')
        });
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  }, [isLoggedIn]);

  const selectClient = async (clientId) => {
    try {
      const res = await axiosInstance.post(`/clientes/${clientId}/selecionar`);
      await fetchClients();
      window.dispatchEvent(new CustomEvent('config-updated'));
      return res.data;
    } catch (error) {
      console.error('Erro ao selecionar cliente:', error);
      throw error;
    }
  };

  const createClient = async (newClientData) => {
    try {
      const res = await axiosInstance.post('/clientes/', newClientData);
      await fetchClients();
      window.dispatchEvent(new CustomEvent('config-updated'));
      return res.data;
    } catch (error) {
      console.error('Erro ao cadastrar novo cliente:', error);
      throw error;
    }
  };

  const deleteClient = async (clientId) => {
    try {
      const res = await axiosInstance.delete(`/clientes/${clientId}`);
      await fetchClients();
      window.dispatchEvent(new CustomEvent('config-updated'));
      return res.data;
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchClients();
    }
  }, [isLoggedIn, fetchClients]);

  useEffect(() => {
    const handleConfigUpdate = () => fetchClients();
    const handleLogoSizePreview = (e) => {
      setCompanyInfo(prev => ({ ...prev, logoSize: e.detail }));
    };

    window.addEventListener('config-updated', handleConfigUpdate);
    window.addEventListener('logo-size-preview', handleLogoSizePreview);

    return () => {
      window.removeEventListener('config-updated', handleConfigUpdate);
      window.removeEventListener('logo-size-preview', handleLogoSizePreview);
    };
  }, [fetchClients]);

  return (
    <CompanyContext.Provider value={{ 
      companyInfo, 
      clients, 
      activeClient, 
      selectClient, 
      createClient, 
      deleteClient,
      refreshCompanyInfo: fetchClients 
    }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany deve ser usado dentro de um CompanyProvider');
  }
  return context;
};
