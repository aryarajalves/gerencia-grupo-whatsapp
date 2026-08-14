import React from 'react';
import { Users, Search, ExternalLink } from 'lucide-react';
import { ModalPortal } from '../../../../components/common';

const GeneralTab = ({
  novoGrupo,
  setNovoGrupo,
  jidRef,
  jidInputWrapRef,
  jidDropdownOpen,
  setJidDropdownOpen,
  jidSearch,
  setJidSearch,
  jidDropdownRect,
  setJidDropdownRect,
  wapiGrupos,
  wapiGruposFiltrados,
  wapiLoading,
  getGroupInitials
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s ease-in-out' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="label-premium"><Users size={12} /> Nome do Grupo</label>
          <input 
            value={novoGrupo.nome || ''} 
            onChange={e => setNovoGrupo({ ...novoGrupo, nome: e.target.value })} 
            placeholder="Ex: Lançamento VIP A" 
            required 
            style={{ width: '100%' }} 
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0, position: 'relative' }} ref={jidRef}>
          <label className="label-premium"><Search size={12} /> Grupo ID (JID)</label>
          <div style={{ position: 'relative' }} ref={jidInputWrapRef}>
            <Search size={13} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              value={jidDropdownOpen ? jidSearch : (novoGrupo.id_do_grupo ? (() => { const g = (wapiGrupos || []).find(g => g.jid === novoGrupo.id_do_grupo); return g ? `${g.nome} (${g.jid})` : novoGrupo.id_do_grupo; })() : '')}
              onFocus={() => {
                if (jidInputWrapRef.current) {
                  const rect = jidInputWrapRef.current.getBoundingClientRect();
                  setJidDropdownRect({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
                }
                setJidDropdownOpen(true);
                setJidSearch('');
              }}
              onChange={e => { setJidSearch(e.target.value); setNovoGrupo({ ...novoGrupo, id_do_grupo: e.target.value }); }}
              placeholder={wapiLoading ? 'Carregando...' : 'Selecione um grupo...'}
              required 
              autoComplete="off" 
              style={{ width: '100%', paddingLeft: '2.2rem' }}
            />
            {jidDropdownOpen && jidDropdownRect && (
              <ModalPortal>
                <div style={{ position: 'fixed', top: jidDropdownRect.top + 4, left: jidDropdownRect.left, width: jidDropdownRect.width, zIndex: 9999, background: '#13151c', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 16px 48px rgba(0,0,0,0.9)', overflow: 'hidden' }}>
                  <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)', fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>GRUPOS NO WHATSAPP</span>
                    <span>{wapiGruposFiltrados.length} encontrados</span>
                  </div>
                  <div style={{ 
                    maxHeight: '320px', 
                    overflowY: 'auto', 
                    position: 'relative',
                    maskImage: 'linear-gradient(to bottom, black calc(100% - 24px), transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 24px), transparent 100%)'
                  }}>
                    {wapiLoading ? (
                      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>Carregando grupos do WhatsApp...</div>
                    ) : wapiGruposFiltrados.length === 0 ? (
                      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>Nenhum grupo encontrado</div>
                    ) : wapiGruposFiltrados.map(g => (
                      <div
                        key={g.jid}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setNovoGrupo({ ...novoGrupo, id_do_grupo: g.jid, nome: novoGrupo.nome || g.nome });
                          setJidDropdownOpen(false);
                        }}
                        style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {getGroupInitials(g.nome)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.nome}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>{g.jid}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ModalPortal>
            )}
          </div>
        </div>
      </div>

      {/* Link de Convite */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="label-premium">
          <ExternalLink size={12} /> Link de Convite do Grupo <span style={{ color: 'var(--text-dim)', fontWeight: 400, fontSize: '0.7rem' }}>(Opcional)</span>
        </label>
        <div style={{ position: 'relative' }}>
          <ExternalLink
            size={13}
            style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              color: novoGrupo.link_convite ? 'var(--primary)' : 'var(--text-dim)',
              transition: 'color 0.2s'
            }}
          />
          <input
            value={novoGrupo.link_convite || ''}
            onChange={e => setNovoGrupo({ ...novoGrupo, link_convite: e.target.value })}
            placeholder="https://chat.whatsapp.com/..."
            style={{
              width: '100%',
              paddingLeft: '2.2rem',
              border: novoGrupo.link_convite
                ? '1px solid rgba(37,99,235,0.5)'
                : '1px solid var(--border)',
              background: novoGrupo.link_convite
                ? 'rgba(37,99,235,0.04)'
                : undefined,
              transition: 'border 0.2s, background 0.2s'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GeneralTab;
