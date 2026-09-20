import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PollOptionsForm from '../pages/Scheduling/components/form/PollOptionsForm';

describe('PollOptionsForm Component', () => {
  it('renderiza as opções de enquete e permite adicionar novas opções', () => {
    const setNovaMensagem = vi.fn();
    const novaMensagemMock = {
      opcoes_enquete: 'Opção 1\nOpção 2',
      enquete_multipla: false,
      webhook_enquete_ativo: true
    };

    render(
      <PollOptionsForm
        novaMensagem={novaMensagemMock}
        setNovaMensagem={setNovaMensagem}
      />
    );

    expect(screen.getByDisplayValue('Opção 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Opção 2')).toBeInTheDocument();

    const btnAdd = screen.getByRole('button', { name: /\+ Adicionar Outra Opção/i });
    fireEvent.click(btnAdd);
    expect(setNovaMensagem).toHaveBeenCalledWith(expect.objectContaining({
      opcoes_enquete: 'Opção 1\nOpção 2\n'
    }));
  });
});
