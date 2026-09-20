import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import axiosInstance from '../services/api';
import Register from '../pages/Register';

// Mock do axiosInstance
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('Register Screen - Password Generator & Email Verification Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders invitation details and password generator button', async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: {
        tipo: 'convite',
        cargo: 'ADMIN'
      }
    });

    render(<Register token="test-token-123" />);

    await waitFor(() => {
      expect(screen.getByText('Criar Nova Conta')).toBeInTheDocument();
      expect(screen.getByText('NÍVEL: ADMIN')).toBeInTheDocument();
      expect(screen.getByText('Gerar Senha Segura')).toBeInTheDocument();
    });
  });

  it('generates secure password of 12+ characters when clicking "Gerar Senha Segura"', async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: {
        tipo: 'convite',
        cargo: 'ADMIN'
      }
    });

    render(<Register token="test-token-123" />);

    await waitFor(() => {
      expect(screen.getByText('Gerar Senha Segura')).toBeInTheDocument();
    });

    const generateBtn = screen.getByText('Gerar Senha Segura');
    fireEvent.click(generateBtn);

    const passwordInput = screen.getByPlaceholderText('Mínimo 12 caracteres com letras, números e símbolos');
    const confirmInput = screen.getByPlaceholderText('Repita a senha');

    expect(passwordInput.value.length).toBeGreaterThanOrEqual(12);
    expect(passwordInput.value).toBe(confirmInput.value);
    expect(/[a-zA-Z]/.test(passwordInput.value)).toBe(true);
    expect(/\d/.test(passwordInput.value)).toBe(true);
    expect(/[!@#$%&*+=-_]/.test(passwordInput.value)).toBe(true);
  });

  it('progresses to 6-digit email verification code step upon submit', async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: {
        tipo: 'convite',
        cargo: 'ADMIN'
      }
    });

    axiosInstance.post.mockResolvedValueOnce({
      data: {
        message: 'Código enviado com sucesso',
        email_masked: 'us***@empresa.com'
      }
    });

    render(<Register token="test-token-123" />);

    await waitFor(() => {
      expect(screen.getByText('Criar Nova Conta')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Ex: João Silva'), { target: { value: 'Usuário Teste' } });
    fireEvent.change(screen.getByPlaceholderText('nome@empresa.com'), { target: { value: 'usuario@empresa.com' } });
    fireEvent.change(screen.getByPlaceholderText('Mínimo 12 caracteres com letras, números e símbolos'), { target: { value: 'Senha@Forte2026!' } });
    fireEvent.change(screen.getByPlaceholderText('Repita a senha'), { target: { value: 'Senha@Forte2026!' } });

    const submitBtn = screen.getByText('Finalizar Cadastro');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/registrar/solicitar-codigo', expect.objectContaining({
        token: 'test-token-123',
        nome: 'Usuário Teste',
        email: 'usuario@empresa.com',
        password: 'Senha@Forte2026!'
      }));
      expect(screen.getByText('Verifique seu E-mail')).toBeInTheDocument();
      expect(screen.getByText('us***@empresa.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
    });
  });
});
