import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Users, List, MessageSquare, Zap, History, Settings, LogOut, ChevronDown, PlusCircle, CheckCircle2, Trash2, Database } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCompany } from '../../contexts/CompanyContext';
import { toast } from 'react-hot-toast';
import NewClientModal from './NewClientModal';
import DeleteClientModal from './DeleteClientModal';

const Sidebar = ({ activeTab, setActiveTab, onLogout, conjuntosAlertaCount = 0, gruposAlertaCount = 0 }) => {
  const { userRole, userName } = useAuth();
  const { companyInfo, clients, activeClient, selectClient, createClient, deleteClient } = useCompany();
  const { name: companyName, logo: companyLogo, logoSize: companyLogoSize } = companyInfo;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    if (Array.isArray(clients) && clients.length === 0) {
      // Abre automaticamente APENAS se já tiver carregado os clientes do backend E não houver nenhum cliente cadastrado
      setIsModalOpen(true);
    }
  }, [clients]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectClient = async (clientId) => {
    try {
      setLoading(true);
      await selectClient(clientId);
      setIsDropdownOpen(false);
      toast.success('Instância alterada com sucesso!');
    } catch (err) {
      toast.error('Erro ao alternar de cliente.');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      title: 'MENU PRINCIPAL',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'grupos',    label: 'Grupos', icon: Users },
        { id: 'conjuntos', label: 'Conjunto de Grupos', icon: List },
        { id: 'agendar',   label: 'Mensagens', icon: MessageSquare },
        { id: 'chat',      label: 'Chat de Grupos', icon: MessageSquare },
      ]
    },
    {
      title: 'REGISTROS & DADOS',
      items: [
        { id: 'contatos',  label: 'Contatos', icon: Users },
        { id: 'captura',   label: 'Captura de Mensagens', icon: Zap },
        { id: 'logs',      label: 'Histórico', icon: History },
      ]
    },
    {
      title: 'ADMINISTRAÇÃO',
      items: [
        { id: 'usuarios',  label: 'Gestão de Usuários', icon: Users, adminOnly: true },
        { id: 'backup',    label: 'Backup Banco', icon: Database, adminOnly: true },
      ]
    }
  ];

  const filteredSections = sections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (item.adminOnly && userRole !== 'SUPER_ADMIN') return false;
      return true;
    })
  })).filter(section => section.items.length > 0);

  const initials = userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??';

  return (
    <div className="sidebar">
      {/* Top Sidebar Header with Interactive Client Dropdown */}
      <div className="sidebar-header" ref={dropdownRef} style={{ position: 'relative' }}>
        <div 
          onClick={() => setIsDropdownOpen(prev => !prev)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: '12px',
            padding: '8px 10px',
            borderRadius: '12px',
            background: isDropdownOpen ? 'rgba(255,255,255,0.06)' : 'transparent',
            border: isDropdownOpen ? '1px solid var(--border)' : '1px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="Clique para alternar de cliente/WhatsApp"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
            {companyLogo ? (
              <img src={companyLogo} alt="Logo" style={{ width: `${companyLogoSize || 40}px`, height: `${companyLogoSize || 40}px`, borderRadius: '10px', objectFit: 'contain', flexShrink: 0 }} />
            ) : (
              <div style={{
                width: `${companyLogoSize || 40}px`, height: `${companyLogoSize || 40}px`, borderRadius: '10px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', fontWeight: 900, color: '#fff',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                flexShrink: 0
              }}>
                {companyName ? companyName[0].toUpperCase() : 'Z'}
              </div>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {companyName || (clients && clients.length === 0 ? 'Nenhum Cliente' : 'Zap Group')}
              </div>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '3px' }}>
                {activeClient?.subtitulo || (clients && clients.length === 0 ? 'CADASTRAR INSTÂNCIA' : 'CONTROL PANEL')}
              </div>
            </div>
          </div>
          <ChevronDown size={18} style={{ color: 'var(--text-dim)', transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
        </div>

        {/* Dropdown Menu de Clientes */}
        {isDropdownOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: '100%',
            background: 'rgba(23, 25, 35, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '14px',
            boxShadow: '0 12px 35px rgba(0,0,0,0.5)',
            zIndex: 9999,
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 10px' }}>
              Instâncias / Clientes
            </div>

            <div className="custom-scroll" style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {(clients || []).map(client => {
                const isActive = activeClient?.id === client.id;
                return (
                  <div
                    key={client.id}
                    onClick={() => !isActive && handleSelectClient(client.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      cursor: isActive ? 'default' : 'pointer',
                      background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                      border: isActive ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                      transition: 'background 0.2s'
                    }}
                    className={isActive ? '' : 'hover-bg-glass'}
                  >
                    {client.logo_url ? (
                      <img src={client.logo_url} style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'contain' }} alt="Client Logo" />
                    ) : (
                      <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>
                        {client.nome ? client.nome[0].toUpperCase() : 'C'}
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: isActive ? 700 : 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {client.nome}
                      </div>
                      {client.wapi_instance_id && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                          ID: {client.wapi_instance_id}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {isActive && <CheckCircle2 size={16} style={{ color: '#34d399' }} />}
                      {(clients || []).length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setClientToDelete(client);
                          }}
                          title="Excluir este cliente"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            padding: '4px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.7,
                            transition: 'opacity 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />

            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(false);
                setIsModalOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <PlusCircle size={16} />
              + Cadastrar Novo Cliente
            </button>
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <nav>
        {filteredSections.map(section => (
          <div key={section.title}>
            <div className="nav-section-title">{section.title}</div>
            {section.items.map(item => {
              const hasAlert = (item.id === 'conjuntos' && conjuntosAlertaCount > 0) || 
                               (item.id === 'grupos' && gruposAlertaCount > 0);
              const alertCount = item.id === 'conjuntos' ? conjuntosAlertaCount : gruposAlertaCount;

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  style={{ position: 'relative' }}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                  {hasAlert && (
                    <div style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: '#ef4444', color: '#fff', borderRadius: '10px', padding: '2px 7px',
                      fontSize: '0.65rem', fontWeight: 800, boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                    }}>
                      {alertCount}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.5rem', marginBottom: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ 
            width: '36px', height: '36px', borderRadius: '10px', 
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.85rem', fontWeight: 800, color: '#fff'
          }}>
            {initials}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {userRole === 'SUPER_ADMIN' ? 'Diretor / CEO' : 'Colaborador'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div 
            className={`nav-item ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => setActiveTab('config')}
            style={{ padding: '0.7rem 1rem' }}
          >
            <Settings size={20} />
            <span>Configurações</span>
          </div>
          
          <div 
            className="nav-item logout"
            onClick={onLogout}
            style={{ padding: '0.7rem 1rem', color: '#ef4444' }}
          >
            <LogOut size={20} />
            <span>Sair do Painel</span>
          </div>
        </div>
      </div>

      {/* Modais de Gerenciamento de Clientes */}
      <NewClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreateClient={createClient} 
      />

      <DeleteClientModal 
        clientToDelete={clientToDelete} 
        onClose={() => setClientToDelete(null)} 
        onDeleteClient={deleteClient} 
      />
    </div>
  );
};

export default Sidebar;
