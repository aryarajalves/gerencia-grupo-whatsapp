import React, { useState, useRef, useEffect } from 'react';
import { CalendarDays, Clock, Tag, ChevronDown, ChevronUp, Check, X, Sparkles } from 'lucide-react';

const MessageScheduleRow = ({
  diaDoLancamento = 1,
  onChangeDia,
  horarioDoDisparo = '',
  onChangeHorario,
  etiqueta = '',
  onChangeEtiqueta,
  mensagens = []
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef(null);

  // Extrai lista única de etiquetas existentes
  const existingTags = [...new Set((mensagens || []).map(m => m.etiqueta).filter(Boolean))];

  // Filtra etiquetas pelo que foi digitado
  const filteredTags = existingTags.filter(t => 
    t.toLowerCase().includes((etiqueta || '').trim().toLowerCase())
  );

  const isNewTag = (etiqueta || '').trim() && !existingTags.some(t => t.toLowerCase() === etiqueta.trim().toLowerCase());

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTag = (tag) => {
    if (onChangeEtiqueta) {
      onChangeEtiqueta(tag);
    }
    setDropdownOpen(false);
  };

  const handleClearTag = (e) => {
    e.stopPropagation();
    if (onChangeEtiqueta) {
      onChangeEtiqueta('');
    }
  };

  return (
    <>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="label-premium"><CalendarDays size={12} /> Dia do Lançamento</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select 
            value={diaDoLancamento} 
            onChange={e => onChangeDia && onChangeDia(parseInt(e.target.value, 10))}
            className="input-premium"
            style={{ width: '100%', fontSize: '1.1rem', fontWeight: 700 }}
          >
            {[1, 2, 3, 4, 5, 6, 7].map(d => (
              <option key={d} value={d}>Dia {d}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="label-premium"><Clock size={12} /> Horário do Disparo</label>
        <input 
          type="time" 
          value={horarioDoDisparo} 
          onChange={e => onChangeHorario && onChangeHorario(e.target.value)} 
          required 
          style={{ width: '100%', fontSize: '1.1rem', fontWeight: 700 }} 
        />
      </div>

      {/* 3. Etiqueta / Tag */}
      <div className="form-group" style={{ marginBottom: 0 }} ref={containerRef}>
        <label className="label-premium"><Tag size={12} /> Etiqueta / Tag (Opcional)</label>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Digite ou escolha uma etiqueta..." 
              value={etiqueta || ''} 
              onChange={e => {
                if (onChangeEtiqueta) onChangeEtiqueta(e.target.value);
                setDropdownOpen(true);
              }} 
              onFocus={() => setDropdownOpen(true)}
              style={{ 
                width: '100%', 
                fontSize: '0.95rem', 
                fontWeight: 600,
                paddingRight: '60px' 
              }} 
            />

            <div style={{
              position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              {etiqueta && (
                <button
                  type="button"
                  onClick={handleClearTag}
                  title="Limpar etiqueta"
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-dim)',
                    cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center'
                  }}
                >
                  <X size={14} />
                </button>
              )}

              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                title="Ver etiquetas existentes"
                style={{
                  background: 'none', border: 'none', color: dropdownOpen ? '#a78bfa' : 'var(--text-dim)',
                  cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center',
                  transition: 'color 0.2s'
                }}
              >
                {dropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {/* Dropdown Customizado Bonito - Ancorado logo abaixo do input */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              zIndex: 1050,
              background: 'rgba(23, 25, 35, 0.98)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(16px)',
              maxHeight: '220px',
              overflowY: 'auto',
              padding: '6px',
              animation: 'fadeIn 0.15s ease-out'
            }}>
              {/* Opção de criar nova etiqueta se o que foi digitado não existe */}
              {isNewTag && (
                <button
                  type="button"
                  onClick={() => handleSelectTag(etiqueta.trim())}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'rgba(124, 58, 237, 0.15)',
                    border: '1px dashed rgba(124, 58, 237, 0.4)',
                    color: '#c4b5fd',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginBottom: '6px'
                  }}
                >
                  <Sparkles size={14} style={{ color: '#a78bfa', flexShrink: 0 }} />
                  <span>Criar nova: <strong>"{etiqueta.trim()}"</strong></span>
                </button>
              )}

              {filteredTags.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{
                    padding: '4px 8px', fontSize: '0.7rem', fontWeight: 700,
                    color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>
                    Etiquetas cadastradas
                  </div>
                  {filteredTags.map(tag => {
                    const isSelected = (etiqueta || '').trim() === tag;
                    return (
                      <button
                        type="button"
                        key={tag}
                        className="tag-dropdown-option"
                        data-testid="tag-option"
                        onClick={() => handleSelectTag(tag)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(124, 58, 237, 0.25)' : 'transparent',
                          border: isSelected ? '1px solid rgba(124, 58, 237, 0.5)' : '1px solid transparent',
                          color: isSelected ? '#fff' : 'rgba(255, 255, 255, 0.85)',
                          fontSize: '0.85rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Tag size={13} style={{ color: isSelected ? '#c4b5fd' : '#8b5cf6' }} />
                          <span>{tag}</span>
                        </div>
                        {isSelected && <Check size={14} style={{ color: '#34d399' }} />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                !isNewTag && (
                  <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    {existingTags.length === 0 
                      ? 'Nenhuma etiqueta cadastrada ainda. Digite para criar.' 
                      : 'Nenhuma etiqueta corresponde à busca.'}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MessageScheduleRow;
