import React from 'react';
import { Clock, Pencil, Trash2 } from 'lucide-react';
import { TIPO_CONFIG } from '../../../utils/constants';

const MessageCard = ({
  message,
  day,
  messageNumberOnDay,
  isEditing = false,
  isSelected = false,
  toggleSelect,
  onEdit,
  onDelete,
  openConfirm,
  setFullscreenMedia
}) => {
  const m = message;
  const cfg = TIPO_CONFIG[m.tipo_de_mensagem] || TIPO_CONFIG.texto;
  const Icon = cfg.icon;

  return (
    <div 
      className={`card ${isEditing ? 'editing-pulse' : ''}`} 
      style={{ 
        padding: '1rem', 
        border: isSelected 
          ? '2px solid rgba(167, 139, 250, 0.8)' 
          : isEditing 
            ? '2px solid var(--primary)' 
            : `1px solid ${cfg.border || 'var(--border)'}`, 
        background: isSelected
          ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.18), rgba(37, 99, 235, 0.12))'
          : `linear-gradient(135deg, ${cfg.bg}, rgba(255,255,255,0.02))`, 
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '180px',
        boxShadow: isSelected ? '0 0 20px rgba(124, 58, 237, 0.25)' : isEditing ? `0 0 30px ${cfg.bg}` : 'none',
        transition: 'all 0.2s ease'
      }}
    >
      <div>
        {/* Cabeçalho do Card: Checkbox + Número do dia + Tipo de Mensagem + Horário + Etiqueta */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              aria-label={`Selecionar mensagem ${messageNumberOnDay}`}
              checked={isSelected}
              onChange={() => toggleSelect && toggleSelect(m.id)}
              style={{
                width: '18px', height: '18px', cursor: 'pointer',
                accentColor: '#8b5cf6', flexShrink: 0
              }}
            />
            <span style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff', fontSize: '0.75rem', fontWeight: 800, 
              padding: '2px 7px', borderRadius: '6px' 
            }} title={`Mensagem ${messageNumberOnDay} do Dia ${day}`}>
              #{messageNumberOnDay}
            </span>
            <div style={{ padding: '5px', borderRadius: '6px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
              <Icon size={14} />
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: cfg.color, letterSpacing: '0.5px' }}>
              {cfg.label}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 600 }}>
              <Clock size={12} /> {String(m.horario_do_disparo || '').slice(0, 5)}
            </div>
            {m.etiqueta && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '2px 8px', borderRadius: '12px', fontSize: '0.68rem', fontWeight: 700,
                background: 'rgba(244, 63, 94, 0.15)', color: '#fda4af',
                border: '1px solid rgba(244, 63, 94, 0.3)', backdropFilter: 'blur(4px)'
              }}>
                🏷️ {m.etiqueta}
              </span>
            )}
          </div>
        </div>

        {/* Conteúdo da Mensagem */}
        <div style={{ 
          fontSize: '0.9rem', color: m.mensagem ? 'var(--text-main)' : 'var(--text-dim)', 
          lineHeight: '1.4', marginBottom: '0.75rem', 
          fontStyle: m.tipo_de_mensagem === 'nome_grupo' ? 'italic' : 'normal',
          fontWeight: m.tipo_de_mensagem === 'nome_grupo' ? 600 : 400
        }}>
          {m.tipo_de_mensagem === 'nome_grupo' 
            ? `Alterar nome para: "${m.mensagem}"` 
            : m.tipo_de_mensagem === 'status_grupo' ? (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, padding: '5px 10px', borderRadius: '8px', background: (m.link_midia === 'abrir' || m.mensagem === 'abrir') ? 'rgba(16,185,129,0.15)' : 'rgba(236,72,153,0.15)', color: (m.link_midia === 'abrir' || m.mensagem === 'abrir') ? '#10b981' : '#ec4899', border: '1px solid', borderColor: (m.link_midia === 'abrir' || m.mensagem === 'abrir') ? 'rgba(16,185,129,0.3)' : 'rgba(236,72,153,0.3)' }}>
                    {(m.link_midia === 'abrir' || m.mensagem === 'abrir') ? '🔓 Abrir Grupo (Todos enviam)' : '🔒 Fechar Grupo (Apenas admins enviam)'}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.75rem', padding: '4px 9px', borderRadius: '6px', background: m.admin_only_settings === true ? 'rgba(59,130,246,0.15)' : m.admin_only_settings === false ? 'rgba(16,185,129,0.15)' : 'rgba(167,139,250,0.15)', color: m.admin_only_settings === true ? '#3b82f6' : m.admin_only_settings === false ? '#10b981' : '#a78bfa', border: '1px solid', borderColor: m.admin_only_settings === true ? 'rgba(59,130,246,0.3)' : m.admin_only_settings === false ? 'rgba(16,185,129,0.3)' : 'rgba(167,139,250,0.3)' }}>
                    {m.admin_only_settings === true ? '⚙️ Configs: Apenas Admins Editam' : m.admin_only_settings === false ? '⚙️ Configs: Todos Editam' : '⚙️ Configs: Manter Atual'}
                  </div>
                </div>
                {(m.mensagem && m.mensagem !== 'abrir' && m.mensagem !== 'fechar') ? (
                  <div style={{ marginTop: '6px', fontSize: '0.9rem', color: 'var(--text-main)', fontStyle: 'normal' }}>
                    💬 <strong>Mensagem:</strong> "{m.mensagem}"
                  </div>
                ) : (
                  <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    (Sem mensagem de texto enviada)
                  </div>
                )}
              </div>
            )
            : (m.mensagem || '(Mídia sem legenda)')
          }
        </div>

        {/* Detalhes de Enquete */}
        {m.tipo_de_mensagem === 'enquete' && m.opcoes_enquete && (
          <div style={{ marginBottom: '1rem', background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(34, 211, 238, 0.25)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#22d3ee', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
              Opções da Enquete:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {m.opcoes_enquete.split('\n').filter(o => o.trim()).map((opt, oIdx) => (
                <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#fff', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(34, 211, 238, 0.2)', color: '#22d3ee', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                    {oIdx + 1}
                  </span>
                  <span>{opt}</span>
                </div>
              ))}
            </div>
            {m.enquete_multipla && (
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '8px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ✓ Múltiplas respostas permitidas
              </div>
            )}
          </div>
        )}

        {/* Pré-visualização de Mídia */}
        {m.link_midia && m.tipo_de_mensagem !== 'nome_grupo' && m.tipo_de_mensagem !== 'status_grupo' && (
          <div 
            onClick={() => setFullscreenMedia && setFullscreenMedia({ url: m.link_midia, type: m.tipo_de_mensagem })}
            style={{ 
              marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', 
              height: '50px', border: `1px solid ${cfg.border}`, display: 'flex', 
              alignItems: 'center', gap: '10px', padding: '6px', 
              background: 'rgba(255,255,255,0.03)', cursor: 'zoom-in' 
            }}
          >
            {m.tipo_de_mensagem === 'imagem' ? (
              <img src={m.link_midia} style={{ width: '38px', height: '38px', borderRadius: '4px', objectFit: 'cover' }} alt="Preview" />
            ) : (
              <div style={{ width: '38px', height: '38px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} style={{ color: cfg.color }} />
              </div>
            )}
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {m.link_midia.split('/').pop()}
            </div>
          </div>
        )}
      </div>

      {/* Botões de Ação do Card */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: 'auto' }}>
        <button 
          type="button"
          onClick={() => onEdit && onEdit(m)} 
          className="btn-icon-secondary" 
          style={{ width: '28px', height: '28px', background: isEditing ? 'var(--primary)' : '', color: isEditing ? '#fff' : '' }} 
          title="Editar"
        >
          <Pencil size={12} />
        </button>
        <button 
          type="button"
          onClick={() => onDelete && onDelete(m.id, openConfirm)} 
          className="btn-icon-danger" 
          style={{ width: '28px', height: '28px' }} 
          title="Excluir"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

export default MessageCard;
