import React from 'react';
import { Users, CalendarDays, Clock, Check, ListChecks, Pencil, PauseCircle, PlayCircle, Repeat, Flag, AlertTriangle, Lock, LockOpen, HelpCircle } from 'lucide-react';
import { DIAS_SEMANA } from '../../../utils/constants';

const GroupTableRow = ({
  group,
  isSelected,
  isEditing,
  idx,
  toggleSelectGroup,
  extrairContatosAgora,
  openConfirm,
  abrirModalMensagens,
  startEdit,
  handleToggle,
  isDisparoHoje,
  getGroupInitials
}) => {
  const g = group;

  return (
    <tr 
      style={{ 
        borderBottom: '1px solid var(--border)', 
        opacity: g.ativo ? 1 : 0.45, 
        background: isSelected 
          ? 'rgba(37,99,235,0.15)' 
          : isEditing 
          ? 'rgba(37,99,235,0.05)' 
          : idx % 2 !== 0 
          ? 'rgba(255,255,255,0.012)' 
          : 'transparent' 
      }}
    >
      <td style={{ padding: '14px 16px', width: '40px', textAlign: 'center' }}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleSelectGroup && toggleSelectGroup(g.id)}
          style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary)' }}
        />
      </td>
      <td style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(37,99,235,0.25))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)' }}>
            {getGroupInitials ? getGroupInitials(g.nome) : (g.nome ? g.nome.substring(0, 2).toUpperCase() : '?')}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {g.nome}
              {isEditing && <span className="badge-warning">Editando</span>}
              
              {/* Badge de Status: Fechado para Admins vs Aberto vs Pendente */}
              {g.status_grupo_fechado === true ? (
                <span 
                  title="Grupo Fechado: Apenas administradores podem enviar mensagens" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '3px', 
                    fontSize: '0.68rem', 
                    fontWeight: 700, 
                    color: '#f87171', 
                    background: 'rgba(239, 68, 68, 0.12)', 
                    border: '1px solid rgba(239, 68, 68, 0.3)', 
                    padding: '1px 6px', 
                    borderRadius: '5px' 
                  }}
                >
                  <Lock size={10} /> Fechado (Só Admins)
                </span>
              ) : g.status_grupo_fechado === false ? (
                <span 
                  title="Grupo Aberto: Todos os participantes podem enviar mensagens" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '3px', 
                    fontSize: '0.68rem', 
                    fontWeight: 700, 
                    color: '#4ade80', 
                    background: 'rgba(34, 197, 94, 0.12)', 
                    border: '1px solid rgba(34, 197, 94, 0.3)', 
                    padding: '1px 6px', 
                    borderRadius: '5px' 
                  }}
                >
                  <LockOpen size={10} /> Aberto (Todos conversam)
                </span>
              ) : (
                <span 
                  title="Aguardando primeira sincronização com a W-API para identificar se o grupo está aberto ou fechado" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '3px', 
                    fontSize: '0.68rem', 
                    fontWeight: 600, 
                    color: '#94a3b8', 
                    background: 'rgba(148, 163, 184, 0.1)', 
                    border: '1px solid rgba(148, 163, 184, 0.25)', 
                    padding: '1px 6px', 
                    borderRadius: '5px' 
                  }}
                >
                  <HelpCircle size={10} /> Status: Pendente
                </span>
              )}
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              {g.id_do_grupo}
              {g.link_convite ? (
                <span title="Link configurado" style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <Check size={10} /> Link OK
                </span>
              ) : (
                <span title="Sem link" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  (!) Sem Link
                </span>
              )}
            </div>
            {g.ativo && g.total_mensagens === 0 && (
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '4px', 
                marginTop: '6px', 
                fontSize: '0.65rem', 
                fontWeight: 700, 
                color: '#f87171', 
                background: 'rgba(248,113,113,0.1)', 
                padding: '2px 6px', 
                borderRadius: '4px',
                border: '1px solid rgba(248,113,113,0.2)'
              }}>
                <AlertTriangle size={10} /> SEM CONTEÚDO (NADA SERÁ DISPARADO)
              </div>
            )}
          </div>
        </div>
      </td>
      <td style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem' }}>
            <CalendarDays size={13} style={{ color: 'var(--text-dim)' }} />
            <span>{DIAS_SEMANA[g.dia_inicio_semana]} → {DIAS_SEMANA[g.dia_fim_semana]}</span>
          </div>
          {g.tipo_ciclo === 'unico' ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 600, color: '#f59e0b', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '6px', padding: '2px 7px', width: 'fit-content' }}>
              <Flag size={10} /> Único
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary)', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '6px', padding: '2px 7px', width: 'fit-content' }}>
              <Repeat size={10} /> Semanal
            </span>
          )}
        </div>
      </td>
      <td style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--accent)', fontWeight: 600 }}>
          <Users size={13} />
          <span>{g.quantidade_contatos || 0}</span>
        </div>
      </td>
      <td style={{ padding: '14px 20px' }}>
        {g.dia_lancamento_atual > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="badge-success" style={{ width: 'fit-content' }}>DIA {g.dia_lancamento_atual.toString().padStart(2,'0')}</span>
            {isDisparoHoje(g) ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.65rem', fontWeight: 800, color: '#38bdf8', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.35)', borderRadius: '6px', padding: '2px 6px', width: 'fit-content' }}>
                ⚡ DISPARO HOJE
              </span>
            ) : (
              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                Sem disparo hoje
              </span>
            )}
          </div>
        ) : (
          <span className="badge-dim"><Clock size={12} /> Aguardando</span>
        )}
      </td>

      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
        <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
          {extrairContatosAgora && (
            <button 
              onClick={() => {
                if (typeof openConfirm === 'function') {
                  openConfirm({
                    title: 'Extrair Contatos Manualmente',
                    message: `Deseja iniciar a busca e sincronização manual de contatos para o grupo "${g.nome}"? Os contatos encontrados serão salvos e despachados via webhook.`,
                    type: 'info',
                    confirmText: 'Extrair Agora',
                    confirmTextChecked: 'Reenviar para Todos',
                    checkboxLabel: 'Disparar webhook para todos os membros',
                    checkboxDescription: 'Reenvia o webhook mesmo para quem já foi disparado anteriormente (administradores continuam excluídos).',
                    defaultCheckboxChecked: false,
                    onConfirm: (forcarReenvio) => extrairContatosAgora(g.id, g.nome, forcarReenvio)
                  });
                } else {
                  extrairContatosAgora(g.id, g.nome);
                }
              }} 
              disabled={!!isEditing} 
              className="btn-icon-accent" 
              title="Extrair Contatos Agora"
            >
              <Users size={14} />
            </button>
          )}
          <button onClick={() => abrirModalMensagens(g)} disabled={!!isEditing} className="btn-icon-secondary" title="Vincular Mensagens"><ListChecks size={14} /></button>
          <button onClick={() => startEdit(g)} disabled={!!isEditing} className="btn-icon-secondary" title="Editar Grupo"><Pencil size={14} /></button>
          <button onClick={() => handleToggle(g.id)} disabled={!!isEditing} className="btn-icon-warning" title={g.ativo ? "Pausar" : "Ativar"}>{g.ativo ? <PauseCircle size={14} /> : <PlayCircle size={14} />}</button>
        </div>
      </td>
    </tr>
  );
};

export default GroupTableRow;
