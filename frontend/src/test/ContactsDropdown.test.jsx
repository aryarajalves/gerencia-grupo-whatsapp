import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import Contacts from '../pages/Contacts';
import { AuthProvider } from '../contexts/AuthContext';
import { WaStatusProvider } from '../contexts/WaStatusContext';
import { CompanyProvider } from '../contexts/CompanyContext';

// Mock do axiosInstance
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn((url) => {
      if (url === '/contatos/grupos') return Promise.resolve({ data: [] });
      if (url === '/contatos/stats') return Promise.resolve({ data: { total_contatos: 100, total_grupos: 2 } });
      if (url === '/contatos/') return Promise.resolve({ data: { items: [], total: 100 } });
      return Promise.resolve({ data: {} });
    })
  }
}));

describe('Contacts - Dropdown de Limite por Página', () => {
  it('exibe o valor padrão 20 e contém as opções 20, 50, 100, 200, 500', async () => {
    render(
      <AuthProvider>
        <WaStatusProvider>
          <CompanyProvider>
            <Contacts />
          </CompanyProvider>
        </WaStatusProvider>
      </AuthProvider>
    );

    const select = screen.getByDisplayValue('20');
    expect(select).toBeInTheDocument();

    expect(screen.getByRole('option', { name: '20' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '50' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '100' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '200' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '500' })).toBeInTheDocument();
  });
});
