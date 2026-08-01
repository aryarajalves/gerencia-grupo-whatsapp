import React, { useState, useRef, useEffect } from 'react';
import { Users, ExternalLink, Search, CalendarDays, PlusCircle, Pencil, CheckCircle2, ChevronDown, RefreshCw, Repeat, Flag } from 'lucide-react';
import { ModalPortal } from '../../../components/common';
import { DIAS_SEMANA } from '../../../utils/constants';

const GroupForm = ({ 
  novoGrupo, 
  setNovoGrupo, 
  onSubmit, 
  onCancel, 
  editingId, 
  processing, 
  wapiGrupos, 
  wapiLoading, 
  wapiErro 
}) => {
  const [jidSearch, setJidSearch] = useState('');
  const [jidDropdownOpen, setJidDropdownOpen] = useState(false);
  const [jidDropdownRect, setJidDropdownRect] = useState(null);
  const jidInputWrapRef = useRef(null);
  const jidRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (jidRef.current && !jidRef.current.contains(e.target)) setJidDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const wapiGruposFiltrados = (wapiGrupos || []).filter(g =>
    g.nome.toLowerCase().includes(jidSearch.toLowerCase()) ||
    g.jid.toLowerCase().includes(jidSearch.toLowerCase())
  );

  const getGroupInitials = (name) => name ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() : '?';

  return (
    <div className="card" style={{ padding: 0, overflow: 'visible', marginBottom: '1.5rem', border: editingId ? '1px solid rgba(37,99,235,0.35)' : '1px solid var(--border)' }}>
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: editingId ? 'linear-gradient(90deg, rgba(245,158,11,0.08), transparent)' : 'linear-gradient(90deg, rgba(37,99,235,0.06), transparent)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {editingId ? <><Pencil size={15} style={{ color: '#f59e0b' }} /><span style={{ fontWeight: 600, color: '#f59e0b' }}>Editando Grupo</span></> : <><PlusCircle size={15} style={{ color: 'var(--primary)' }} /><span style={{ fontWeight: 600 }}>Novo Grupo de Lançamento</span></>}
      </div>

      <form onSubmit={onSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label-premium"><Users size={12} /> Nome do Grupo</label>
            <input value={novoGrupo.nome} onChange={e => setNovoGrupo({ ...novoGrupo, nome: e.target.value })} placeholder="Ex: Lançamento VIP A" required style={{ width: '100%' }} />
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
                required autoComplete="off" style={{ width: '100%', paddingLeft: '2.2rem' }}
              />
              {jidDropdownOpen && jidDropdownRect && (
                <ModalPortal>
                  <div style={{ position: 'fixed', top: jidDropdownRect.top + 4, left: jidDropdownRect.left, width: jidDropdownRect.width, zIndex: 9999, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', maxHeight: '260px', overflowY: 'auto', boxShadow: '0 12px 40px rgba(0,0,0,0.85)' }}>
                    {wapiLoading ? <div style={{ padding: '14px' }}>Carregando...</div> : wapiGruposFiltrados.map(g => (
                      <div key={g.jid} onMouseDown={() => { setNovoGrupo({ ...novoGrupo, id_do_grupo: g.jid, nome: novoGrupo.nome || g.nome }); setJidDropdownOpen(false); }} className="jid-option" style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent)' }}>{getGroupInitials(g.nome)}</div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{g.nome}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{g.jid}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ModalPortal>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label-premium"><CalendarDays size={12} /> Início do Ciclo</label>
            <select value={novoGrupo.dia_inicio_semana} onChange={e => setNovoGrupo({ ...novoGrupo, dia_inicio_semana: parseInt(e.target.value) })} style={{ width: '100%' }}>
              {DIAS_SEMANA.map((dia, i) => <option key={i} value={i}>{dia}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label-premium"><CalendarDays size={12} /> Encerramento</label>
            <select value={novoGrupo.dia_fim_semana} onChange={e => setNovoGrupo({ ...novoGrupo, dia_fim_semana: parseInt(e.target.value) })} style={{ width: '100%' }}>
              {DIAS_SEMANA.map((dia, i) => <option key={i} value={i}>{dia}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="label-premium"><Repeat size={12} /> Tipo de Ciclo</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${(novoGrupo.tipo_ciclo || 'semanal') === 'semanal' ? 'rgba(37,99,235,0.5)' : 'var(--border)'}`, background: (novoGrupo.tipo_ciclo || 'semanal') === 'semanal' ? 'rgba(37,99,235,0.08)' : 'transparent', transition: 'all 0.2s' }}>
              <input type="radio" name="tipo_ciclo" value="semanal" checked={(novoGrupo.tipo_ciclo || 'semanal') === 'semanal'} onChange={() => setNovoGrupo({ ...novoGrupo, tipo_ciclo: 'semanal' })} style={{ accentColor: 'var(--primary)' }} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: (novoGrupo.tipo_ciclo || 'semanal') === 'semanal' ? 'var(--primary)' : 'var(--text)' }}><Repeat size={12} style={{ display: 'inline', marginRight: '4px' }} />Semanal</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>Reinicia toda semana automaticamente</div>
              </div>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${novoGrupo.tipo_ciclo === 'unico' ? 'rgba(245,158,11,0.5)' : 'var(--border)'}`, background: novoGrupo.tipo_ciclo === 'unico' ? 'rgba(245,158,11,0.08)' : 'transparent', transition: 'all 0.2s' }}>
              <input type="radio" name="tipo_ciclo" value="unico" checked={novoGrupo.tipo_ciclo === 'unico'} onChange={() => setNovoGrupo({ ...novoGrupo, tipo_ciclo: 'unico' })} style={{ accentColor: '#f59e0b' }} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: novoGrupo.tipo_ciclo === 'unico' ? '#f59e0b' : 'var(--text)' }}><Flag size={12} style={{ display: 'inline', marginRight: '4px' }} />Único</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>Roda uma vez e encerra automaticamente</div>
              </div>
            </label>
          </div>
        </div>

        {/* Configuração de Extração de Contatos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label-premium"><Users size={12} /> Extração de Contatos</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${novoGrupo.extrair_contatos !== false ? 'rgba(34, 197, 94, 0.5)' : 'var(--border)'}`, background: novoGrupo.extrair_contatos !== false ? 'rgba(34, 197, 94, 0.08)' : 'transparent', transition: 'all 0.2s' }}>
                <input type="radio" name="extrair_contatos" value="sim" checked={novoGrupo.extrair_contatos !== false} onChange={() => setNovoGrupo({ ...novoGrupo, extrair_contatos: true })} style={{ accentColor: '#22c55e' }} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: novoGrupo.extrair_contatos !== false ? '#22c55e' : 'var(--text)' }}>Habilitada</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>Extrai os leads do grupo</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${novoGrupo.extrair_contatos === false ? 'rgba(239, 68, 68, 0.5)' : 'var(--border)'}`, background: novoGrupo.extrair_contatos === false ? 'rgba(239, 68, 68, 0.08)' : 'transparent', transition: 'all 0.2s' }}>
                <input type="radio" name="extrair_contatos" value="nao" checked={novoGrupo.extrair_contatos === false} onChange={() => setNovoGrupo({ ...novoGrupo, extrair_contatos: false })} style={{ accentColor: '#ef4444' }} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: novoGrupo.extrair_contatos === false ? '#ef4444' : 'var(--text)' }}>Desabilitada</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>Não busca nem salva contatos</div>
                </div>
              </label>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label-premium">Intervalo de Extração</label>
            <select 
              value={novoGrupo.intervalo_extracao_minutos || 30} 
              onChange={e => setNovoGrupo({ ...novoGrupo, intervalo_extracao_minutos: parseInt(e.target.value) })}
              disabled={novoGrupo.extrair_contatos === false}
              style={{ width: '100%', opacity: novoGrupo.extrair_contatos === false ? 0.5 : 1 }}
            >
              <option value={15}>A cada 15 minutos</option>
              <option value={30}>A cada 30 minutos (Padrão)</option>
              <option value={60}>A cada 1 hora</option>
              <option value={120}>A cada 2 horas</option>
              <option value={360}>A cada 6 horas</option>
              <option value={1440}>A cada 24 horas (1x ao dia)</option>
            </select>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Frequência de consulta da W-API para extração de contatos.
            </p>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="label-premium"><ExternalLink size={12} /> Link de Convite (Manual)</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input 
              value={novoGrupo.link_convite || ''} 
              onChange={e => setNovoGrupo({ ...novoGrupo, link_convite: e.target.value })} 
              placeholder="Ex: https://chat.whatsapp.com/..." 
              style={{ flex: 1 }} 
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" type="submit" disabled={processing} style={{ height: '48px', minWidth: '140px' }}>
                {processing ? <RefreshCw size={18} className="spin" /> : editingId ? 'Salvar Alterações' : 'Cadastrar Grupo'}
              </button>
              {editingId && (
                <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ height: '48px' }}>
                  Cancelar
                </button>
              )}
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            Obrigatório para o redirecionamento funcionar se a sua instância W-API for LITE.
          </p>
        </div>
      </form>
    </div>
  );
};

export default GroupForm;
