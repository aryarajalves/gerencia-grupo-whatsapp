import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PollScopeSelector from '../pages/Groups/components/tabs/poll/PollScopeSelector';

describe('PollScopeSelector Component', () => {
  it('renderiza as opções de escopo e dispara callback ao alternar', () => {
    const onChange = vi.fn();
    render(<PollScopeSelector modo="todas" onChange={onChange} />);

    expect(screen.getByText('Todas as Enquetes do Grupo')).toBeInTheDocument();
    expect(screen.getByText('Apenas Enquetes Programadas / Selecionadas')).toBeInTheDocument();

    const radioSelecionadas = screen.getByDisplayValue('selecionadas');
    fireEvent.click(radioSelecionadas);
    expect(onChange).toHaveBeenCalledWith('selecionadas');
  });
});
