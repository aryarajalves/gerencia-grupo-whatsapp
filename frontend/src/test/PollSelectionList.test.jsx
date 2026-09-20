import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PollSelectionList from '../pages/Groups/components/tabs/poll/PollSelectionList';

describe('PollSelectionList Component', () => {
  const enquetesMock = [
    { id: 101, mensagem: 'Qual seu tema favorito?', dia_do_lancamento: 1, horario_do_disparo: '10:00', opcoes_enquete: 'Opcao A\nOpcao B' },
    { id: 102, mensagem: 'Participará do evento?', dia_do_lancamento: 2, horario_do_disparo: '14:00', opcoes_enquete: 'Sim\nNao' }
  ];

  it('renderiza a lista de enquetes com opções de selecionar e desmarcar todas', () => {
    const togglePollSelection = vi.fn();
    const handleSelectAll = vi.fn();
    const handleDeselectAll = vi.fn();

    render(
      <PollSelectionList
        enquetesDisponiveis={enquetesMock}
        selectedPollIds={['101']}
        loadingEnquetes={false}
        togglePollSelection={togglePollSelection}
        handleSelectAll={handleSelectAll}
        handleDeselectAll={handleDeselectAll}
      />
    );

    expect(screen.getByText('Qual seu tema favorito?')).toBeInTheDocument();
    expect(screen.getByText('Participará do evento?')).toBeInTheDocument();
    expect(screen.getByText(/1 selecionada/i)).toBeInTheDocument();

    const btnSelectAll = screen.getByRole('button', { name: /Selecionar Todas/i });
    fireEvent.click(btnSelectAll);
    expect(handleSelectAll).toHaveBeenCalled();

    const btnDeselectAll = screen.getByRole('button', { name: /Desmarcar Todas/i });
    fireEvent.click(btnDeselectAll);
    expect(handleDeselectAll).toHaveBeenCalled();
  });
});
