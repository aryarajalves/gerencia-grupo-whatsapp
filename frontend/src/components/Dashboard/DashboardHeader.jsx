import React from 'react';
import { LayoutDashboard, Filter } from 'lucide-react';

const DashboardHeader = ({
  dateStr,
  waStatus,
  grupos = [],
  selectedGroupJid,
  setSelectedGroupJid
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px',
      marginBottom: '2rem'
    }}>
      {/* Title & Date */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(37,99,235,0.25), rgba(124,58,237,0.25))',
            border: '1px solid rgba(37,99,235,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <LayoutDashboard size={19} style={{ color: 'var(--primary)' }} />
          </div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
        </div>
        <p style={{
          color: 'var(--text-dim)',
          fontSize: '0.875rem',
          margin: 0,
          marginLeft: '52px',
          textTransform: 'capitalize'
        }}>
          {dateStr}
        </p>
      </div>

      {/* Controls: Group Dropdown & System Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* Seletor Dropdown de Grupos */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '12px',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        }}>
          <Filter size={15} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Filtrar por Grupo:
          </span>
          <select
            value={selectedGroupJid}
            onChange={(e) => setSelectedGroupJid(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              maxWidth: '240px',
              paddingRight: '6px'
            }}
          >
            <option value="TODOS" style={{ background: '#0f172a', color: '#fff' }}>
              Todos os Grupos ({grupos.length})
            </option>
            {grupos.map((g) => (
              <option key={g.id || g.id_do_grupo} value={g.id_do_grupo} style={{ background: '#0f172a', color: '#fff' }}>
                {g.nome}
              </option>
            ))}
          </select>
        </div>

        {/* WhatsApp Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          borderRadius: '10px',
          background: waStatus?.status === 'conectado' ? 'rgba(16,185,129,0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: waStatus?.status === 'conectado' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          <div style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: waStatus?.status === 'conectado' ? '#10b981' : '#ef4444',
            boxShadow: waStatus?.status === 'conectado' ? '0 0 8px #10b981' : '0 0 8px #ef4444',
            animation: 'pulse 2s infinite'
          }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: waStatus?.status === 'conectado' ? '#10b981' : '#ef4444' }}>
            WhatsApp: {typeof waStatus?.status === 'string' ? waStatus.status.toUpperCase() : 'DESCONHECIDO'}
          </span>
        </div>

        {/* Sistema Operacional Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          borderRadius: '10px',
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.2)'
        }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>Sistema Operacional</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
