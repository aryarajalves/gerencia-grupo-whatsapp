import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ContactsTableRow from '../pages/Contacts/components/ContactsTableRow';

describe('ContactsTableRow Component', () => {
  const contactMock = {
    id: 'c-1',
    nome: 'Carlos Eduardo',
    numero: '5511988887777',
    is_admin: true,
    nome_grupo: 'Grupo Vendas',
    jid_grupo: 'vendas@g.us',
    no_grupo: true,
    webhook_enviado: true,
    webhook_enviado_em: '2026-08-15T10:30:00Z',
    extraido_em: '2026-08-15T10:00:00Z'
  };

  it('renderiza os dados do contato e aciona o callback de exclusão', () => {
    const onToggleSelect = vi.fn();
    const onDelete = vi.fn();

    render(
      <table>
        <tbody>
          <ContactsTableRow
            contact={contactMock}
            isSelected={false}
            onToggleSelect={onToggleSelect}
            onDelete={onDelete}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('Carlos Eduardo')).toBeInTheDocument();
    expect(screen.getByText('5511988887777')).toBeInTheDocument();
    expect(screen.getByText('👑 ADMIN')).toBeInTheDocument();
    expect(screen.getByText('Grupo Vendas')).toBeInTheDocument();
    expect(screen.getByText('No Grupo')).toBeInTheDocument();
    expect(screen.getByText('ENVIADO')).toBeInTheDocument();

    const btnDelete = screen.getByTitle('Excluir contato');
    fireEvent.click(btnDelete);
    expect(onDelete).toHaveBeenCalledWith(contactMock);
  });
});
