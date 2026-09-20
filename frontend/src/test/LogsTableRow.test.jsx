import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LogsTableRow from '../pages/Logs/components/LogsTableRow';

describe('LogsTableRow Component', () => {
  const logMock = {
    id: 101,
    grupo_nome: 'Grupo Teste 1',
    mensagem_corpo: 'Disparo de teste realizado',
    status: 'sucesso',
    tipo: 'texto',
    criado_em: '2026-08-20T10:00:00Z'
  };

  it('renderiza o log corretamente e dispara callbacks de seleção e exclusão', () => {
    const onToggleSelect = vi.fn();
    const onDelete = vi.fn();
    const onRetry = vi.fn();

    render(
      <table>
        <tbody>
          <LogsTableRow
            log={logMock}
            isSelected={false}
            processingId={null}
            onToggleSelect={onToggleSelect}
            onRetry={onRetry}
            onDelete={onDelete}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('Grupo Teste 1')).toBeInTheDocument();
    expect(screen.getByText('Disparo de teste realizado')).toBeInTheDocument();
    expect(screen.getByText('SUCESSO')).toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(onToggleSelect).toHaveBeenCalledWith(101);

    const btnDelete = screen.getByTitle('Excluir log');
    fireEvent.click(btnDelete);
    expect(onDelete).toHaveBeenCalledWith(101);
  });
});
