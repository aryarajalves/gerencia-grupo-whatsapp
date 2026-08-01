import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import Configuracoes from '../pages/Settings';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { WAPI_TOKEN: 'token_teste', WAPI_INSTANCE_ID: 'inst_teste' } })),
    post: vi.fn(() => Promise.resolve({ data: {} }))
  }
}));

describe('Configuracoes - Abas', () => {
  it('renderiza e alterna entre as abas de configuracao', async () => {
    render(<Configuracoes />);

    // Abas visíveis no topo
    const abaApi = screen.getByRole('button', { name: /Credenciais W-API/i });
    const abaBrand = screen.getByRole('button', { name: /Identidade & Logo/i });
    const abaSilence = screen.getByRole('button', { name: /Horário de Silêncio/i });

    expect(abaApi).toBeInTheDocument();
    expect(abaBrand).toBeInTheDocument();
    expect(abaSilence).toBeInTheDocument();

    // Aba inicial é API
    expect(await screen.findByPlaceholderText(/Bearer Token.../i)).toBeInTheDocument();

    // Alterna para Identidade
    fireEvent.click(abaBrand);
    expect(screen.getByText(/Personalização da Marca/i)).toBeInTheDocument();

    // Alterna para Silêncio
    fireEvent.click(abaSilence);
    expect(screen.getByText(/Regra do Horário de Silêncio/i)).toBeInTheDocument();
  });
});
