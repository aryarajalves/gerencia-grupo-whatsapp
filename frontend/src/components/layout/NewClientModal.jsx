import React, { useState } from 'react';
import { Building2, X, Upload, Loader2 } from 'lucide-react';
import { ModalPortal } from '../common';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../services/api';

const NewClientModal = ({ isOpen, onClose, onCreateClient }) => {
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [formClient, setFormClient] = useState({
    nome: '',
    subtitulo: '',
    logo_url: '',
    wapi_instance_id: '',
    wapi_token: '',
    wapi_plan_type: 'PRO'
  });

  if (!isOpen) return null;

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato inválido. Use PNG, JPEG, SVG ou WEBP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axiosInstance.post('/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormClient(prev => ({ ...prev, logo_url: res.data.url }));
      toast.success('Imagem enviada com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar imagem de logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formClient.nome.trim()) {
      toast.error('Informe o nome da empresa/cliente');
      return;
    }

    setLoading(true);
    try {
      await onCreateClient(formClient);
      toast.success(`Cliente '${formClient.nome}' cadastrado e ativado!`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao cadastrar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999,
        padding: '1.5rem'
      }}>
        <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '2rem', borderRadius: '24px', background: '#161822', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', position: 'relative' }}>
          <button 
            type="button"
            onClick={onClose}
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
              <Building2 size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>Cadastrar Novo Cliente</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Adicione uma nova conta e vincule a instância W-API</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Nome da Empresa / Cliente *</label>
              <input 
                type="text" 
                name="new_client_name"
                autoComplete="off"
                placeholder="Ex: Empresa B - Lançamentos" 
                value={formClient.nome} 
                onChange={e => setFormClient({ ...formClient, nome: e.target.value })}
                required 
                style={{ width: '100%', height: '42px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Subtítulo do Painel</label>
              <input 
                type="text" 
                name="new_client_subtitle"
                autoComplete="off"
                placeholder="Ex: CONTROL PANEL ou INSTÂNCIA 02" 
                value={formClient.subtitulo} 
                onChange={e => setFormClient({ ...formClient, subtitulo: e.target.value })}
                style={{ width: '100%', height: '42px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                Logo da Empresa (URL ou Upload de Imagem)
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  name="new_client_logo"
                  autoComplete="off"
                  placeholder="https://exemplo.com/logo.png ou faça upload" 
                  value={formClient.logo_url} 
                  onChange={e => setFormClient({ ...formClient, logo_url: e.target.value })}
                  style={{ flex: 1, height: '42px' }}
                />
                <label className="btn btn-secondary" style={{ height: '42px', padding: '0 14px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0, fontSize: '0.8rem', fontWeight: 600 }}>
                  {uploadingLogo ? <Loader2 size={16} className="spin" /> : <Upload size={16} />}
                  <span>{uploadingLogo ? 'Enviando...' : 'Upload'}</span>
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/svg+xml, image/webp"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }} 
                    disabled={uploadingLogo}
                  />
                </label>
              </div>
              {formClient.logo_url && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={formClient.logo_url} alt="Preview Logo" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'contain', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }} />
                  <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>Preview da imagem</span>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>W-API Instance ID</label>
                <input 
                  type="text" 
                  name="wapi_instance_id_field"
                  autoComplete="off"
                  placeholder="Ex: 3BXYZ..." 
                  value={formClient.wapi_instance_id} 
                  onChange={e => setFormClient({ ...formClient, wapi_instance_id: e.target.value })}
                  style={{ width: '100%', height: '42px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Plano W-API</label>
                <select 
                  value={formClient.wapi_plan_type}
                  onChange={e => setFormClient({ ...formClient, wapi_plan_type: e.target.value })}
                  style={{ width: '100%', height: '42px', padding: '0 12px' }}
                >
                  <option value="PRO">PRO (Completo)</option>
                  <option value="LITE">LITE (Básico)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>W-API Token de Autenticação</label>
              <input 
                type="password" 
                name="wapi_token_field"
                autoComplete="new-password"
                placeholder="Cole o token da W-API" 
                value={formClient.wapi_token} 
                onChange={e => setFormClient({ ...formClient, wapi_token: e.target.value })}
                style={{ width: '100%', height: '42px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0 20px' }}>
                {loading ? 'Salvando...' : 'Salvar e Ativar Cliente'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};

export default NewClientModal;
