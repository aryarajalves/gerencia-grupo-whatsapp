import React from 'react';
import { Layers, AlertCircle, GripVertical, Trash2, PlusCircle } from 'lucide-react';
import { ModalPortal } from '../../../components/common';

const GroupSetModal = ({
  showModal,
  editingSet,
  formData,
  setFormData,
  availableGroups = [],
  onClose,
  onSave,
  handleAddGroup,
  handleRemoveGroup,
  handleUpdateMaxLeads,
  handleAddSocial,
  handleRemoveSocial,
  handleUpdateSocial
}) => {
  if (!showModal) return null;

  return (
    <ModalPortal>
      <div className="fullscreen-modal-overlay">
        <div className="fullscreen-modal-container" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', background: 'rgba(23, 25, 33, 0.9)', backdropFilter: 'blur(40px)', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="fullscreen-modal-header" style={{ padding: '2rem 2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Layers size={28} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{editingSet ? 'Refinar Conjunto' : 'Novo Conjunto'}</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Configure o redirecionamento inteligente.</span>
              </div>
            </div>
          </div>
          
          <form onSubmit={onSave} style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="input-group-premium">
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem', display: 'block' }}>NOME DO CONJUNTO</label>
                <input 
                  type="text" 
                  className="premium-field"
                  style={{ width: '100%', height: '50px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '0 1rem', color: '#fff' }}
                  value={formData.nome} 
                  onChange={e => setFormData({ ...formData, nome: e.target.value })} 
                  placeholder="Ex: Lançamento Maio"
                  required
                />
              </div>
              <div className="input-group-premium">
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem', display: 'block' }}>SLUG DO LINK (URL)</label>
                <input 
                  type="text" 
                  className="premium-field"
                  style={{ width: '100%', height: '50px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '0 1rem', color: '#fff' }}
                  value={formData.slug} 
                  onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} 
                  placeholder="ex: lancamento-maio"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                id="set-active"
                checked={formData.ativo} 
                onChange={e => setFormData({ ...formData, ativo: e.target.checked })} 
              />
              <label htmlFor="set-active" style={{ fontSize: '0.9rem', color: '#fff', cursor: 'pointer' }}>Conjunto Ativo</label>
            </div>

            <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Grupos e Ordem</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 12px', borderRadius: '100px' }}>
                  <AlertCircle size={14} /> Link redireciona por posição.
                </div>
              </div>

              <select 
                style={{ width: '100%', height: '50px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '0 1rem', color: '#fff', marginBottom: '1.5rem', cursor: 'pointer' }}
                onChange={(e) => {
                  if (e.target.value) handleAddGroup(e.target.value);
                  e.target.value = "";
                }}
              >
                <option value="">+ Adicionar grupo à lista...</option>
                {availableGroups.filter(ag => !formData.grupos.find(fg => fg.grupo_id === ag.id)).map(g => (
                  <option key={g.id} value={g.id}>{g.nome} ({g.quantidade_contatos} contatos)</option>
                ))}
              </select>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {formData.grupos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '16px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    Nenhum grupo selecionado.
                  </div>
                ) : (
                  formData.grupos.map((g, index) => {
                    const groupData = availableGroups.find(ag => ag.id === g.grupo_id);
                    return (
                      <div key={g.grupo_id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ color: 'var(--text-dim)' }}><GripVertical size={16} /></div>
                        <div style={{ fontWeight: 800, color: 'var(--primary)', width: '30px' }}>{index + 1}º</div>
                        <div style={{ flex: 1, fontWeight: 600, color: '#fff' }}>{groupData?.nome}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                          <span>Limitar:</span>
                          <input 
                            type="number" 
                            value={g.max_leads} 
                            onChange={(e) => handleUpdateMaxLeads(g.grupo_id, e.target.value)}
                            style={{ width: '70px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px 8px', color: '#fff', textAlign: 'center' }}
                          />
                        </div>
                        <button type="button" onClick={() => handleRemoveGroup(g.grupo_id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Seção de Redes Sociais */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>Redes Sociais (Página de Esgotamento)</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: '4px 0 0 0' }}>Botões que aparecerão quando o lead não conseguir entrar no grupo.</p>
                </div>
                <button type="button" onClick={handleAddSocial} className="btn-action-premium" style={{ color: 'var(--primary)', background: 'rgba(var(--primary-rgb), 0.1)', padding: '8px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PlusCircle size={14} /> Adicionar
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {formData.social_links.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '16px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                    Nenhuma rede social configurada.
                  </div>
                ) : (
                  formData.social_links.map((s, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <select 
                        value={s.icon} 
                        onChange={(e) => handleUpdateSocial(index, 'icon', e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '0.85rem' }}
                      >
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="twitter">Twitter / X</option>
                        <option value="youtube">YouTube</option>
                        <option value="tiktok">TikTok</option>
                        <option value="website">Website</option>
                        <option value="whatsapp">Suporte WhatsApp</option>
                        <option value="telegram">Telegram</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder="https://..." 
                        value={s.url}
                        onChange={(e) => handleUpdateSocial(index, 'url', e.target.value)}
                        style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.85rem' }}
                      />
                      <button type="button" onClick={() => handleRemoveSocial(index)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#f87171', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '56px', borderRadius: '16px', fontWeight: 800 }}>
                {editingSet ? 'Atualizar Conjunto' : 'Criar Conjunto'}
              </button>
              <button type="button" className="btn btn-secondary" style={{ flex: 0.4, height: '56px', borderRadius: '16px' }} onClick={onClose}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};

export default GroupSetModal;
