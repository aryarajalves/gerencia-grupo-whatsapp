import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MessagesList from '../pages/Scheduling/components/MessagesList';

describe('MessagesList Bulk Actions & Selection', () => {
  const sampleMessages = [
    { id: 'm1', mensagem: 'Mensagem 1', dia_do_lancamento: 1, horario_do_disparo: '10:00:00', tipo_de_mensagem: 'texto', grupo_ids: [] },
    { id: 'm2', mensagem: 'Mensagem 2', dia_do_lancamento: 1, horario_do_disparo: '11:00:00', tipo_de_mensagem: 'texto', grupo_ids: [] }
  ];

  const sampleGroups = [
    { id: 'g1', nome: 'Grupo Alfa', id_do_grupo: 'g1@g.us' },
    { id: 'g2', nome: 'Grupo Beta', id_do_grupo: 'g2@g.us' }
  ];

  it('deve permitir selecionar mensagens e exibir a barra de ações em lote', () => {
    const onBulkDelete = vi.fn();
    const onBulkAssignGroups = vi.fn();
    const openConfirm = vi.fn();

    render(
      <MessagesList
        mensagens={sampleMessages}
        grupos={sampleGroups}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onBulkDelete={onBulkDelete}
        onBulkAssignGroups={onBulkAssignGroups}
        openConfirm={openConfirm}
      />
    );

    // Inicialmente a barra de ações em lote não deve estar visível
    expect(screen.queryByText(/mensagem\(ns\) selecionada\(s\)/i)).toBeNull();

    // Clicar no checkbox da mensagem 1
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
    fireEvent.click(checkboxes[0]);

    // Agora a barra de ações em lote deve aparecer com "1 mensagem(ns) selecionada(s)"
    expect(screen.getByText(/mensagem\(ns\) selecionada\(s\)/i)).toBeDefined();
    expect(screen.getByText(/Excluir Selecionadas \(1\)/i)).toBeDefined();
    expect(screen.getByText(/Atribuir Grupos/i)).toBeDefined();

    // Clicar no botão Excluir Selecionadas
    const btnExcluir = screen.getByText(/Excluir Selecionadas/i);
    fireEvent.click(btnExcluir);
    expect(onBulkDelete).toHaveBeenCalled();
  });

  it('deve abrir modal de Atribuir Grupos quando o botão for clicado', () => {
    const onBulkAssignGroups = vi.fn();

    render(
      <MessagesList
        mensagens={sampleMessages}
        grupos={sampleGroups}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onBulkDelete={vi.fn()}
        onBulkAssignGroups={onBulkAssignGroups}
        openConfirm={vi.fn()}
      />
    );

    // Selecionar primeira mensagem
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    // Clicar em Atribuir Grupos
    const btnAtribuir = screen.getByText(/Atribuir Grupos/i);
    fireEvent.click(btnAtribuir);

    // Verificar se o modal de atribuição foi aberto exibindo o título
    expect(screen.getByText(/Atribuir Grupos Destinatários/i)).toBeDefined();
    expect(screen.getByText(/Grupo Alfa/i)).toBeDefined();
    expect(screen.getByText(/Grupo Beta/i)).toBeDefined();
  });
});
