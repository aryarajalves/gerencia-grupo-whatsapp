import React from 'react';

const GroupSetsStats = ({ totalSets = 0, activeSets = 0 }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
      <div className="stat-card" style={{ background: 'rgba(23, 25, 33, 0.4)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '20px' }}>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{totalSets}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total de Conjuntos</div>
      </div>
      <div className="stat-card" style={{ background: 'rgba(23, 25, 33, 0.4)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '20px' }}>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{activeSets}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Conjuntos Ativos</div>
      </div>
    </div>
  );
};

export default GroupSetsStats;
