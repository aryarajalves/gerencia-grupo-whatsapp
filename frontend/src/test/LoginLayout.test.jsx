import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import axiosInstance from '../services/api';
import Login from '../pages/Login';
import { AuthProvider } from '../contexts/AuthContext';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('Login Component Layout & Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axiosInstance.get.mockResolvedValue({
      data: {
        COMPANY_NAME: 'Empresa de Teste',
        COMPANY_LOGO: '',
        COMPANY_LOGO_SIZE: '60'
      }
    });
  });

  it('renders login card and visual hero elements properly', async () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    // Verifica elementos do formulário
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar no Sistema/i })).toBeInTheDocument();

    // Verifica elementos do painel visual hero à direita
    expect(screen.getByAltText('Automação WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('Gestão & Automação de Grupos')).toBeInTheDocument();
    expect(screen.getByText('Disparos Programados')).toBeInTheDocument();
    expect(screen.getByText('Segurança Ativa')).toBeInTheDocument();
    expect(screen.getByText('Fila Inteligente de Leads')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Empresa de Teste')).toBeInTheDocument();
    });
  });

  it('toggles password visibility', () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput.getAttribute('type')).toBe('password');

    // Botão de mostrar senha
    const toggleButtons = screen.getAllByRole('button');
    const eyeToggle = toggleButtons.find(b => b.classList.contains('password-toggle'));
    expect(eyeToggle).toBeDefined();

    fireEvent.click(eyeToggle);
    expect(passwordInput.getAttribute('type')).toBe('text');

    fireEvent.click(eyeToggle);
    expect(passwordInput.getAttribute('type')).toBe('password');
  });

  it('displays error message on failed login', async () => {
    axiosInstance.post.mockRejectedValue({
      response: {
        data: {
          detail: 'Credenciais inválidas'
        }
      }
    });

    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'teste@email.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Entrar no Sistema/i }));

    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
    });
  });
});
