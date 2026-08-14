import React, { useState } from 'react';
import { ModalPortal } from '../../../components/common';
import { Users, Check, X } from 'lucide-react';

const BulkAssignGroupsModal = ({ isOpen, onClose, grupos = [], selectedCount, onSave }) => {
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);

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
    onSave(selectedGroupIds);
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
        onClick={onClose}
      >
        <div 
          onClick={e => e.stopPropagation()}
          style={{
            background: 'linear-gradient(135deg, rgba(20, 25, 40, 0.95), rgba(15, 20, 32, 0.98))',
            border: '1px solid rgba(167, 139, 250, 0.3)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(124, 58, 237, 0.2)',
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
            background: 'linear-gradient(90deg, rgba(124,58,237,0.1), transparent)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'rgba(167, 139, 250, 0.15)', border: '1px solid rgba(167, 139, 250, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa'
              }}>
                <Users size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>Atribuir Grupos Destinatários</h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  Aplicando a {selectedCount} mensagem(ns) selecionada(s)
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

          {/* Subheader / Select All */}
          <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              {selectedGroupIds.length} de {grupos.length} grupo(s) selecionado(s)
            </span>
            <button
              type="button"
              onClick={selectAll}
              style={{
                background: 'none', border: 'none', color: '#a78bfa', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              {selectedGroupIds.length === grupos.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
            </button>
          </div>

          {/* Body / List */}
          <div style={{ padding: '1rem 1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {grupos.length === 0 ? (
              <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem 0', margin: 0, fontSize: '0.9rem' }}>
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
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: isSelected ? 'rgba(124, 58, 237, 0.15)' : 'rgba(255,255,255,0.02)',
                      border: isSelected ? '1px solid rgba(167, 139, 250, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Handled by div click
                      style={{ width: '16px', height: '16px', accentColor: '#8b5cf6', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>{g.nome}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>ID: {g.id_do_grupo}</div>
                    </div>
                    {isSelected && <Check size={16} style={{ color: '#a78bfa' }} />}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justify: 'flex-end',
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
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)'
              }}
            >
              Salvar para {selectedCount} mensagem(ns)
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default BulkAssignGroupsModal;
