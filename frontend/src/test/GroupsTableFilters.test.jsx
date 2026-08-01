import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GroupsTable from '../pages/Groups/components/GroupsTable';

describe('GroupsTable - Filtros Avançados (Ciclo Semanal vs Único)', () => {
  const gruposMock = [
    {
      id: 'g-1',
      nome: 'Grupo Semanal 01',
      id_do_grupo: '1@g.us',
      ativo: true,
      tipo_ciclo: 'semanal',
      extrair_contatos: true
    },
    {
      id: 'g-2',
      nome: 'Grupo Único 02',
      id_do_grupo: '2@g.us',
      ativo: true,
      tipo_ciclo: 'unico',
      extrair_contatos: false
    }
  ];

  it('exibe o botão de Filtros Avançados e abre o painel expandível ao clicar', () => {
    render(
      <GroupsTable
        grupos={gruposMock}
        editingId={null}
        copiedId={null}
        handleCopy={vi.fn()}
        abrirModalMensagens={vi.fn()}
        startEdit={vi.fn()}
        handleToggle={vi.fn()}
        setDeletingId={vi.fn()}
      />
    );

    const btnFiltros = screen.getByRole('button', { name: /Filtros Avançados/i });
    expect(btnFiltros).toBeInTheDocument();

    fireEvent.click(btnFiltros);
    expect(screen.getByText(/Tipo de Ciclo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Semanal/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Único/i })).toBeInTheDocument();
  });

  it('filtra grupos por ciclo Semanal e por ciclo Único corretamente', () => {
    render(
      <GroupsTable
        grupos={gruposMock}
        editingId={null}
        copiedId={null}
        handleCopy={vi.fn()}
        abrirModalMensagens={vi.fn()}
        startEdit={vi.fn()}
        handleToggle={vi.fn()}
        setDeletingId={vi.fn()}
      />
    );

    const btnFiltros = screen.getByRole('button', { name: /Filtros Avançados/i });
    fireEvent.click(btnFiltros);

    // Clica no filtro "Semanal"
    const btnSemanal = screen.getByRole('button', { name: /Semanal/i });
    fireEvent.click(btnSemanal);

    expect(screen.getByText('Grupo Semanal 01')).toBeInTheDocument();
    expect(screen.queryByText('Grupo Único 02')).not.toBeInTheDocument();

    // Clica no filtro "Único"
    const btnUnico = screen.getByRole('button', { name: /Único/i });
    fireEvent.click(btnUnico);

    expect(screen.getByText('Grupo Único 02')).toBeInTheDocument();
    expect(screen.queryByText('Grupo Semanal 01')).not.toBeInTheDocument();
  });
});
