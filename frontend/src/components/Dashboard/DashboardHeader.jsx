import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Filter, Search, ChevronDown, Check, X } from 'lucide-react';

const DashboardHeader = ({
  dateStr,
  waStatus,
  grupos = [],
  selectedGroupJid,
  setSelectedGroupJid
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedGroupObj = grupos.find(g => g.id_do_grupo === selectedGroupJid);
  const selectedLabel = selectedGroupJid === 'TODOS'
    ? `Todos os Grupos (${grupos.length})`
    : (selectedGroupObj?.nome || 'Grupo Selecionado');

  const filteredGrupos = grupos.filter(g =>
    (g.nome || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (jid) => {
    setSelectedGroupJid(jid);
    setIsOpen(false);
    setSearchQuery('');
  };

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

      {/* Controls: Searchable Group Dropdown & System Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* Seletor Customizado Pesquisável de Grupos */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 14px',
              borderRadius: '12px',
              background: 'rgba(15, 23, 42, 0.95)',
              border: isOpen ? '1px solid var(--primary)' : '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: isOpen ? '0 0 12px rgba(37,99,235,0.3)' : '0 4px 12px rgba(0, 0, 0, 0.2)',
              color: '#fff',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s ease',
              minWidth: '240px',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <Filter size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, flexShrink: 0 }}>
                Filtrar por:
              </span>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {selectedLabel}
              </span>
            </div>
            <ChevronDown
              size={15}
              style={{
                color: 'var(--text-dim)',
                transform: isOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease',
                flexShrink: 0
              }}
            />
          </button>

          {/* Popover de Busca e Listagem de Grupos */}
          {isOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              width: '320px',
              background: '#0f172a',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '14px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
              zIndex: 1000,
              overflow: 'hidden',
              animation: 'fadeIn 0.15s ease-out'
            }}>
              {/* Campo de Busca Interno */}
              <div style={{
                padding: '10px 12px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Search size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <input
                  type="text"
                  autoFocus
                  placeholder="Digite para buscar grupo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Lista Scrollável de Grupos */}
              <div style={{ maxHeight: '250px', overflowY: 'auto', padding: '6px' }}>
                {/* Opção Padrão: Todos os Grupos */}
                {!searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleSelect('TODOS')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: selectedGroupJid === 'TODOS' ? 'rgba(37,99,235,0.2)' : 'transparent',
                      color: selectedGroupJid === 'TODOS' ? 'var(--primary)' : '#fff',
                      fontSize: '0.85rem',
                      fontWeight: selectedGroupJid === 'TODOS' ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => { if (selectedGroupJid !== 'TODOS') e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={(e) => { if (selectedGroupJid !== 'TODOS') e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span>Todos os Grupos ({grupos.length})</span>
                    {selectedGroupJid === 'TODOS' && <Check size={14} style={{ color: 'var(--primary)' }} />}
                  </button>
                )}

                {/* Itens Filtrados */}
                {filteredGrupos.length > 0 ? (
                  filteredGrupos.map((g) => {
                    const isSelected = selectedGroupJid === g.id_do_grupo;
                    return (
                      <button
                        key={g.id || g.id_do_grupo}
                        type="button"
                        onClick={() => handleSelect(g.id_do_grupo)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: isSelected ? 'rgba(37,99,235,0.2)' : 'transparent',
                          color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                          fontSize: '0.85rem',
                          fontWeight: isSelected ? 700 : 400,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>
                          {g.nome}
                        </span>
                        {isSelected && <Check size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
                      </button>
                    );
                  })
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                    Nenhum grupo encontrado com "{searchQuery}".
                  </div>
                )}
              </div>
            </div>
          )}
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
