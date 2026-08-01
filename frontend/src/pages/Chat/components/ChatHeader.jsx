import React from 'react';
import { Users, RefreshCw } from 'lucide-react';

const ChatHeader = ({ selectedGroup, fetchMessages, loading }) => {
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
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={13} style={{ color: 'var(--primary)' }} /> 
              <strong>{selectedGroup.quantidade_contatos || 0}</strong> contatos
            </span>
            <span>•</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
              ID: {selectedGroup.id_do_grupo}
            </span>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default ChatHeader;
