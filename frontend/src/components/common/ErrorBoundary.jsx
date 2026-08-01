import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    localStorage.removeItem('activeTab');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#0f1015',
          color: '#fff',
          fontFamily: 'sans-serif',
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(23, 25, 35, 0.95)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '550px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(16px)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: '#ef4444'
            }}>
              <AlertTriangle size={32} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 10px', color: '#f87171' }}>
              Ops! Ocorreu um erro inesperado na interface
            </h2>

            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
              Ocorreu uma falha durante a renderização deste componente. Clique no botão abaixo para reiniciar o painel.
            </p>

            <button
              onClick={this.handleReload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: '#fff',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.95rem',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                marginBottom: '20px'
              }}
            >
              <RefreshCcw size={18} />
              Reiniciar e Voltar ao Início
            </button>

            {this.state.error && (
              <details style={{ textAlign: 'left', background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <summary style={{ cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700 }}>
                  Ver Detalhes do Erro TÉCNICO
                </summary>
                <pre style={{ fontSize: '0.75rem', color: '#ef4444', overflowX: 'auto', marginTop: '10px', whiteSpace: 'pre-wrap' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
