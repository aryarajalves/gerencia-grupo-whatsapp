import React, { useState, useEffect } from 'react';
import {
  Mail, Lock, User, ShieldAlert, RefreshCcw, Eye, EyeOff,
  CheckCircle2, Sparkles, Copy, ArrowLeft, MailCheck, Check, X
} from 'lucide-react';
import axiosInstance from '../services/api';
import toast from 'react-hot-toast';

const generateSecurePassword = (length = 16) => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%&*+=-_';
  const all = upper + lower + numbers + symbols;

  // Garante pelo menos um de cada tipo obrigatório
  const password = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)]
  ];

  // Preenche o restante até o tamanho desejado
  for (let i = 4; i < length; i++) {
    password.push(all[Math.floor(Math.random() * all.length)]);
  }

  return password.sort(() => 0.5 - Math.random()).join('');
};

const Register = ({ token }) => {
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Etapas: 'form' (preenchimento) ou 'verify' (código de 6 dígitos)
  const [step, setStep] = useState('form');
  const [emailMasked, setEmailMasked] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

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

  // Contador de tempo para reenvio do código
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Critérios de validação de senha
  const criteria = {
    minLength: formData.password.length >= 12,
    hasLetter: /[a-zA-Z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{}|;:,.<>?/~`]/.test(formData.password)
  };
  const isPasswordValid = Object.values(criteria).every(Boolean);

  const copyToClipboard = (text, successMsg = 'Senha copiada para a área de transferência!') => {
    if (!text) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (_e) {
      // Ignora erro silencioso no fallback
    }
    toast.success(successMsg);
  };

  const handleGeneratePassword = () => {
    const randomLength = Math.floor(Math.random() * (20 - 12 + 1)) + 12; // 12 a 20 caracteres
    const newPass = generateSecurePassword(randomLength);
    setFormData(prev => ({
      ...prev,
      password: newPass,
      confirm_password: newPass
    }));
    setShowPass(true);
    setShowConfirmPass(true);
    copyToClipboard(newPass, `Senha segura de ${randomLength} caracteres gerada e copiada!`);
  };

  const handleCopyPassword = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!formData.password) {
      toast.error('Nenhuma senha para copiar.');
      return;
    }
    copyToClipboard(formData.password, 'Senha copiada para a área de transferência!');
  };

  // Etapa 1: Solicitar código de verificação via Brevo
  const handleRequestCode = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error('A senha deve ter no mínimo 12 caracteres e conter letras, números e caracteres especiais.');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error('As senhas não coincidem');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axiosInstance.post('/registrar/solicitar-codigo', {
        token,
        ...formData
      });
      setEmailMasked(res.data.email_masked || formData.email);
      setStep('verify');
      setResendCooldown(60);
      toast.success('Código de verificação enviado para seu e-mail!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao processar solicitação de cadastro.');
    } finally {
      setSubmitting(false);
    }
  };

  // Reenviar código
  const handleResendCode = async () => {
    if (resendCooldown > 0 || submitting) return;
    setSubmitting(true);
    try {
      await axiosInstance.post('/registrar/solicitar-codigo', {
        token,
        ...formData
      });
      setResendCooldown(60);
      toast.success('Novo código enviado com sucesso!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao reenviar código.');
    } finally {
      setSubmitting(false);
    }
  };

  // Etapa 2: Confirmar código de 6 dígitos e ativar conta
  const handleConfirmCode = async (e) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.trim().length !== 6) {
      toast.error('Por favor, digite o código de 6 dígitos.');
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.post('/registrar/confirmar-codigo', {
        token,
        email: formData.email,
        codigo: verificationCode.trim()
      });
      setSuccess(true);
      toast.success('Conta ativada com sucesso!');
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Código incorreto ou expirado.');
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
              onClick={() => { window.location.href = '/'; }}
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
            <p style={{ color: 'var(--text-dim)' }}>Sua conta foi verificada e ativada com sucesso. Redirecionando para o login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-card">
          
          {step === 'form' ? (
            <>
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
                  NÍVEL: {invite?.cargo}
                </div>
              </div>

              <form onSubmit={handleRequestCode} className="login-form">
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ margin: 0 }}><Lock size={14} /> Definir Senha</label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      style={{
                        background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.75rem',
                        display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0,
                        fontWeight: 600
                      }}
                    >
                      <Sparkles size={13} /> Gerar Senha Segura
                    </button>
                  </div>

                  <div className="input-with-icon" style={{ position: 'relative' }}>
                    <input 
                      type={showPass ? "text" : "password"} 
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                      placeholder="Mínimo 12 caracteres com letras, números e símbolos" 
                      required 
                      minLength={12}
                      autoComplete="new-password"
                      style={{ width: '100%', paddingRight: formData.password ? '70px' : '45px' }}
                    />
                    <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '4px' }}>
                      {formData.password && (
                        <button 
                          type="button" 
                          className="password-toggle"
                          onClick={handleCopyPassword}
                          title="Copiar senha"
                          style={{ position: 'static', transform: 'none' }}
                        >
                          <Copy size={16} />
                        </button>
                      )}
                      <button 
                        type="button" 
                        className="password-toggle"
                        onClick={() => setShowPass(!showPass)}
                        tabIndex="-1"
                        style={{ position: 'static', transform: 'none' }}
                      >
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Checklist visual de força de senha */}
                  {formData.password && (
                    <div style={{
                      marginTop: '8px', padding: '8px 12px', borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.72rem'
                    }}>
                      <div style={{ color: criteria.minLength ? '#4ade80' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {criteria.minLength ? <Check size={12} color="#4ade80" /> : <X size={12} color="#ef4444" />}
                        Mínimo 12 caracteres
                      </div>
                      <div style={{ color: criteria.hasLetter ? '#4ade80' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {criteria.hasLetter ? <Check size={12} color="#4ade80" /> : <X size={12} color="#ef4444" />}
                        Contém letras
                      </div>
                      <div style={{ color: criteria.hasNumber ? '#4ade80' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {criteria.hasNumber ? <Check size={12} color="#4ade80" /> : <X size={12} color="#ef4444" />}
                        Contém números
                      </div>
                      <div style={{ color: criteria.hasSpecial ? '#4ade80' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {criteria.hasSpecial ? <Check size={12} color="#4ade80" /> : <X size={12} color="#ef4444" />}
                        Caractere especial (!@#$)
                      </div>
                    </div>
                  )}
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
                      minLength={12}
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
            </>
          ) : (
            <>
              {/* Etapa 2: Confirmação do Código de 6 dígitos via Brevo */}
              <div className="login-header">
                <div className="login-logo" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                  <MailCheck size={40} />
                </div>
                <h1>Verifique seu E-mail</h1>
                <p style={{ marginTop: '6px' }}>
                  Enviamos um código de segurança de 6 dígitos para:
                </p>
                <div style={{
                  marginTop: '8px', color: '#60a5fa', fontWeight: 600, fontSize: '0.9rem',
                  background: 'rgba(59, 130, 246, 0.08)', padding: '6px 14px', borderRadius: '8px', display: 'inline-block'
                }}>
                  {emailMasked}
                </div>
              </div>

              <form onSubmit={handleConfirmCode} className="login-form">
                <div className="form-group" style={{ textAlign: 'center' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Digite o Código de 6 Dígitos</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={verificationCode} 
                    onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))} 
                    placeholder="000000" 
                    required 
                    autoFocus
                    autoComplete="one-time-code"
                    style={{ 
                      fontSize: '1.8rem', 
                      letterSpacing: '8px', 
                      textAlign: 'center', 
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      color: '#60a5fa',
                      padding: '12px'
                    }}
                  />
                </div>

                <button type="submit" className="login-submit" disabled={submitting || verificationCode.length !== 6}>
                  {submitting ? <RefreshCcw size={20} className="spin" /> : <><CheckCircle2 size={20} /> Confirmar e Ativar Conta</>}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    style={{
                      background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.8rem',
                      display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0
                    }}
                  >
                    <ArrowLeft size={14} /> Alterar dados
                  </button>

                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0 || submitting}
                    style={{
                      background: 'none', border: 'none',
                      color: resendCooldown > 0 ? 'var(--text-dim)' : '#60a5fa',
                      fontSize: '0.8rem', cursor: resendCooldown > 0 ? 'default' : 'pointer',
                      padding: 0, fontWeight: 600
                    }}
                  >
                    {resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : 'Reenviar código'}
                  </button>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
      <div className="login-bg-decoration" />
    </div>
  );
};

export default Register;
