import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import BulkDuplicateModal from '../pages/Scheduling/components/BulkDuplicateModal';

describe('BulkDuplicateModal', () => {
  const mockGrupos = [
    { id: 'g1', nome: 'Grupo VIP 1', id_do_grupo: '123@g.us' },
    { id: 'g2', nome: 'Grupo VIP 2', id_do_grupo: '456@g.us' }
  ];

  it('não renderiza nada se isOpen for false', () => {
    const { container } = render(
      <BulkDuplicateModal 
        isOpen={false} 
        onClose={() => {}} 
        grupos={mockGrupos} 
        selectedCount={2} 
        defaultDay={3} 
        onSave={() => {}} 
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza título, dia padrão e lista de grupos quando isOpen for true', () => {
    render(
      <BulkDuplicateModal 
        isOpen={true} 
        onClose={() => {}} 
        grupos={mockGrupos} 
        selectedCount={2} 
        defaultDay={3} 
        onSave={() => {}} 
      />
    );

    expect(screen.getByText('Duplicar Mensagens Selecionadas')).toBeInTheDocument();
    expect(screen.getByText('Duplicando 2 mensagem(ns) selecionada(s)')).toBeInTheDocument();
    
    const selectDia = screen.getByRole('combobox');
    expect(selectDia).toHaveValue('3');

    expect(screen.getByText('Grupo VIP 1')).toBeInTheDocument();
    expect(screen.getByText('Grupo VIP 2')).toBeInTheDocument();
  });

  it('chama onSave com o dia e grupos selecionados ao clicar em confirmar', () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    render(
      <BulkDuplicateModal 
        isOpen={true} 
        onClose={handleClose} 
        grupos={mockGrupos} 
        selectedCount={2} 
        defaultDay={1} 
        onSave={handleSave} 
      />
    );

    const selectDia = screen.getByRole('combobox');
    fireEvent.change(selectDia, { target: { value: '5' } });

    // Selecionar primeiro grupo
    fireEvent.click(screen.getByText('Grupo VIP 1'));

    // Clicar no botão duplicar
    const btnDuplicar = screen.getByText('Duplicar 2 mensagem(ns)');
    fireEvent.click(btnDuplicar);

    expect(handleSave).toHaveBeenCalledWith(5, ['g1']);
    expect(handleClose).toHaveBeenCalled();
  });
});
