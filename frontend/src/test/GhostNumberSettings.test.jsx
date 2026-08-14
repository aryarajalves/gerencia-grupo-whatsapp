import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import Configuracoes from '../pages/Settings';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ 
      data: { 
        WAPI_TOKEN: 'token_teste', 
        WAPI_INSTANCE_ID: 'inst_teste',
        WAPI_FANTASMA_TOKEN: 'token_fantasma_teste',
        WAPI_FANTASMA_INSTANCE_ID: 'inst_fantasma_teste',
        WAPI_FANTASMA_PLAN_TYPE: 'PRO',
        OPENAI_MODEL: 'gpt-4o-mini'
      } 
    })),
    post: vi.fn(() => Promise.resolve({ data: { message: 'Configurações atualizadas' } }))
  }
}));

describe('Configurações - Número Fantasma', () => {
  it('renderiza a aba de Número Fantasma com credenciais, plano e modelo OpenAI', async () => {
    render(<Configuracoes />);

    // Localiza botão da aba
    const abaFantasma = screen.getByRole('button', { name: /Número Fantasma/i });
    expect(abaFantasma).toBeInTheDocument();

    // Clica na aba
    fireEvent.click(abaFantasma);

    // Verifica elementos e títulos na aba
    expect(await screen.findByText(/Credenciais do WhatsApp \/ Número Fantasma/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Bearer Token da instância fantasma.../i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ex: GHOST-M3SOUT-.../i)).toBeInTheDocument();
    expect(screen.getByText(/Plano da Instância W-API \(Fantasma\)/i)).toBeInTheDocument();
    expect(screen.getByText(/⚡ Plano PRO/i)).toBeInTheDocument();
    expect(screen.getByText(/Modelo de IA \(OpenAI\)/i)).toBeInTheDocument();
    expect(screen.getByText(/GPT-4o Mini/i)).toBeInTheDocument();
  });

  it('permite alternar entre exibir e ocultar token do fantasma', async () => {
    render(<Configuracoes />);

    const abaFantasma = screen.getByRole('button', { name: /Número Fantasma/i });
    fireEvent.click(abaFantasma);

    // Toggle de visibilidade do token
    const tokenInput = await screen.findByPlaceholderText(/Bearer Token da instância fantasma.../i);
    expect(tokenInput.getAttribute('type')).toBe('password');

    const eyeBtn = screen.getByLabelText(/Exibir token/i);
    fireEvent.click(eyeBtn);
    expect(tokenInput.getAttribute('type')).toBe('text');
  });
});
