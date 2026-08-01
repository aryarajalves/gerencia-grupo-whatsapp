import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Globe, ShieldAlert, RefreshCcw, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import axiosInstance from '../services/api';
import toast from 'react-hot-toast';

const Register = ({ token }) => {
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
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
        setError(err.response?.data?.detail || 'Convite inválido ou expirado.');
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
      await axiosInstance.post('/registrar', {
        token,
        ...formData
      });
      setSuccess(true);
      toast.success('Conta criada com sucesso!');
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao criar conta');
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

  if (error || (invite && invite.tipo !== 'convite')) {
    return (
      <div className="login-screen">
        <div className="login-container">
          <div className="login-card" style={{ textAlign: 'center' }}>
            <ShieldAlert size={60} color="#ef4444" style={{ marginBottom: '1rem' }} />
            <h1 style={{ color: '#fff' }}>Acesso Inválido</h1>
            <p style={{ color: 'var(--text-dim)' }}>{error || 'Este link não é para registro.'}</p>
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
            <h1 style={{ color: '#fff' }}>Tudo Pronto!</h1>
            <p style={{ color: 'var(--text-dim)' }}>Sua conta foi criada com sucesso. Redirecionando para o login...</p>
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
              <User size={40} />
            </div>
            <h1>Criar Nova Conta</h1>
            <p>Complete seu cadastro para acessar o Zap Group</p>
            <div style={{ 
              marginTop: '10px', padding: '4px 12px', borderRadius: '20px', 
              background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)',
              fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, display: 'inline-block'
            }}>
              NÍVEL: {invite.cargo}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label><User size={14} /> Nome Completo</label>
              <input 
                type="text" 
                value={formData.nome} 
                onChange={e => setFormData({...formData, nome: e.target.value})} 
                placeholder="Ex: João Silva" 
                required 
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label><Mail size={14} /> E-mail de Trabalho</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                placeholder="nome@empresa.com" 
                required 
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label><Lock size={14} /> Definir Senha</label>
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
              <label><Lock size={14} /> Confirmar Senha</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <input 
                  type={showConfirmPass ? "text" : "password"} 
                  value={formData.confirm_password} 
                  onChange={e => setFormData({...formData, confirm_password: e.target.value})} 
                  placeholder="Repita a senha" 
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
              {submitting ? <RefreshCcw size={20} className="spin" /> : <><CheckCircle2 size={20} /> Finalizar Cadastro</>}
            </button>
          </form>

        </div>
      </div>
      <div className="login-bg-decoration" />
    </div>
  );
};

export default Register;
