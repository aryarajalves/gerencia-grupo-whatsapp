import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import Contacts from '../pages/Contacts';
import axiosInstance from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn((url, config) => {
      if (url === '/contatos/grupos') return Promise.resolve({ data: [] });
      if (url === '/contatos/stats') return Promise.resolve({ data: { total_contatos: 2, total_grupos: 1 } });
      if (url === '/contatos/') {
        const isAdminFilter = config?.params?.is_admin;
        let items = [
          { id: '1', nome: 'Admin User', numero: '5511999990001', jid_grupo: 'g1@g.us', nome_grupo: 'Grupo VIP', no_grupo: true, is_admin: true, extraido_em: '2026-08-11T12:00:00Z' },
          { id: '2', nome: 'Membro User', numero: '5511999990002', jid_grupo: 'g1@g.us', nome_grupo: 'Grupo VIP', no_grupo: true, is_admin: false, extraido_em: '2026-08-11T12:00:00Z' }
        ];

        if (isAdminFilter === true) {
          items = items.filter(c => c.is_admin === true);
        } else if (isAdminFilter === false) {
          items = items.filter(c => c.is_admin === false);
        }

        return Promise.resolve({ data: { items, total: items.length } });
      }
      return Promise.resolve({ data: {} });
    })
  }
}));

describe('Contacts - Filtro de Cargo e Badges de Role', () => {
  it('renderiza badges de ADMIN e MEMBRO corretamente na tabela', async () => {
    render(<Contacts />);

    const adminBadge = await screen.findByText('👑 ADMIN');
    const memberBadge = await screen.findByText('MEMBRO');

    expect(adminBadge).toBeInTheDocument();
    expect(memberBadge).toBeInTheDocument();
  });

  it('filtra a lista ao selecionar Admins ou Membros no filtro de Cargo', async () => {
    render(<Contacts />);

    await screen.findByText('👑 ADMIN');

    const roleSelect = screen.getByDisplayValue('Todos');
    expect(roleSelect).toBeInTheDocument();

    // Filtra por Admins
    fireEvent.change(roleSelect, { target: { value: 'admin' } });

    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith('/contatos/', expect.objectContaining({
        params: expect.objectContaining({ is_admin: true })
      }));
    });
  });

  it('permite selecionar todos os contatos da base via botão Selecionar Todos', async () => {
    render(<Contacts />);

    await screen.findByText('👑 ADMIN');

    const selectAllBtn = screen.getByText(/Selecionar Todos/i);
    expect(selectAllBtn).toBeInTheDocument();

    fireEvent.click(selectAllBtn);

    await waitFor(() => {
      expect(screen.getByText(/Desmarcar Todos/i)).toBeInTheDocument();
      expect(screen.getByText(/2 contato\(s\) selecionados no total/i)).toBeInTheDocument();
    });
  });
});
