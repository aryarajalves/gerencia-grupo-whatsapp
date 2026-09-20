import React from 'react';
import { ListChecks, RefreshCw, Calendar } from 'lucide-react';

const PollSelectionList = ({
  enquetesDisponiveis = [],
  selectedPollIds = [],
  loadingEnquetes = false,
  togglePollSelection,
  handleSelectAll,
  handleDeselectAll
}) => {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(236, 72, 153, 0.25)',
      borderRadius: '10px',
      padding: '12px 14px',
      marginBottom: '14px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ListChecks size={14} style={{ color: '#ec4899' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>
            Selecione as Enquetes Programadas Autorizadas ({selectedPollIds.length} selecionada{selectedPollIds.length === 1 ? '' : 's'}):
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={handleSelectAll}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ec4899',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Selecionar Todas
          </button>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>|</span>
          <button
            type="button"
            onClick={handleDeselectAll}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Desmarcar Todas
          </button>
        </div>
      </div>

      {loadingEnquetes ? (
        <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
          <RefreshCw size={14} className="spin" style={{ display: 'inline', marginRight: '6px' }} />
          Carregando enquetes cadastradas...
        </div>
      ) : enquetesDisponiveis.length === 0 ? (
        <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Nenhuma mensagem do tipo <strong>Enquete</strong> foi encontrada no sistema. Crie enquetes na aba <strong>Mensagens</strong> para poder vinculá-las aqui.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
          {enquetesDisponiveis.map((enq) => {
            const isSelected = selectedPollIds.includes(String(enq.id));
            const opcoesList = (enq.opcoes_enquete || '').split('\n').filter(Boolean);
            return (
              <div
                key={enq.id}
                onClick={() => togglePollSelection && togglePollSelection(enq.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: isSelected ? 'rgba(236, 72, 153, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${isSelected ? 'rgba(236, 72, 153, 0.4)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}} // Tratado no onClick do container
                  style={{ accentColor: '#ec4899', marginTop: '3px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isSelected ? '#ec4899' : 'var(--text)' }}>
                      {enq.mensagem || 'Enquete sem título'}
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'var(--text-dim)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Calendar size={10} /> Dia {enq.dia_do_lancamento} às {enq.horario_do_disparo}
                    </span>
                  </div>
                  {opcoesList.length > 0 && (
                    <div style={{ fontSize: '0.70rem', color: 'var(--text-dim)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Opções: {opcoesList.join(' • ')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PollSelectionList;
