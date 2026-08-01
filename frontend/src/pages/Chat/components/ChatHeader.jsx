import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, Eye, X } from 'lucide-react';
import axiosInstance from '../../../services/api';

const ChatHeader = ({ selectedGroup, fetchMessages, loading, onOpenContacts, onCloseChat }) => {

  const [contactCount, setContactCount] = useState(selectedGroup?.quantidade_contatos || 0);

  useEffect(() => {
    if (!selectedGroup?.id_do_grupo) return;
    
    let isMounted = true;
    const fetchRealCount = async () => {
      try {
        const res = await axiosInstance.get('/contatos/', {
          params: { jid_grupo: selectedGroup.id_do_grupo, limit: 1 }
        });
        if (isMounted && typeof res.data.total === 'number') {
          setContactCount(res.data.total);
        }
      } catch (err) {
        if (isMounted) setContactCount(selectedGroup.quantidade_contatos || 0);
      }
    };

    fetchRealCount();
    return () => { isMounted = false; };
  }, [selectedGroup]);

  return (
    <div style={{ 
      padding: '1.25rem 1.75rem', 
      borderBottom: '1px solid rgba(255,255,255,0.1)', 
      background: 'linear-gradient(180deg, rgba(30, 35, 50, 0.8), rgba(18, 20, 29, 0.9))',
      backdropFilter: 'blur(10px)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '14px', 
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#fff', 
          fontWeight: 800,
          fontSize: '1.1rem',
          boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {selectedGroup.nome ? selectedGroup.nome.substring(0, 2).toUpperCase() : 'GR'}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
              {selectedGroup.nome}
            </h3>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '5px', 
              fontSize: '0.68rem', 
              fontWeight: 800, 
              padding: '3px 8px', 
              borderRadius: '20px', 
              background: selectedGroup.tipo === 'privado' || !selectedGroup.id_do_grupo?.endsWith('@g.us') ? 'rgba(168, 85, 247, 0.15)' : 'rgba(16, 185, 129, 0.15)', 
              color: selectedGroup.tipo === 'privado' || !selectedGroup.id_do_grupo?.endsWith('@g.us') ? '#c084fc' : '#10b981', 
              border: selectedGroup.tipo === 'privado' || !selectedGroup.id_do_grupo?.endsWith('@g.us') ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: selectedGroup.tipo === 'privado' || !selectedGroup.id_do_grupo?.endsWith('@g.us') ? '#a855f7' : '#10b981', boxShadow: selectedGroup.tipo === 'privado' || !selectedGroup.id_do_grupo?.endsWith('@g.us') ? '0 0 8px #a855f7' : '0 0 8px #10b981' }} />
              {selectedGroup.tipo === 'privado' || !selectedGroup.id_do_grupo?.endsWith('@g.us') ? 'CHAT PRIVADO' : 'CHAT DO GRUPO'}
            </span>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={onOpenContacts}
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '2px 8px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px',
                fontSize: '0.78rem',
                transition: 'all 0.2s'
              }}
              title="Clique para ver e copiar os contatos deste grupo"
            >
              <Users size={13} style={{ color: 'var(--primary)' }} /> 
              <strong>{contactCount}</strong> contatos
              <Eye size={11} style={{ opacity: 0.6 }} />
            </button>
            <span>•</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
              ID: {selectedGroup.id_do_grupo}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button 
          className="btn-icon" 
          onClick={() => fetchMessages(selectedGroup.id_do_grupo)}
          title="Atualizar mensagens"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            padding: '10px',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>

        {onCloseChat && (
          <button 
            className="btn-icon" 
            onClick={onCloseChat}
            title="Fechar conversa aberta"
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#f87171',
              padding: '10px',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;

