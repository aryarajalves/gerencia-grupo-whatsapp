import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MessageCard from '../pages/Scheduling/components/MessageCard';

describe('MessageCard Component', () => {
  const messageMock = {
    id: 'msg-1',
    mensagem: 'Olá participantes, tudo bem?',
    dia_do_lancamento: 1,
    horario_do_disparo: '09:30:00',
    tipo_de_mensagem: 'texto',
    etiqueta: 'Boas-Vindas'
  };

  it('renderiza dados da mensagem, horário e etiqueta corretamente', () => {
    render(
      <MessageCard
        message={messageMock}
        day={1}
        messageNumberOnDay={1}
        isEditing={false}
        isSelected={false}
        toggleSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        openConfirm={vi.fn()}
        setFullscreenMedia={vi.fn()}
      />
    );

    expect(screen.getByText('Olá participantes, tudo bem?')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('09:30')).toBeInTheDocument();
    expect(screen.getByText('🏷️ Boas-Vindas')).toBeInTheDocument();
  });

  it('aciona callbacks de edição e exclusão', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <MessageCard
        message={messageMock}
        day={1}
        messageNumberOnDay={1}
        isEditing={false}
        isSelected={false}
        toggleSelect={vi.fn()}
        onEdit={onEdit}
        onDelete={onDelete}
        openConfirm={vi.fn()}
        setFullscreenMedia={vi.fn()}
      />
    );

    const btnEdit = screen.getByTitle('Editar');
    fireEvent.click(btnEdit);
    expect(onEdit).toHaveBeenCalledWith(messageMock);

    const btnDelete = screen.getByTitle('Excluir');
    fireEvent.click(btnDelete);
    expect(onDelete).toHaveBeenCalledWith('msg-1', expect.any(Function));
  });
});
