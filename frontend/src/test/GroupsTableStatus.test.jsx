import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import GroupsTable from '../pages/Groups/components/GroupsTable';

describe('GroupsTable - Status Fechado vs Aberto do Grupo', () => {
  it('exibe badge Fechado (Só Admins) quando status_grupo_fechado é true', () => {
    const grupos = [
      {
        id: '1',
        nome: 'Grupo Fechado VIP',
        id_do_grupo: '12345@g.us',
        ativo: true,
        dia_inicio_semana: 0,
        dia_fim_semana: 4,
        status_grupo_fechado: true,
        total_mensagens: 1
      }
    ];

    render(
      <GroupsTable
        grupos={grupos}
        editingId={null}
        copiedId={null}
        handleCopy={vi.fn()}
        abrirModalMensagens={vi.fn()}
        startEdit={vi.fn()}
        handleToggle={vi.fn()}
        setDeletingId={vi.fn()}
      />
    );

    expect(screen.getByText('Fechado (Só Admins)')).toBeInTheDocument();
  });

  it('exibe badge Aberto (Todos conversam) quando status_grupo_fechado é false', () => {
    const grupos = [
      {
        id: '2',
        nome: 'Grupo Aberto Geral',
        id_do_grupo: '67890@g.us',
        ativo: true,
        dia_inicio_semana: 0,
        dia_fim_semana: 4,
        status_grupo_fechado: false,
        total_mensagens: 1
      }
    ];

    render(
      <GroupsTable
        grupos={grupos}
        editingId={null}
        copiedId={null}
        handleCopy={vi.fn()}
        abrirModalMensagens={vi.fn()}
        startEdit={vi.fn()}
        handleToggle={vi.fn()}
        setDeletingId={vi.fn()}
      />
    );

    expect(screen.getByText('Aberto (Todos conversam)')).toBeInTheDocument();
  });
});
