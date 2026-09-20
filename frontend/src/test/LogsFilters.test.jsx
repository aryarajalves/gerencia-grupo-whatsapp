import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LogsFilters from '../pages/Logs/components/LogsFilters';

describe('LogsFilters Component', () => {
  const gruposMock = [
    { id: 1, nome: 'Grupo Alfa' },
    { id: 2, nome: 'Grupo Beta' }
  ];

  it('renderiza os filtros e dispara o callback de limpar', () => {
    const limparFiltros = vi.fn();
    const setFiltroGrupo = vi.fn();
    const setFiltroStatus = vi.fn();

    render(
      <LogsFilters
        gruposList={gruposMock}
        filtroGrupo=""
        setFiltroGrupo={setFiltroGrupo}
        filtroStatus=""
        setFiltroStatus={setFiltroStatus}
        filtroDataInicio=""
        setFiltroDataInicio={vi.fn()}
        filtroDataFim=""
        setFiltroDataFim={vi.fn()}
        resultsPerPage={20}
        setResultsPerPage={vi.fn()}
        setCurrentPage={vi.fn()}
        limparFiltros={limparFiltros}
      />
    );

    expect(screen.getByText('Todos os Grupos')).toBeInTheDocument();
    expect(screen.getByText('Grupo Alfa')).toBeInTheDocument();
    expect(screen.getByText('Grupo Beta')).toBeInTheDocument();
    expect(screen.getByText('Todos Status')).toBeInTheDocument();

    const btnLimpar = screen.getByRole('button', { name: /Limpar/i });
    fireEvent.click(btnLimpar);
    expect(limparFiltros).toHaveBeenCalled();
  });
});
