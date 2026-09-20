import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GroupFilters from '../pages/Groups/components/GroupFilters';

describe('GroupFilters Component', () => {
  it('renderiza campo de busca e dispara setSearchTerm', () => {
    const setSearchTerm = vi.fn();
    const setStatusFilter = vi.fn();
    const setItemsPerPage = vi.fn();
    const setCurrentPage = vi.fn();
    const setShowAdvancedFilters = vi.fn();
    const setCicloFilter = vi.fn();
    const setExtracaoFilter = vi.fn();

    render(
      <GroupFilters
        searchTerm=""
        setSearchTerm={setSearchTerm}
        statusFilter="todos"
        setStatusFilter={setStatusFilter}
        itemsPerPage={20}
        setItemsPerPage={setItemsPerPage}
        setCurrentPage={setCurrentPage}
        showAdvancedFilters={false}
        setShowAdvancedFilters={setShowAdvancedFilters}
        cicloFilter="todos"
        setCicloFilter={setCicloFilter}
        extracaoFilter="todos"
        setExtracaoFilter={setExtracaoFilter}
        totalGrupos={10}
        countDisparoHoje={2}
        countAtivos={8}
        countInativos={2}
        countAlerta={1}
        activeAdvancedFiltersCount={0}
      />
    );

    const input = screen.getByPlaceholderText(/Buscar por nome ou JID/i);
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Grupo VIP' } });
    expect(setSearchTerm).toHaveBeenCalledWith('Grupo VIP');
  });

  it('abre painel de filtros avançados e permite alterar ciclo e extração', () => {
    const setCicloFilter = vi.fn();
    const setExtracaoFilter = vi.fn();
    const setCurrentPage = vi.fn();

    render(
      <GroupFilters
        searchTerm=""
        setSearchTerm={vi.fn()}
        statusFilter="todos"
        setStatusFilter={vi.fn()}
        itemsPerPage={20}
        setItemsPerPage={vi.fn()}
        setCurrentPage={setCurrentPage}
        showAdvancedFilters={true}
        setShowAdvancedFilters={vi.fn()}
        cicloFilter="todos"
        setCicloFilter={setCicloFilter}
        extracaoFilter="todos"
        setExtracaoFilter={setExtracaoFilter}
        totalGrupos={10}
        countDisparoHoje={2}
        countAtivos={8}
        countInativos={2}
        countAlerta={1}
        activeAdvancedFiltersCount={1}
      />
    );

    expect(screen.getByText(/Tipo de Ciclo/i)).toBeInTheDocument();
    expect(screen.getByText(/Extração de Contatos/i)).toBeInTheDocument();

    const btnSemanal = screen.getByRole('button', { name: /Semanal/i });
    fireEvent.click(btnSemanal);
    expect(setCicloFilter).toHaveBeenCalledWith('semanal');

    const btnHabilitada = screen.getByRole('button', { name: /Habilitada/i });
    fireEvent.click(btnHabilitada);
    expect(setExtracaoFilter).toHaveBeenCalledWith('habilitada');
  });
});
