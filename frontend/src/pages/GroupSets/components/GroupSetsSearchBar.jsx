import React from 'react';
import { Search } from 'lucide-react';

const GroupSetsSearchBar = ({ searchTerm = '', setSearchTerm }) => {
  return (
    <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
      <Search size={20} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.8 }} />
      <input 
        type="text" 
        placeholder="Buscar por nome ou slug..." 
        className="premium-field"
        style={{ width: '100%', height: '54px', padding: '0 1.5rem 0 3.75rem', borderRadius: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '1rem', color: '#fff' }}
        value={searchTerm}
        onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default GroupSetsSearchBar;
