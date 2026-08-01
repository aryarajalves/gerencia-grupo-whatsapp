import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import CapturaMensagens from '../pages/Capture';
import { AuthProvider } from '../contexts/AuthContext';
import { WaStatusProvider } from '../contexts/WaStatusContext';
import { CompanyProvider } from '../contexts/CompanyContext';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn((url) => {
      if (url === '/captura/webhook-url') return Promise.resolve({ data: { url: 'https://webhook.test' } });
      if (url === '/captura/mensagens/') return Promise.resolve({
        data: {
          items: [
            { id: '1', group_name: 'Grupo Teste', group_jid: '123@g.us', message_content: 'ola', sender_name: 'Ana', sender_number: '55119999', timestamp: '2026-07-31T16:00:00' }
          ],
          total: 1
        }
      });
      return Promise.resolve({ data: {} });
    }),
    delete: vi.fn(() => Promise.resolve({ data: { detail: 'Deletado' } }))
  }
}));

describe('CapturaMensagens - Paginação e Exclusão', () => {
  it('exibe o dropdown com as opções 20, 50, 100, 200', async () => {
    const openConfirmMock = vi.fn();
    render(
      <AuthProvider>
        <WaStatusProvider>
          <CompanyProvider>
            <CapturaMensagens openConfirm={openConfirmMock} />
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
