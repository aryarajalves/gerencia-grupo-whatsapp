import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MessageGroupSelector from '../pages/Scheduling/components/form/MessageGroupSelector';

describe('MessageGroupSelector Component', () => {
  const gruposMock = [
    { id: 1, nome: 'Grupo VIP 1' },
    { id: 2, nome: 'Grupo VIP 2' }
  ];

  it('renderiza os grupos e botões TODOS e NENHUM', () => {
    const onToggleGrupo = vi.fn();
    const onSelectAll = vi.fn();
    const onSelectNone = vi.fn();

    render(
      <MessageGroupSelector
        grupos={gruposMock}
        selectedGroupIds={[1]}
        onToggleGrupo={onToggleGrupo}
        onSelectAll={onSelectAll}
        onSelectNone={onSelectNone}
      />
    );

    expect(screen.getByText('Grupo VIP 1')).toBeInTheDocument();
    expect(screen.getByText('Grupo VIP 2')).toBeInTheDocument();

    const btnTodos = screen.getByRole('button', { name: /TODOS/i });
    fireEvent.click(btnTodos);
    expect(onSelectAll).toHaveBeenCalled();

    const btnNenhum = screen.getByRole('button', { name: /NENHUM/i });
    fireEvent.click(btnNenhum);
    expect(onSelectNone).toHaveBeenCalled();
  });
});
