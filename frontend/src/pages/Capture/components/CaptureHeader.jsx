import React from 'react';
import { Zap, MessageSquareQuote, ExternalLink } from 'lucide-react';

const CaptureHeader = ({ activeTab = 'mensagens', setActiveTab }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '12px', 
          background: 'rgba(34, 211, 238, 0.15)', 
          border: '1px solid rgba(34, 211, 238, 0.3)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Zap size={19} style={{ color: '#22d3ee' }} />
        </div>
        <div>
          <h1 style={{ margin: 0 }}>Captura de Mensagens</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', margin: 0 }}>
            Receba, consulte e filtre mensagens registradas nos grupos
          </p>
        </div>
      </div>

      {/* Seletor de Abas */}
      <div className="view-switcher" style={{ background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <button 
          type="button"
          className={`view-btn ${activeTab === 'mensagens' ? 'active' : ''}`}
          onClick={() => setActiveTab && setActiveTab('mensagens')}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <MessageSquareQuote size={16} /> Mensagens Capturadas
        </button>
        <button 
          type="button"
          className={`view-btn ${activeTab === 'webhook' ? 'active' : ''}`}
          onClick={() => setActiveTab && setActiveTab('webhook')}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <ExternalLink size={16} /> Configurar Webhook
        </button>
      </div>
    </div>
  );
};

export default CaptureHeader;
