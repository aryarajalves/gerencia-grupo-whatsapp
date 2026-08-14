import React from 'react';
import { ShieldCheck, X, UserMinus, MessageSquare } from 'lucide-react';

const DEFAULT_MSG_REMOCAO = "🚫 [ALERTA DE SEGURANÇA] O participante @{numero} enviou uma mensagem em grupo fechado sem autorização e foi removido do grupo. Motivo: Violação das regras de comunicação.";

const SecurityTab = ({
  novoGrupo,
  setNovoGrupo,
  admsList,
  admInput,
  setAdmInput,
  handleAdmKeyDown,
  handleAdmBlur,
  removeAdmBadge
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s ease-in-out' }}>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label className="label-premium" style={{ margin: 0 }}>
            <ShieldCheck size={12} style={{ color: '#38bdf8' }} /> Lista de Segurança de Administradores
          </label>
        </div>

        {/* Toggle de Ativação/Desativação da Lista de Segurança */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${novoGrupo.seguranca_adms_ativa ? 'rgba(56, 189, 248, 0.5)' : 'var(--border)'}`, background: novoGrupo.seguranca_adms_ativa ? 'rgba(56, 189, 248, 0.08)' : 'transparent', transition: 'all 0.2s' }}>
            <input type="radio" name="seguranca_adms_ativa" value="sim" checked={Boolean(novoGrupo.seguranca_adms_ativa)} onChange={() => setNovoGrupo({ ...novoGrupo, seguranca_adms_ativa: true })} style={{ accentColor: '#38bdf8' }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: novoGrupo.seguranca_adms_ativa ? '#38bdf8' : 'var(--text)' }}>Ativada</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>Protege o grupo e monitora mensagens quando fechado</div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${!novoGrupo.seguranca_adms_ativa ? 'rgba(148, 163, 184, 0.3)' : 'var(--border)'}`, background: !novoGrupo.seguranca_adms_ativa ? 'rgba(148, 163, 184, 0.05)' : 'transparent', transition: 'all 0.2s' }}>
            <input type="radio" name="seguranca_adms_ativa" value="nao" checked={!novoGrupo.seguranca_adms_ativa} onChange={() => setNovoGrupo({ ...novoGrupo, seguranca_adms_ativa: false })} style={{ accentColor: '#94a3b8' }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: !novoGrupo.seguranca_adms_ativa ? '#94a3b8' : 'var(--text)' }}>Desativada</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>Sem alertas ou remoção automática</div>
            </div>
          </label>
        </div>

        {/* Campo de Badges */}
        {novoGrupo.seguranca_adms_ativa && (
          <>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '6px',
              minHeight: '44px',
              padding: '6px 12px',
              borderRadius: '10px',
              border: admsList.length > 0 ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid var(--border)',
              background: admsList.length > 0 ? 'rgba(56, 189, 248, 0.04)' : 'rgba(0, 0, 0, 0.2)',
              transition: 'border 0.2s, background 0.2s'
            }}>
              <ShieldCheck size={14} style={{ color: admsList.length > 0 ? '#38bdf8' : 'var(--text-dim)', flexShrink: 0, marginRight: '2px' }} />
              
              {admsList.map((adm, index) => (
                <span key={index} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38bdf8',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  fontFamily: 'monospace'
                }}>
                  {adm}
                  <button
                    type="button"
                    onClick={() => removeAdmBadge(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(56, 189, 248, 0.7)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: 0,
                      marginLeft: '2px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(56, 189, 248, 0.7)'}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={admInput}
                onChange={e => setAdmInput(e.target.value)}
                onKeyDown={handleAdmKeyDown}
                onBlur={handleAdmBlur}
                placeholder={admsList.length === 0 ? "Digite o número e aperte Enter..." : "Adicionar outro..."}
                style={{
                  flex: 1,
                  minWidth: '180px',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '0.85rem',
                  padding: '4px 0'
                }}
              />
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {admsList.length > 0
                ? <><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8', display: 'inline-block', flexShrink: 0 }} />{admsList.length} administrador(es) cadastrado(s). A verificação só atuará quando o grupo estiver fechado.</>
                : <>Digite o número de telefone (Ex: 5511999998888) e aperte <b>Enter</b> para criar o badge.</>
              }
            </p>

            {/* Opções de Ação ao Detectar Mensagem Não Autorizada */}
            <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(56, 189, 248, 0.03)', border: '1px solid rgba(56, 189, 248, 0.15)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserMinus size={15} style={{ color: '#ef4444' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Ação para Mensagens de Não-Admins em Grupo Fechado</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${novoGrupo.remover_impostor_msg !== false ? 'rgba(239, 68, 68, 0.5)' : 'var(--border)'}`, background: novoGrupo.remover_impostor_msg !== false ? 'rgba(239, 68, 68, 0.08)' : 'transparent', transition: 'all 0.2s' }}>
                  <input type="radio" name="remover_impostor_msg" value="sim" checked={novoGrupo.remover_impostor_msg !== false} onChange={() => setNovoGrupo({ ...novoGrupo, remover_impostor_msg: true })} style={{ accentColor: '#ef4444' }} />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: novoGrupo.remover_impostor_msg !== false ? '#ef4444' : 'var(--text)' }}>Remover e Alertar no Grupo</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>Apaga a mensagem, remove o contato e envia o aviso</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${novoGrupo.remover_impostor_msg === false ? 'rgba(148, 163, 184, 0.3)' : 'var(--border)'}`, background: novoGrupo.remover_impostor_msg === false ? 'rgba(148, 163, 184, 0.05)' : 'transparent', transition: 'all 0.2s' }}>
                  <input type="radio" name="remover_impostor_msg" value="nao" checked={novoGrupo.remover_impostor_msg === false} onChange={() => setNovoGrupo({ ...novoGrupo, remover_impostor_msg: false })} style={{ accentColor: '#94a3b8' }} />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: novoGrupo.remover_impostor_msg === false ? '#94a3b8' : 'var(--text)' }}>Apenas Alertar no Grupo</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>Não remove o contato do grupo</div>
                  </div>
                </label>
              </div>

              {/* Template da Mensagem Pré-Pronta */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="label-premium" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageSquare size={12} style={{ color: '#38bdf8' }} /> Mensagem Pré-Pronta de Aviso no Grupo
                  </span>
                  <button
                    type="button"
                    onClick={() => setNovoGrupo({ ...novoGrupo, msg_remocao_impostor: DEFAULT_MSG_REMOCAO })}
                    style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                  >
                    Restaurar Mensagem Padrão
                  </button>
                </label>
                <textarea
                  rows={3}
                  value={novoGrupo.msg_remocao_impostor !== undefined && novoGrupo.msg_remocao_impostor !== '' ? novoGrupo.msg_remocao_impostor : DEFAULT_MSG_REMOCAO}
                  onChange={e => setNovoGrupo({ ...novoGrupo, msg_remocao_impostor: e.target.value })}
                  placeholder={DEFAULT_MSG_REMOCAO}
                  style={{
                    width: '100%',
                    fontSize: '0.85rem',
                    lineHeight: '1.4',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'rgba(0,0,0,0.2)',
                    color: '#fff'
                  }}
                />
                <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  💡 Dica: Use a tag <code>{'{numero}'}</code> para marcar o número do contato removido e <code>{'{nome}'}</code> para o nome.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SecurityTab;
