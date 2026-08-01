import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CapturaMensagens from '../pages/Capture';

// Mock axiosInstance
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn((url) => {
      if (url.includes('/captura/webhook-url')) return Promise.resolve({ data: { url: 'https://webhook.url' } });
      if (url.includes('/grupos/')) return Promise.resolve({ data: [{ id: 1, nome: 'Grupo Teste', id_do_grupo: 'g1' }] });
      if (url.includes('/captura/mensagens/')) return Promise.resolve({
        data: {
          items: [
            { id: 'msg-1', group_name: 'Grupo 1', group_jid: 'g1', message_content: 'Texto 1', timestamp: '2026-07-31T18:00:00Z' },
            { id: 'msg-2', group_name: 'Grupo 1', group_jid: 'g1', message_content: 'Texto 2', timestamp: '2026-07-31T18:05:00Z' }
          ],
          total: 2
        }
      });
      return Promise.resolve({ data: {} });
    }),
    delete: vi.fn(() => Promise.resolve({ data: { message: 'Deletado' } }))
  },
  API_BASE: 'http://localhost:8000'
}));

describe('CapturaMensagens - Selecionar Todos', () => {
  it('seleciona todas as mensagens ao clicar no checkbox do cabeçalho', async () => {
    const openConfirm = vi.fn();
    render(<CapturaMensagens openConfirm={openConfirm} />);

    // Aguarda o carregamento das mensagens
    const msg1 = await screen.findByText('Texto 1');
    expect(msg1).toBeInTheDocument();

    // Encontra o checkbox do cabeçalho
    const checkboxes = screen.getAllByRole('checkbox');
    const headerCheckbox = checkboxes[0]; // Primeiro checkbox é o do cabeçalho

    expect(headerCheckbox.checked).toBe(false);

    // Clica no Selecionar Todos
    fireEvent.click(headerCheckbox);

    // O headerCheckbox e todos os checkboxes das linhas devem estar marcados
    expect(headerCheckbox.checked).toBe(true);
    expect(checkboxes[1].checked).toBe(true);
    expect(checkboxes[2].checked).toBe(true);

    // A barra com "2 captura(s) selecionada(s)" deve aparecer
    expect(screen.getByText('2 captura(s) selecionada(s)')).toBeInTheDocument();
  });
});
