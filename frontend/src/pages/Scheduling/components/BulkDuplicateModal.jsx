import React, { useState, useEffect } from 'react';
import { ModalPortal } from '../../../components/common';
import { Copy, Check, X, Calendar, Users } from 'lucide-react';

const BulkDuplicateModal = ({ isOpen, onClose, grupos = [], selectedCount, defaultDay = 1, onSave }) => {
  const [diaDoLancamento, setDiaDoLancamento] = useState(defaultDay);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setDiaDoLancamento(defaultDay || 1);
      setSelectedGroupIds([]);
    }
  }, [isOpen, defaultDay]);

  if (!isOpen) return null;

  const toggleGroup = (id) => {
    if (selectedGroupIds.includes(id)) {
      setSelectedGroupIds(selectedGroupIds.filter(gId => gId !== id));
    } else {
      setSelectedGroupIds([...selectedGroupIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedGroupIds.length === grupos.length) {
      setSelectedGroupIds([]);
    } else {
      setSelectedGroupIds(grupos.map(g => g.id));
    }
  };

  const handleConfirm = () => {
    const day = parseInt(diaDoLancamento) || 1;
    onSave(day, selectedGroupIds);
    onClose();
  };

  return (
    <ModalPortal>
      <div 
        style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        <div 
          onClick={e => e.stopPropagation()}
          style={{
            background: 'linear-gradient(135deg, rgba(20, 25, 40, 0.95), rgba(15, 20, 32, 0.98))',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(37, 99, 235, 0.2)',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '520px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(37, 99, 235, 0.15), transparent)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa'
              }}>
                <Copy size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>Duplicar Mensagens Selecionadas</h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  Duplicando {selectedCount} mensagem(ns) selecionada(s)
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Body Content */}
          <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Campo Dia do Lançamento (Select 1 a 7) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} style={{ color: '#60a5fa' }} />
                Novo Dia do Lançamento:
              </label>
              <select 
                value={diaDoLancamento}
                onChange={(e) => setDiaDoLancamento(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7].map(d => (
                  <option key={d} value={d} style={{ background: '#0f172a', color: '#fff' }}>
                    Dia {d}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                As novas cópias serão agendadas com este dia e manterão os mesmos horários originais.
              </span>
            </div>

            {/* Seleção de Grupos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={15} style={{ color: '#60a5fa' }} />
                  Vincular aos Grupos (Opcional):
                </label>
                {grupos.length > 0 && (
                  <button
                    type="button"
                    onClick={selectAll}
                    style={{
                      background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    {selectedGroupIds.length === grupos.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                  </button>
                )}
              </div>

              <div style={{ 
                maxHeight: '180px', 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '6px',
                paddingRight: '4px'
              }}>
                {grupos.length === 0 ? (
                  <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '1rem 0', margin: 0, fontSize: '0.85rem' }}>
                    Nenhum grupo cadastrado.
                  </p>
                ) : (
                  grupos.map(g => {
                    const isSelected = selectedGroupIds.includes(g.id);
                    return (
                      <div
                        key={g.id}
                        onClick={() => toggleGroup(g.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.02)',
                          border: isSelected ? '1px solid rgba(96, 165, 250, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          style={{ width: '16px', height: '16px', accentColor: '#3b82f6', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{g.nome}</span>
                        </div>
                        {isSelected && <Check size={16} style={{ color: '#60a5fa' }} />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            background: 'rgba(0,0,0,0.3)'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="btn btn-primary"
              style={{
                padding: '8px 18px', fontSize: '0.85rem', fontWeight: 600,
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)'
              }}
            >
              Duplicar {selectedCount} mensagem(ns)
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default BulkDuplicateModal;
