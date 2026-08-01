import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ShieldAlert, RefreshCcw, Eye, EyeOff, CheckCircle2, Key } from 'lucide-react';
import axiosInstance from '../services/api';
import toast from 'react-hot-toast';

const SetupProfile = ({ token }) => {
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    password: '',
    confirm_password: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const res = await axiosInstance.get(`/convite/${token}`);
        setInvite(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Link de recuperação inválido ou expirado.');
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      toast.error('As senhas não coincidem');
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.post('/resetar-senha', {
        token,
        ...formData
      });
      setSuccess(true);
      toast.success('Senha alterada com sucesso!');
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao alterar senha');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="login-screen">
        <RefreshCcw size={40} className="spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  if (error || (invite && invite.tipo !== 'reset')) {
    return (
      <div className="login-screen">
        <div className="login-container">
          <div className="login-card" style={{ textAlign: 'center' }}>
            <ShieldAlert size={60} color="#ef4444" style={{ marginBottom: '1rem' }} />
            <h1 style={{ color: '#fff' }}>Link Inválido</h1>
            <p style={{ color: 'var(--text-dim)' }}>{error || 'Este link não é para redefinição de senha.'}</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="login-submit" 
              style={{ marginTop: '2rem' }}
            >
              Ir para o Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="login-screen">
        <div className="login-container">
          <div className="login-card" style={{ textAlign: 'center' }}>
            <CheckCircle2 size={60} color="var(--success)" style={{ marginBottom: '1rem' }} />
            <h1 style={{ color: '#fff' }}>Senha Atualizada!</h1>
            <p style={{ color: 'var(--text-dim)' }}>Sua nova senha foi salva. Redirecionando para o login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <Key size={40} />
            </div>
            <h1>Configurar Acesso</h1>
            <p>Altere sua senha de segurança</p>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', 
            borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <User size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Usuário detectado</span>
            </div>
            {/* O nome e email não são editáveis aqui, conforme solicitado */}
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
              Acesso Identificado pelo Token
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label><Lock size={14} /> Nova Senha</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <input 
                  type={showPass ? "text" : "password"} 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  placeholder="Mínimo 6 caracteres" 
                  required 
                  minLength={6}
                  autoComplete="new-password"
                  style={{ width: '100%', paddingRight: '45px' }}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex="-1"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label><Lock size={14} /> Confirmar Nova Senha</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <input 
                  type={showConfirmPass ? "text" : "password"} 
                  value={formData.confirm_password} 
                  onChange={e => setFormData({...formData, confirm_password: e.target.value})} 
                  placeholder="Repita a nova senha" 
                  required 
                  minLength={6}
                  autoComplete="new-password"
                  style={{ width: '100%', paddingRight: '45px' }}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  tabIndex="-1"
                >
                  {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit" disabled={submitting}>
              {submitting ? <RefreshCcw size={20} className="spin" /> : <><CheckCircle2 size={20} /> Atualizar Senha</>}
            </button>
          </form>

        </div>
      </div>
      <div className="login-bg-decoration" />
    </div>
  );
};

export default SetupProfile;
