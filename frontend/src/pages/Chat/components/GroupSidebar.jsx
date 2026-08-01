import React, { useState } from 'react';
import { MessageCircle, Search, Users, User, Pin, ChevronLeft, ChevronRight } from 'lucide-react';

const GroupSidebar = ({ 
  waStatus, 
  groupSearch, 
  setGroupSearch, 
  filteredGroups, 
  selectedGroup, 
  setSelectedGroup 
}) => {
  const [tabFilter, setTabFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [pinnedJids, setPinnedJids] = useState(() => {
    try {
      const saved = localStorage.getItem('zap_pinned_groups');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const togglePin = (e, jid) => {
    e.stopPropagation();
    let updated;
    if (pinnedJids.includes(jid)) {
      updated = pinnedJids.filter(id => id !== jid);
    } else {
      updated = [...pinnedJids, jid];
    }
    setPinnedJids(updated);
    try {
      localStorage.setItem('zap_pinned_groups', JSON.stringify(updated));
    } catch (err) {}
  };

  // Filtragem por aba (Todos, Grupos, Privado)
  const rawFiltered = (filteredGroups || []).filter(g => {
    const isGroup = g.tipo === 'grupo' || g.id_do_grupo?.endsWith('@g.us');
    if (tabFilter === 'grupos') return isGroup;
    if (tabFilter === 'privado') return !isGroup;
    return true;
  });

  // Ordenação: Grupos fixados ficam sempre no topo
  const sortedGroups = [...rawFiltered].sort((a, b) => {
    const aJid = a.id_do_grupo || a.id;
    const bJid = b.id_do_grupo || b.id;
    const aPinned = pinnedJids.includes(aJid);
    const bPinned = pinnedJids.includes(bJid);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  // Paginação
  const totalPages = Math.ceil(sortedGroups.length / itemsPerPage) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const paginatedGroups = sortedGroups.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="glass-card" style={{ width: '320px', display: 'flex', flexDirection: 'column', padding: '1.25rem', height: '100%' }}>
      <div style={{ marginBottom: '0.75rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
          <MessageCircle size={22} className="text-primary" />
          Conversas WhatsApp
        </h2>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '8px 12px', 
          background: 'rgba(255,255,255,0.03)', 
          borderRadius: '10px',
          marginBottom: '0.75rem',
          border: '1px solid var(--border)'
        }}>
          <div className={`status-dot ${waStatus.status === 'conectado' ? 'online' : 'offline'}`} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>
            {waStatus.status === 'conectado' ? 'Conectado' : 'Desconectado'}
          </span>
          <span style={{ 
            fontSize: '0.68rem', 
            padding: '3px 9px', 
            borderRadius: '8px', 
            background: (waStatus.plan_type || 'LITE').toUpperCase() === 'PRO' 
              ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.35), rgba(79, 70, 229, 0.35))' 
              : 'linear-gradient(135deg, rgba(37, 99, 235, 0.25), rgba(14, 165, 233, 0.25))',
            color: (waStatus.plan_type || 'LITE').toUpperCase() === 'PRO' ? '#d8b4fe' : '#60a5fa',
            marginLeft: 'auto',
            fontWeight: 900,
            letterSpacing: '0.05em',
            border: `1.5px solid ${(waStatus.plan_type || 'LITE').toUpperCase() === 'PRO' ? 'rgba(168, 85, 247, 0.8)' : 'rgba(59, 130, 246, 0.7)'}`,
            boxShadow: (waStatus.plan_type || 'LITE').toUpperCase() === 'PRO' 
              ? '0 0 14px rgba(168, 85, 247, 0.5)' 
              : '0 0 12px rgba(59, 130, 246, 0.4)'
          }} title={`Instância WhatsApp: Plano ${(waStatus.plan_type || 'LITE').toUpperCase()}`}>
            {(waStatus.plan_type || 'LITE').toUpperCase() === 'PRO' ? '⚡ PRO' : '🔹 LITE'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '4px', marginBottom: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <button
            onClick={() => { setTabFilter('todos'); setCurrentPage(1); }}
            style={{
              flex: 1, padding: '5px 0', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
              background: tabFilter === 'todos' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
              color: tabFilter === 'todos' ? '#60a5fa' : 'var(--text-dim)',
              transition: 'all 0.2s'
            }}
          >
            Todos
          </button>
          <button
            onClick={() => { setTabFilter('grupos'); setCurrentPage(1); }}
            style={{
              flex: 1, padding: '5px 0', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
              background: tabFilter === 'grupos' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
              color: tabFilter === 'grupos' ? '#34d399' : 'var(--text-dim)',
              transition: 'all 0.2s'
            }}
          >
            Grupos
          </button>
          <button
            onClick={() => { setTabFilter('privado'); setCurrentPage(1); }}
            style={{
              flex: 1, padding: '5px 0', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
              background: tabFilter === 'privado' ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
              color: tabFilter === 'privado' ? '#c084fc' : 'var(--text-dim)',
              transition: 'all 0.2s'
            }}
          >
            Privado
          </button>
        </div>

        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Buscar conversa ou número..." 
            value={groupSearch}
            onChange={(e) => { setGroupSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Seletor de itens por página */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          <span>Exibir por página:</span>
          <select
            value={itemsPerPage}
            onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            style={{
              padding: '3px 8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            <option value={20} style={{ background: '#161822' }}>20</option>
            <option value={50} style={{ background: '#161822' }}>50</option>
            <option value={100} style={{ background: '#161822' }}>100</option>
            <option value={200} style={{ background: '#161822' }}>200</option>
          </select>
        </div>
      </div>

      {/* Lista de Grupos Paginada */}
      <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {paginatedGroups.map(group => {
          const jid = group.id_do_grupo || group.id;
          const isPinned = pinnedJids.includes(jid);
          const isSelected = Boolean(
            selectedGroup && (
              (selectedGroup.id_do_grupo && group.id_do_grupo && selectedGroup.id_do_grupo === group.id_do_grupo) ||
              (selectedGroup.id && group.id && selectedGroup.id === group.id)
            )
          );
          const isGroup = group.tipo === 'grupo' || group.id_do_grupo?.endsWith('@g.us');

          return (
            <div 
              key={jid}
              onClick={() => setSelectedGroup(group)}
              className={`chat-group-item ${isSelected ? 'active' : ''}`}
              style={{
                background: isSelected 
                  ? (isGroup ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.35), rgba(124, 58, 237, 0.25))' : 'linear-gradient(135deg, rgba(147, 51, 234, 0.35), rgba(79, 70, 229, 0.25))')
                  : isPinned
                    ? 'rgba(245, 158, 11, 0.08)'
                    : 'rgba(255, 255, 255, 0.03)',
                border: isSelected 
                  ? (isGroup ? '2px solid #3b82f6' : '2px solid #a855f7') 
                  : isPinned
                    ? '1px solid rgba(245, 158, 11, 0.35)'
                    : '1px solid var(--border)',
                boxShadow: isSelected 
                  ? (isGroup ? '0 0 20px rgba(59, 130, 246, 0.4)' : '0 0 20px rgba(168, 85, 247, 0.4)') 
                  : 'none',
                borderRadius: '14px',
                padding: '10px 12px',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '10px', 
                  background: isSelected 
                    ? (isGroup ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'linear-gradient(135deg, #9333ea, #4f46e5)') 
                    : 'rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  border: isSelected ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: isSelected ? '0 4px 12px rgba(37,99,235,0.5)' : 'none',
                  flexShrink: 0
                }}>
                  {isGroup ? (group.nome ? group.nome.substring(0, 2).toUpperCase() : 'GR') : <User size={18} />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontWeight: isSelected ? 800 : 600, 
                    fontSize: '0.88rem',
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {group.nome}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: isSelected ? 'rgba(255,255,255,0.85)' : 'var(--text-dim)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ 
                      fontSize: '0.58rem', padding: '1px 5px', borderRadius: '4px', fontWeight: 800,
                      background: isGroup ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                      color: isGroup ? '#60a5fa' : '#c084fc'
                    }}>
                      {isGroup ? 'Grupo' : 'Privado'}
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group.id_do_grupo?.split('@')[0]}</span>
                  </div>
                </div>

                {/* Botão Fixar Conversa */}
                <button
                  onClick={(e) => togglePin(e, jid)}
                  title={isPinned ? "Desafixar conversa" : "Fixar conversa no topo"}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isPinned ? '#fbbf24' : 'rgba(255,255,255,0.25)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                >
                  <Pin size={15} style={{ transform: isPinned ? 'rotate(45deg)' : 'none', fill: isPinned ? '#fbbf24' : 'none' }} />
                </button>

                {isSelected && (
                  <div style={{
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '10px',
                    background: isGroup ? '#3b82f6' : '#a855f7',
                    color: '#fff',
                    boxShadow: isGroup ? '0 0 10px rgba(59,130,246,0.6)' : '0 0 10px rgba(168,85,247,0.6)',
                    letterSpacing: '0.03em',
                    flexShrink: 0
                  }}>
                    ABERTO
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {sortedGroups.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            Nenhuma conversa encontrada
          </div>
        )}
      </div>

      {/* Rodapé de Paginação */}
      {sortedGroups.length > 0 && (
        <div style={{
          marginTop: '10px',
          paddingTop: '10px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: 'var(--text-dim)'
        }}>
          <button
            disabled={safePage <= 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            style={{
              padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.03)', color: '#fff', cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
              opacity: safePage <= 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <ChevronLeft size={13} /> Ant
          </button>

          <span>Pág {safePage} de {totalPages}</span>

          <button
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            style={{
              padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.03)', color: '#fff', cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
              opacity: safePage >= totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            Próx <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
};

export default GroupSidebar;

