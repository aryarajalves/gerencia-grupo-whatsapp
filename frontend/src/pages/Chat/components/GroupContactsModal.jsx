import React, { useState, useEffect } from 'react';
import { X, Search, Copy, Check, Users, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '../../../services/api';
import { toastSucesso } from '../../../utils/toastNotifications';

const GroupContactsModal = ({ group, onClose }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Estados de Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);

  useEffect(() => {
    if (!group?.id_do_grupo) return;
    
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/contatos/', {
          params: {
            jid_grupo: group.id_do_grupo,
            limit: 500
          }
        });
        setContacts(res.data.items || []);
      } catch (err) {
        console.error('Erro ao buscar contatos do grupo:', err);
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [group]);

  const filteredContacts = contacts.filter(c => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const nome = (c.nome || '').toLowerCase();
    const numero = (c.numero || '').toLowerCase();
    return nome.includes(term) || numero.includes(term);
  });

  const totalContacts = filteredContacts.length;
  const totalPages = Math.ceil(totalContacts / resultsPerPage) || 1;
  const startIndex = (currentPage - 1) * resultsPerPage;
  const paginatedContacts = filteredContacts.slice(startIndex, startIndex + resultsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleResultsPerPageChange = (e) => {
    setResultsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleCopySingle = (numero, idx) => {
    if (!numero) return;
    navigator.clipboard.writeText(numero);
    setCopiedIndex(idx);
    toastSucesso('Número Copiado', `O número ${numero} foi copiado para a área de transferência.`);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    if (contacts.length === 0) return;
    const allNumbers = contacts.map(c => c.numero).filter(Boolean).join('\n');
    navigator.clipboard.writeText(allNumbers);
    setCopiedAll(true);
    toastSucesso(
      'Contatos Copiados!', 
      `${contacts.length} número(s) de telefone do grupo foram copiados.`
    );
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div 
        className="glass-card fade-in"
        style={{
          width: '100%',
          maxWidth: '580px',
          maxHeight: '88vh',
          background: '#161822',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6'
            }}>
              <Users size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                Contatos do Grupo
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                {group?.nome} ({contacts.length} extraídos)
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Bar */}
        <div style={{ padding: '1rem 1.5rem', display: 'flex', gap: '10px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ flex: 1, position: 'relative', minWidth: '180px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              placeholder="Buscar nome ou número..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.85rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            onClick={handleCopyAll}
            disabled={contacts.length === 0}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 14px',
              height: '37px',
              fontSize: '0.82rem',
              fontWeight: 600,
              borderRadius: '8px'
            }}
          >
            {copiedAll ? <Check size={14} /> : <Copy size={14} />}
            {copiedAll ? 'Copiado!' : 'Copiar Todos'}
          </button>
        </div>

        {/* Lista de Contatos Pagina */}
        <div 
          className="custom-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
              <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 10px' }} />
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Carregando contatos do grupo...</p>
            </div>
          ) : paginatedContacts.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
              <Users size={32} opacity={0.3} style={{ margin: '0 auto 10px' }} />
              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                {searchTerm ? 'Nenhum contato encontrado na busca.' : 'Nenhum contato foi extraído deste grupo ainda.'}
              </p>
            </div>
          ) : (
            paginatedContacts.map((c, idx) => (
              <div 
                key={c.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>
                    {c.nome && c.nome !== 'Sem nome' ? c.nome : `Contato (${c.numero})`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                    {c.numero}
                  </div>
                </div>

                <button
                  onClick={() => handleCopySingle(c.numero, startIndex + idx)}
                  style={{
                    background: copiedIndex === (startIndex + idx) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    border: copiedIndex === (startIndex + idx) ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: copiedIndex === (startIndex + idx) ? '#10b981' : '#fff',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                  title="Copiar número de telefone"
                >
                  {copiedIndex === (startIndex + idx) ? <Check size={13} /> : <Copy size={13} />}
                  {copiedIndex === (startIndex + idx) ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer com Paginação */}
        <div style={{
          padding: '0.85rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {/* Seletor Exibir por página */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Exibir:</span>
            <select
              value={resultsPerPage}
              onChange={handleResultsPerPageChange}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
                padding: '3px 6px'
              }}
            >
              <option value={20} style={{ background: '#1c1e26' }}>20</option>
              <option value={50} style={{ background: '#1c1e26' }}>50</option>
              <option value={100} style={{ background: '#1c1e26' }}>100</option>
              <option value={200} style={{ background: '#1c1e26' }}>200</option>
            </select>
          </div>

          {/* Navegação de Páginas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {totalContacts > 0 ? `${startIndex + 1}-${Math.min(startIndex + resultsPerPage, totalContacts)} de ${totalContacts}` : '0 de 0'}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage <= 1 ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Página Anterior"
              >
                <ChevronLeft size={16} />
              </button>

              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', padding: '0 4px' }}>
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage >= totalPages ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Próxima Página"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <button 
            className="btn btn-secondary"
            onClick={onClose}
            style={{ padding: '6px 16px', fontSize: '0.8rem' }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupContactsModal;
