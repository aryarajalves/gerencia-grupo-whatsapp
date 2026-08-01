import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import HistoricoEnvios from '../pages/Logs';
import { AuthProvider } from '../contexts/AuthContext';
import { WaStatusProvider } from '../contexts/WaStatusContext';
import { CompanyProvider } from '../contexts/CompanyContext';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn((url) => {
      if (url === '/logs/') return Promise.resolve({
        data: {
          items: [],
          total: 0,
          total_geral: 0,
          total_sucesso: 0,
          total_erro: 0
        }
      });
      return Promise.resolve({ data: {} });
    }),
    delete: vi.fn(() => Promise.resolve({ data: { message: 'Deletado' } })),
    post: vi.fn(() => Promise.resolve({ data: {} }))
  }
}));

describe('HistoricoEnvios - Dropdown de Limite por Página', () => {
  it('exibe o dropdown de limite com valor padrão 20 e opções 20, 50, 100, 200', async () => {
    render(
      <AuthProvider>
        <WaStatusProvider>
          <CompanyProvider>
            <HistoricoEnvios openConfirm={vi.fn()} />
          </CompanyProvider>
        </WaStatusProvider>
      </AuthProvider>
    );

    const select = await screen.findByDisplayValue('20');
    expect(select).toBeInTheDocument();

    expect(screen.getByRole('option', { name: '20' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '50' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '100' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '200' })).toBeInTheDocument();
  });
});
