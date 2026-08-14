import React from 'react';
import { Ghost, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

const GhostTab = ({ novoGrupo, setNovoGrupo }) => {
  const isAtivo = Boolean(novoGrupo.numero_fantasma_ativo);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s ease-in-out' }}>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label className="label-premium" style={{ margin: 0 }}>
            <Ghost size={14} style={{ color: '#c084fc' }} /> Monitoramento por Número Fantasma
          </label>
        </div>

        {/* Toggle de Ativação/Desativação do Número Fantasma no Grupo */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <label style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, 
            padding: '12px 14px', borderRadius: '10px', 
            border: `1px solid ${isAtivo ? 'rgba(192, 132, 252, 0.5)' : 'var(--border)'}`, 
            background: isAtivo ? 'rgba(192, 132, 252, 0.08)' : 'transparent', 
            transition: 'all 0.2s' 
          }}>
            <input 
              type="radio" 
              name="numero_fantasma_ativo" 
              value="sim" 
              checked={isAtivo} 
              onChange={() => setNovoGrupo({ ...novoGrupo, numero_fantasma_ativo: true })} 
              style={{ accentColor: '#c084fc' }} 
            />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: isAtivo ? '#c084fc' : 'var(--text)' }}>
                Ativado para este Grupo
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                O número fantasma monitorará este grupo e mensagens privadas
              </div>
            </div>
          </label>

          <label style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, 
            padding: '12px 14px', borderRadius: '10px', 
            border: `1px solid ${!isAtivo ? 'rgba(148, 163, 184, 0.3)' : 'var(--border)'}`, 
            background: !isAtivo ? 'rgba(148, 163, 184, 0.05)' : 'transparent', 
            transition: 'all 0.2s' 
          }}>
            <input 
              type="radio" 
              name="numero_fantasma_ativo" 
              value="nao" 
              checked={!isAtivo} 
              onChange={() => setNovoGrupo({ ...novoGrupo, numero_fantasma_ativo: false })} 
              style={{ accentColor: '#94a3b8' }} 
            />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: !isAtivo ? '#94a3b8' : 'var(--text)' }}>
                Desativado
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                Sem monitoramento do número fantasma neste grupo
              </div>
            </div>
          </label>
        </div>

        {/* Card Informativo de Funcionamento */}
        <div style={{
          background: 'rgba(168, 85, 247, 0.05)',
          border: '1px solid rgba(168, 85, 247, 0.18)',
          borderRadius: '10px',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={16} style={{ color: '#c084fc', flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c084fc' }}>
              Como funciona o Número Fantasma no grupo?
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: '1.45' }}>
            1. Certifique-se de que as credenciais do Número Fantasma estejam cadastradas em <strong>Configurações &gt; Número Fantasma</strong>.<br />
            2. Adicione o WhatsApp do Número Fantasma dentro deste grupo como um <strong>participante comum (não administrador)</strong>.<br />
            3. Quando ativado, o sistema monitorará os eventos deste grupo utilizando a instância fantasma.
          </p>
        </div>

        <div style={{
          marginTop: '10px',
          background: 'rgba(245, 158, 11, 0.05)',
          border: '1px solid rgba(245, 158, 11, 0.18)',
          borderRadius: '8px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <ShieldAlert size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <span style={{ fontSize: '0.78rem', color: '#fcd34d' }}>
            <strong>Importante:</strong> Mantenha sempre o número fantasma como membro normal no WhatsApp para não levantar suspeitas no grupo.
          </span>
        </div>

      </div>
    </div>
  );
};

export default GhostTab;
