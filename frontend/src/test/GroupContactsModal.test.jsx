import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import GroupContactsModal from '../pages/Chat/components/GroupContactsModal';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({
      data: {
        total: 2,
        items: [
          { id: '1', nome: 'Mariana Lima', numero: '5511911112222' },
          { id: '2', nome: 'Roberto Alves', numero: '5511933334444' }
        ]
      }
    }))
  }
}));

describe('GroupContactsModal Component', () => {
  const mockGroup = { id: 1, nome: 'Grupo Lançamento', id_do_grupo: '12345@g.us' };
  const mockOnClose = vi.fn();

  it('renderiza o modal de contatos do grupo com a lista e botão de copiar todos', async () => {
    render(<GroupContactsModal group={mockGroup} onClose={mockOnClose} />);

    expect(screen.getByText(/Contatos do Grupo/i)).toBeInTheDocument();
    expect(await screen.findByText(/Mariana Lima/i)).toBeInTheDocument();
    expect(await screen.findByText(/Roberto Alves/i)).toBeInTheDocument();

    const btnCopiarTodos = screen.getByRole('button', { name: /Copiar Todos/i });
    expect(btnCopiarTodos).toBeInTheDocument();
  });

  it('renderiza o seletor de paginação e controles de página', async () => {
    render(<GroupContactsModal group={mockGroup} onClose={mockOnClose} />);

    expect(await screen.findByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '20' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '50' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '100' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '200' })).toBeInTheDocument();
    expect(screen.getByText(/1 \/ 1/i)).toBeInTheDocument();
  });
});
