import React from 'react';
import { LayoutGrid } from 'lucide-react';

const PollOptionsForm = ({ novaMensagem, setNovaMensagem }) => {
  const rawOpcoes = novaMensagem.opcoes_enquete || '';
  const opcoesArray = (rawOpcoes.split('\n').filter(o => o.trim()).length > 0)
    ? rawOpcoes.split('\n')
    : ['', ''];

  const handleOpcaoChange = (index, value) => {
    const linhas = (novaMensagem.opcoes_enquete || '').split('\n');
    while (linhas.length <= index) linhas.push('');
    linhas[index] = value;
    setNovaMensagem({ ...novaMensagem, opcoes_enquete: linhas.join('\n') });
  };

  const handleAddOpcao = () => {
    const linhas = (novaMensagem.opcoes_enquete || '').split('\n');
    linhas.push('');
    setNovaMensagem({ ...novaMensagem, opcoes_enquete: linhas.join('\n') });
  };

  const handleRemoveOpcao = (index) => {
    const linhas = (novaMensagem.opcoes_enquete || '').split('\n').filter((_, i) => i !== index);
    setNovaMensagem({ ...novaMensagem, opcoes_enquete: linhas.join('\n') });
  };

  return (
    <>
      <label className="label-premium"><LayoutGrid size={12} /> Opções da Enquete (Respostas)</label>
      
      {/* Lista de Inputs Numerados Individuais */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        {opcoesArray.map((opcaoText, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              width: '26px', 
              height: '26px', 
              borderRadius: '50%', 
              background: 'rgba(34, 211, 238, 0.15)', 
              color: '#22d3ee', 
              border: '1px solid rgba(34, 211, 238, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.78rem',
              fontWeight: 800,
              flexShrink: 0
            }}>
              {index + 1}
            </span>
            <input
              type="text"
              value={opcaoText}
              onChange={e => handleOpcaoChange(index, e.target.value)}
              placeholder={`Digite a opção ${index + 1}...`}
              style={{ 
                flex: 1, 
                height: '42px', 
                fontSize: '0.9rem', 
                padding: '0 12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                borderRadius: '10px'
              }}
            />
            {/* Botão de Remover Opção (se houver mais de 2 opções) */}
            {((novaMensagem.opcoes_enquete || '').split('\n').length > 2) && (
              <button
                type="button"
                onClick={() => handleRemoveOpcao(index)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
                title="Remover opção"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Botão para Adicionar Nova Opção */}
      <button
        type="button"
        onClick={handleAddOpcao}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderRadius: '8px',
          fontSize: '0.82rem',
          fontWeight: 600,
          background: 'rgba(34, 211, 238, 0.12)',
          color: '#22d3ee',
          border: '1px solid rgba(34, 211, 238, 0.3)',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        + Adicionar Outra Opção
      </button>

      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-main)' }}>
          <input 
            type="checkbox" 
            checked={Boolean(novaMensagem.enquete_multipla)} 
            onChange={e => setNovaMensagem({ ...novaMensagem, enquete_multipla: e.target.checked })}
          />
          Permitir múltiplas respostas
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-main)' }}>
          <input 
            type="checkbox" 
            checked={novaMensagem.webhook_enquete_ativo !== false} 
            onChange={e => setNovaMensagem({ ...novaMensagem, webhook_enquete_ativo: e.target.checked })}
            style={{ accentColor: '#ec4899' }}
          />
          <span style={{ color: novaMensagem.webhook_enquete_ativo !== false ? '#ec4899' : 'var(--text-dim)', fontWeight: 500 }}>
            Enviar respostas desta enquete para o Webhook do Grupo
          </span>
        </label>
      </div>
    </>
  );
};

export default PollOptionsForm;
