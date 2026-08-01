import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GroupsTable from '../pages/Groups/components/GroupsTable';

describe('GroupsTable Bulk Delete & Selection', () => {
  const sampleGroups = [
    { id: 'g1', nome: 'Grupo VIP 1', id_do_grupo: 'g1@g.us', ativo: true, tipo_ciclo: 'semanal', quantidade_contatos: 10, dia_lancamento_atual: 1 },
    { id: 'g2', nome: 'Grupo VIP 2', id_do_grupo: 'g2@g.us', ativo: true, tipo_ciclo: 'semanal', quantidade_contatos: 20, dia_lancamento_atual: 0 }
  ];

  it('deve renderizar checkboxes de seleção e barra de ações em massa quando selecionados', () => {
    const toggleSelectGroup = vi.fn();
    const toggleSelectAll = vi.fn();
    const clearSelection = vi.fn();
    const finalizeBulkDelete = vi.fn();
    const openConfirm = vi.fn();

    const { rerender } = render(
      <GroupsTable 
        grupos={sampleGroups}
        selectedGroupIds={[]}
        toggleSelectGroup={toggleSelectGroup}
        toggleSelectAll={toggleSelectAll}
        clearSelection={clearSelection}
        finalizeBulkDelete={finalizeBulkDelete}
        openConfirm={openConfirm}
      />
    );

    // Não deve mostrar barra de ações em massa quando nada selecionado
    expect(screen.queryByText(/Selecionado\(s\)/i)).toBeNull();

    // Rerender com 1 grupo selecionado
    rerender(
      <GroupsTable 
        grupos={sampleGroups}
        selectedGroupIds={['g1']}
        toggleSelectGroup={toggleSelectGroup}
        toggleSelectAll={toggleSelectAll}
        clearSelection={clearSelection}
        finalizeBulkDelete={finalizeBulkDelete}
        openConfirm={openConfirm}
      />
    );

    // Deve exibir barra de ações em massa
    expect(screen.getByText(/1 Selecionado\(s\)/i)).toBeDefined();
    expect(screen.getByText(/Excluir Selecionados \(1\)/i)).toBeDefined();

    // Clica no botão de Excluir Selecionados
    const btnExcluir = screen.getByText(/Excluir Selecionados \(1\)/i);
    fireEvent.click(btnExcluir);

    // Deve chamar openConfirm com dialog de confirmação em massa
    expect(openConfirm).toHaveBeenCalled();
  });
});
