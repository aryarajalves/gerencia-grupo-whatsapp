import React from 'react';
import { Plus } from 'lucide-react';

const GroupSetsHeader = ({ onOpenCreate }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Conjunto de Grupos
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', margin: 0 }}>
          Gerencie pastas de grupos com links de redirecionamento inteligente.
        </p>
      </div>
      <button 
        type="button"
        className="btn btn-primary" 
        onClick={onOpenCreate} 
        style={{ height: '50px', padding: '0 2rem', borderRadius: '14px', boxShadow: '0 8px 25px rgba(var(--primary-rgb), 0.3)' }}
      >
        <Plus size={20} /> Novo Conjunto
      </button>
    </div>
  );
};

export default GroupSetsHeader;
