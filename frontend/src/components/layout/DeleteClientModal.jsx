import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ModalPortal } from '../common';
import { toast } from 'react-hot-toast';

const DeleteClientModal = ({ clientToDelete, onClose, onDeleteClient }) => {
  const [loading, setLoading] = useState(false);

  if (!clientToDelete) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onDeleteClient(clientToDelete.id);
      toast.success(`Cliente '${clientToDelete.nome}' removido com sucesso!`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao remover cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999,
        padding: '1.5rem'
      }}>
        <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '2rem', borderRadius: '24px', background: '#161822', border: '1px solid rgba(239, 68, 68, 0.3)', boxShadow: '0 25px 50px rgba(0,0,0,0.6)', textAlign: 'center' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', margin: '0 auto 1.25rem auto' }}>
            <AlertTriangle size={28} />
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Excluir Cliente?</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Tem certeza que deseja excluir o cliente <strong style={{ color: '#fff' }}>"{clientToDelete.nome}"</strong>? Esta ação desativará a instância do sistema.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button 
              type="button" 
              disabled={loading} 
              onClick={handleConfirm} 
              className="btn"
              style={{ flex: 1, background: '#ef4444', color: '#fff', fontWeight: 700 }}
            >
              {loading ? 'Excluindo...' : 'Excluir Cliente'}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default DeleteClientModal;
