import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CaptureTableRow from '../pages/Capture/components/CaptureTableRow';

describe('CaptureTableRow Component', () => {
  const capturaMock = {
    id: 99,
    group_name: 'Grupo VIP Lançamento',
    group_jid: '120363@g.us',
    sender_name: 'Marcos Silva',
    sender_number: '551199887766',
    message_content: 'Mensagem de teste recebida',
    media_url: null,
    timestamp: '2026-08-20T14:30:00Z'
  };

  it('renderiza os dados da captura e dispara callbacks de seleção e exclusão', () => {
    const onToggleSelect = vi.fn();
    const onDelete = vi.fn();

    render(
      <table>
        <tbody>
          <CaptureTableRow
            m={capturaMock}
            isSelected={false}
            onToggleSelect={onToggleSelect}
            onDelete={onDelete}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('Grupo VIP Lançamento')).toBeInTheDocument();
    expect(screen.getByText('Mensagem de teste recebida')).toBeInTheDocument();
    expect(screen.getByText(/Marcos Silva/i)).toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(onToggleSelect).toHaveBeenCalledWith(99);

    const btnDelete = screen.getByTitle('Excluir captura');
    fireEvent.click(btnDelete);
    expect(onDelete).toHaveBeenCalledWith(99);
  });
});
