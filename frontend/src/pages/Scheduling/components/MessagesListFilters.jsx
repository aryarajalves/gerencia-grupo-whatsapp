import React from 'react';
import { Search, CheckSquare, Square, Tag, Layers } from 'lucide-react';

const getTypeConfig = (type) => {
  switch (type) {
    case 'texto':
      return { label: 'Texto', icon: '💬', color: '#60a5fa', bgActive: 'rgba(96,165,250,0.25)' };
    case 'imagem':
      return { label: 'Imagem', icon: '🖼️', color: '#a78bfa', bgActive: 'rgba(167,139,250,0.25)' };
    case 'audio':
      return { label: 'Áudio', icon: '🎙️', color: '#f59e0b', bgActive: 'rgba(245,158,11,0.25)' };
    case 'video':
      return { label: 'Vídeo', icon: '🎬', color: '#ec4899', bgActive: 'rgba(236,72,153,0.25)' };
    case 'enquete':
      return { label: 'Enquete', icon: '📊', color: '#10b981', bgActive: 'rgba(16,185,129,0.25)' };
    case 'arquivo':
      return { label: 'Arquivo', icon: '📁', color: '#6366f1', bgActive: 'rgba(99,102,241,0.25)' };
    case 'status_grupo':
      return { label: 'Status Grupo', icon: '⚙️', color: '#8b5cf6', bgActive: 'rgba(139,92,246,0.25)' };
    default:
      return { label: type ? type.toUpperCase() : 'Outro', icon: '📄', color: '#94a3b8', bgActive: 'rgba(148,163,184,0.25)' };
  }
};

const MessagesListFilters = ({
  searchTerm = '',
  setSearchTerm,
  isAllFilteredSelected = false,
  handleSelectAll,
  onOpenNewForm,
  availableTags = [],
  activeTag = 'ALL',
  setActiveTag,
  availableTypes = [],
  activeType = 'ALL',
  setActiveType,
  availableDays = [],
  activeDay = 'ALL',
  setActiveDay,
  totalMessagesCount = 0,
  mensagens = []
}) => {
  return (
    <>
      {/* Top Controls: Busca + Selecionar Todos + Botão Novo Template */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <button
            type="button"
            onClick={handleSelectAll}
            title={isAllFilteredSelected ? "Desmarcar todas as mensagens" : "Selecionar todas as mensagens filtradas"}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '0 12px', height: '40px', borderRadius: '10px',
              background: isAllFilteredSelected ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isAllFilteredSelected ? 'rgba(167, 139, 250, 0.4)' : 'var(--border)'}`,
              color: isAllFilteredSelected ? '#a78bfa' : 'var(--text-dim)',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
            }}
          >
            {isAllFilteredSelected ? <CheckSquare size={16} /> : <Square size={16} />}
            <span>{isAllFilteredSelected ? 'Desmarcar' : 'Selecionar Todas'}</span>
          </button>

          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              placeholder="Buscar texto ou etiqueta..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              style={{ paddingLeft: '38px', width: '100%', height: '40px' }} 
            />
          </div>
        </div>

        {onOpenNewForm && (
          <button
            type="button"
            onClick={onOpenNewForm}
            className="btn btn-primary"
            style={{ height: '40px', padding: '0 18px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            + Novo Template
          </button>
        )}
      </div>

      {/* Filtro por Etiquetas (Pills) */}
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '8px', 
        overflowX: 'auto', paddingBottom: '8px', marginBottom: '1rem', scrollbarWidth: 'thin'
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', paddingRight: '4px' }}>
          <Tag size={12} /> Etiqueta:
        </span>
        <button
          type="button"
          onClick={() => setActiveTag('ALL')}
          style={{
            padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            border: activeTag === 'ALL' ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)',
            background: activeTag === 'ALL' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.03)',
            color: activeTag === 'ALL' ? '#60a5fa' : 'var(--text-dim)', transition: 'all 0.2s ease'
          }}
        >
          Todas as Etiquetas
        </button>

        {availableTags.map(tag => {
          const countForTag = (mensagens || []).filter(m => m.etiqueta === tag).length;
          const isActive = activeTag === tag;
          return (
            <button
              type="button"
              key={tag}
              onClick={() => setActiveTag(tag)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                border: isActive ? '1px solid #f43f5e' : '1px solid rgba(244,63,94,0.3)',
                background: isActive ? 'rgba(244,63,94,0.25)' : 'rgba(244,63,94,0.08)',
                color: isActive ? '#fda4af' : '#f43f5e', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <span>🏷️ {tag}</span>
              <span style={{ background: isActive ? '#f43f5e' : 'rgba(255,255,255,0.1)', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '0.68rem' }}>
                {countForTag}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filtro por Tipo de Mensagem (Pills) */}
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '8px', 
        overflowX: 'auto', paddingBottom: '8px', marginBottom: '1rem', scrollbarWidth: 'thin'
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', paddingRight: '4px' }}>
          <Layers size={12} /> Tipo:
        </span>
        <button
          type="button"
          onClick={() => setActiveType('ALL')}
          style={{
            padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            border: activeType === 'ALL' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
            background: activeType === 'ALL' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.03)',
            color: activeType === 'ALL' ? '#34d399' : 'var(--text-dim)', transition: 'all 0.2s ease'
          }}
        >
          Todos os Tipos
        </button>

        {availableTypes.map(type => {
          const countForType = (mensagens || []).filter(m => m.tipo_de_mensagem === type).length;
          const isActive = activeType === type;
          const config = getTypeConfig(type);
          return (
            <button
              type="button"
              key={type}
              onClick={() => setActiveType(type)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                border: isActive ? `1px solid ${config.color}` : '1px solid rgba(255,255,255,0.08)',
                background: isActive ? config.bgActive : 'rgba(255,255,255,0.03)',
                color: isActive ? '#fff' : 'var(--text-dim)', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <span>{config.icon} {config.label}</span>
              <span style={{ background: isActive ? config.color : 'rgba(255,255,255,0.1)', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '0.68rem' }}>
                {countForType}
              </span>
            </button>
          );
        })}
      </div>

      {/* Navegação por Abas de Dias */}
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '8px', 
        overflowX: 'auto', paddingBottom: '8px', marginBottom: '1.5rem', scrollbarWidth: 'thin'
      }}>
        <button
          type="button"
          onClick={() => setActiveDay('ALL')}
          style={{
            padding: '8px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            border: activeDay === 'ALL' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
            background: activeDay === 'ALL' ? 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(124,58,237,0.3))' : 'rgba(255,255,255,0.03)',
            color: activeDay === 'ALL' ? '#fff' : 'var(--text-dim)', transition: 'all 0.2s ease',
            boxShadow: activeDay === 'ALL' ? '0 0 15px rgba(37,99,235,0.2)' : 'none'
          }}
        >
          Todos os Dias ({totalMessagesCount})
        </button>

        {availableDays.map(day => {
          const countForDay = (mensagens || []).filter(m => m.dia_do_lancamento === day).length;
          const isActive = activeDay === String(day);
          return (
            <button
              type="button"
              key={day}
              onClick={() => setActiveDay(String(day))}
              style={{
                padding: '8px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                border: isActive ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                background: isActive ? 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(124,58,237,0.3))' : 'rgba(255,255,255,0.03)',
                color: isActive ? '#fff' : 'var(--text-dim)', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: isActive ? '0 0 15px rgba(37,99,235,0.2)' : 'none'
              }}
            >
              <span>DIA {String(day).padStart(2, '0')}</span>
              <span style={{ background: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.1)', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem' }}>
                {countForDay}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};

export default MessagesListFilters;
