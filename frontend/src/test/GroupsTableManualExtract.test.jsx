import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GroupsTable from '../pages/Groups/components/GroupsTable';
import ConfirmModal from '../components/common/ConfirmModal';

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
      confirmText: 'Extrair Agora',
      confirmTextChecked: 'Reenviar para Todos',
      checkboxLabel: 'Disparar webhook para todos os membros',
      defaultCheckboxChecked: false
    }));

    // Simula confirmação com checkbox marcado (forcarReenvio=true)
    const modalProps = openConfirm.mock.calls[0][0];
    modalProps.onConfirm(true);
    expect(extrairContatosAgora).toHaveBeenCalledWith('g-100', 'Grupo Teste Manual', true);
  });
});

describe('ConfirmModal - Checkbox Interativo de Forçar Reenvio', () => {
  it('renderiza o checkbox e atualiza o texto do botão de ação ao alternar', () => {
    const onConfirmMock = vi.fn();
    const onCancelMock = vi.fn();

    render(
      <ConfirmModal
        show={true}
        title="Extrair Contatos Manualmente"
        message="Deseja iniciar a busca e sincronização?"
        type="info"
        confirmText="Extrair Agora"
        confirmTextChecked="Reenviar para Todos"
        checkboxLabel="Disparar webhook para todos os membros"
        checkboxDescription="Reenvia o webhook mesmo para quem já foi disparado."
        defaultCheckboxChecked={false}
        onConfirm={onConfirmMock}
        onCancel={onCancelMock}
      />
    );

    expect(screen.getByText('Disparar webhook para todos os membros')).toBeInTheDocument();
    expect(screen.getByText('Reenvia o webhook mesmo para quem já foi disparado.')).toBeInTheDocument();

    const checkbox = screen.getByTestId('confirm-modal-checkbox');
    expect(checkbox).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Extrair Agora' })).toBeInTheDocument();

    // Clica no container para marcar o checkbox
    const container = screen.getByTestId('confirm-modal-checkbox-container');
    fireEvent.click(container);

    expect(checkbox).toBeChecked();
    expect(screen.getByRole('button', { name: 'Reenviar para Todos' })).toBeInTheDocument();

    // Clica no botão de confirmação
    fireEvent.click(screen.getByRole('button', { name: 'Reenviar para Todos' }));
    expect(onConfirmMock).toHaveBeenCalledWith(true);
  });
});

