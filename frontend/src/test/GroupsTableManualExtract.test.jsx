import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GroupsTable from '../pages/Groups/components/GroupsTable';

describe('GroupsTable - Botão de Extração Manual de Contatos', () => {
  it('renderiza o botão Extrair Contatos Agora e aciona a função extrairContatosAgora', () => {
    const grupos = [
      {
        id: 'g-100',
        nome: 'Grupo Teste Manual',
        id_do_grupo: '100@g.us',
        dia_inicio_semana: 0,
        dia_fim_semana: 4,
        ativo: true,
        tipo_ciclo: 'semanal',
        quantidade_contatos: 5
      }
    ];

    const extrairContatosAgora = vi.fn();

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
        extrairContatosAgora={extrairContatosAgora} 
      />
    );

    const btnExtrair = screen.getByTitle('Extrair Contatos Agora');
    expect(btnExtrair).toBeInTheDocument();

    fireEvent.click(btnExtrair);
    expect(extrairContatosAgora).toHaveBeenCalledWith('g-100');
  });

  it('aciona o openConfirm com popup centralizado de confirmação', () => {
    const grupos = [
      {
        id: 'g-100',
        nome: 'Grupo Teste Manual',
        id_do_grupo: '100@g.us',
        ativo: true
      }
    ];

    const extrairContatosAgora = vi.fn();
    const openConfirm = vi.fn();

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
        extrairContatosAgora={extrairContatosAgora}
        openConfirm={openConfirm}
      />
    );

    const btnExtrair = screen.getByTitle('Extrair Contatos Agora');
    fireEvent.click(btnExtrair);

    expect(openConfirm).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Extrair Contatos Manualmente',
      type: 'info',
      confirmText: 'Extrair Agora'
    }));
  });
});

