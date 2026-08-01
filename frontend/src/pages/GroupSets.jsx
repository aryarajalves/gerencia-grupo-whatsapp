import React, { useState, useEffect } from 'react';
import axiosInstance from '../services/api';
import { 
  Plus, Search, Edit2, Trash2, ExternalLink, 
  ChevronRight, GripVertical, Info, CheckCircle2, XCircle,
  Layers, AlertCircle, Instagram, Facebook, Twitter, Globe, Github, Youtube, MessageCircle, Send,
  PlusCircle, Trash
} from 'lucide-react';
import { ModalPortal } from '../components/common';

const GroupSets = ({ openConfirm }) => {
  const [sets, setSets] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSet, setEditingSet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [baseUrl, setBaseUrl] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    nome: '',
    slug: '',
    ativo: true,
    grupos: [], // { grupo_id, posicao, max_leads }
    social_links: [] // { icon: 'instagram', url: '...' }
  });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
  };

  useEffect(() => {
    fetchData();

    const handleConfigUpdated = () => fetchData();
    window.addEventListener('config-updated', handleConfigUpdated);

    return () => {
      window.removeEventListener('config-updated', handleConfigUpdated);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSets, resGroups, resConfig] = await Promise.all([
        axiosInstance.get('/conjuntos/'),
        axiosInstance.get('/grupos/'),
        axiosInstance.get('/config/')
      ]);
      setSets(resSets.data);
      setAvailableGroups(resGroups.data);
      setBaseUrl(resConfig.data.BASE_URL || window.location.origin.replace('5173', '8000').replace('5176', '8000'));
    } catch (error) {
      showToast('Erro ao buscar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingSet(null);
    setFormData({ nome: '', slug: '', ativo: true, grupos: [], social_links: [] });
    setShowModal(true);
  };

  const handleOpenEdit = (set) => {
    setEditingSet(set);
    setFormData({
      nome: set.nome,
      slug: set.slug,
      ativo: set.ativo,
      grupos: set.grupos.map(g => ({
        grupo_id: g.grupo_id,
        posicao: g.posicao,
        max_leads: g.max_leads
      })),
      social_links: set.social_links ? JSON.parse(set.social_links) : []
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    openConfirm(
      'Excluir Conjunto',
      'Tem certeza que deseja excluir este conjunto? Todos os redirecionamentos para este link pararão de funcionar.',
      async () => {
        try {
          await axiosInstance.delete(`/conjuntos/${id}`);
          showToast('Conjunto excluído', 'success');
          fetchData();
        } catch (error) {
          showToast('Erro ao excluir', 'error');
        }
      }
    );
  };

  const handleAddGroup = (groupId) => {
    if (formData.grupos.find(g => g.grupo_id === groupId)) {
      showToast('Grupo já adicionado', 'error');
      return;
    }
    const newPos = formData.grupos.length + 1;
    setFormData({
      ...formData,
      grupos: [...formData.grupos, { grupo_id: groupId, posicao: newPos, max_leads: 900 }]
    });
  };

  const handleRemoveGroup = (groupId) => {
    const filtered = formData.grupos.filter(g => g.grupo_id !== groupId);
    const reordered = filtered.map((g, idx) => ({ ...g, posicao: idx + 1 }));
    setFormData({ ...formData, grupos: reordered });
  };

  const handleUpdateMaxLeads = (groupId, value) => {
    const updated = formData.grupos.map(g => 
      g.grupo_id === groupId ? { ...g, max_leads: parseInt(value) || 0 } : g
    );
    setFormData({ ...formData, grupos: updated });
  };

  const handleAddSocial = () => {
    setFormData({
      ...formData,
      social_links: [...formData.social_links, { icon: 'instagram', url: '' }]
    });
  };

  const handleRemoveSocial = (index) => {
    const updated = formData.social_links.filter((_, i) => i !== index);
    setFormData({ ...formData, social_links: updated });
  };

  const handleUpdateSocial = (index, field, value) => {
    const updated = formData.social_links.map((s, i) => 
      i === index ? { ...s, [field]: value } : s
    );
    setFormData({ ...formData, social_links: updated });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.slug) {
      showToast('Preencha os campos obrigatórios', 'error');
      return;
    }

    const payload = {
      ...formData,
      social_links: JSON.stringify(formData.social_links)
    };

    try {
      if (editingSet) {
        await axiosInstance.put(`/conjuntos/${editingSet.id}`, payload);
        showToast('Conjunto atualizado', 'success');
      } else {
        await axiosInstance.post('/conjuntos/', payload);
        showToast('Conjunto criado', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.detail || 'Erro ao salvar', 'error');
    }
  };

  const filteredSets = sets.filter(s => 
    s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRedirectLink = (slug) => {
    return `${baseUrl}/join/${slug}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Link copiado!', 'success');
  };

  return (
    <div className="fade-in" style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Conjunto de Grupos
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Gerencie pastas de grupos com links de redirecionamento inteligente.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate} style={{ height: '50px', padding: '0 2rem', borderRadius: '14px', boxShadow: '0 8px 25px rgba(var(--primary-rgb), 0.3)' }}>
          <Plus size={20} /> Novo Conjunto
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="stat-card" style={{ background: 'rgba(23, 25, 33, 0.4)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '20px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{sets.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total de Conjuntos</div>
        </div>
        <div className="stat-card" style={{ background: 'rgba(23, 25, 33, 0.4)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '20px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{sets.filter(s => s.ativo).length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Conjuntos Ativos</div>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
        <Search size={20} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.8 }} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou slug..." 
          className="premium-field"
          style={{ width: '100%', height: '54px', padding: '0 1.5rem 0 3.75rem', borderRadius: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '1rem', color: '#fff' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)', gridColumn: '1/-1' }}>Carregando conjuntos...</div>
        ) : filteredSets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)', gridColumn: '1/-1' }}>Nenhum conjunto encontrado.</div>
        ) : (
          filteredSets.map(set => (
            <div key={set.id} className="glass-card" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>{set.nome}</h3>
                  <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, textTransform: 'uppercase', background: set.ativo ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: set.ativo ? '#34d399' : '#f87171' }}>
                    {set.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn-action-premium" onClick={() => handleOpenEdit(set)} style={{ color: 'var(--primary)', background: 'rgba(var(--primary-rgb), 0.05)', padding: '8px', borderRadius: '10px' }}>
                    <Edit2 size={18} />
                  </button>
                  <button className="btn-action-premium" onClick={() => handleDelete(set.id)} style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)', padding: '8px', borderRadius: '10px' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Link Universal:</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <code style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#3b82f6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {getRedirectLink(set.slug)}
                  </code>
                  <button onClick={() => copyToClipboard(getRedirectLink(set.slug))} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-dim)', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}>
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '1rem' }}>Fluxo de Redirecionamento:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {set.grupos.sort((a,b) => a.posicao - b.posicao).map((g, idx) => {
                    const isFull = g.quantidade_contatos >= g.max_leads;
                    return (
                      <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', opacity: isFull ? 0.5 : 1 }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: isFull ? 'rgba(255,255,255,0.1)' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>
                          {g.posicao}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{g.grupo_nome}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{g.quantidade_contatos} / {g.max_leads} leads</div>
                        </div>
                        {isFull ? <CheckCircle2 size={16} style={{ color: '#10b981' }} /> : <ChevronRight size={16} style={{ color: '#3b82f6' }} />}
                      </div>
                    );
                  })}
                  {set.grupos.length === 0 && <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>Nenhum grupo associado.</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
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
              
              <form onSubmit={handleSave} style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="input-group-premium">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem', display: 'block' }}>NOME DO CONJUNTO</label>
                    <input 
                      type="text" 
                      className="premium-field"
                      style={{ width: '100%', height: '50px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '0 1rem', color: '#fff' }}
                      value={formData.nome} 
                      onChange={e => setFormData({...formData, nome: e.target.value})} 
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
                      onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
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
                    onChange={e => setFormData({...formData, ativo: e.target.checked})} 
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
                      if(e.target.value) handleAddGroup(e.target.value);
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
                  <button type="button" className="btn btn-secondary" style={{ flex: 0.4, height: '56px', borderRadius: '16px' }} onClick={() => setShowModal(false)}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {toast.show && (
        <div className="fade-in" style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 10000, padding: '1rem 1.5rem', borderRadius: '14px', background: toast.type === 'error' ? 'var(--danger)' : toast.type === 'success' ? '#10b981' : 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)' }}>
          {toast.type === 'error' ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default GroupSets;
