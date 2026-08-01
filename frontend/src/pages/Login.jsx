import React, { useState, useEffect } from 'react';
import { Mail, Lock, LogIn, ShieldAlert, RefreshCcw, Eye, EyeOff } from 'lucide-react';
import axiosInstance from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { handleLoginSuccess } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [logoSize, setLogoSize] = useState('60');

  useEffect(() => {
    axiosInstance.get('/config/public')
      .then(res => {
        setCompanyName(res.data.COMPANY_NAME || '');
        setCompanyLogo(res.data.COMPANY_LOGO || '');
        setLogoSize(res.data.COMPANY_LOGO_SIZE || '60');
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.post('/login', { email, password });
      localStorage.setItem('accessToken', res.data.access_token);
      handleLoginSuccess(res.data.user);
    } catch (err) {
      setError(err.response?.data?.detail || 'Falha na autenticação. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              {companyLogo
                ? <img src={companyLogo} alt="Logo" style={{ width: `${logoSize}px`, height: `${logoSize}px`, borderRadius: '16px', objectFit: 'contain' }} />
                : <div style={{ width: `${logoSize}px`, height: `${logoSize}px`, borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 700, color: '#fff' }}>
                    {companyName ? companyName.charAt(0).toUpperCase() : '?'}
                  </div>
              }
            </div>
            <h1>{companyName || 'Acesso Restrito'}</h1>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label><Mail size={14} /> E-mail</label>
              <div className="input-with-icon">
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="seu@email.com" 
                  required 
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label><Lock size={14} /> Senha</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                  style={{ width: '100%', paddingRight: '45px' }}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error fade-in">
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? <RefreshCcw size={20} className="spin" /> : <><LogIn size={20} /> Entrar no Sistema</>}
            </button>
          </form>

        </div>
      </div>
      <div className="login-bg-decoration" />
    </div>
  );
};

export default Login;
