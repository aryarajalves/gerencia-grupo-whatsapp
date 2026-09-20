import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GroupTableRow from '../pages/Groups/components/GroupTableRow';

describe('GroupTableRow Component', () => {
  const groupMock = {
    id: 'grp-1',
    nome: 'Grupo Teste',
    id_do_grupo: '123@g.us',
    ativo: true,
    dia_inicio_semana: 0,
    dia_fim_semana: 4,
    tipo_ciclo: 'semanal',
    quantidade_contatos: 15,
    dia_lancamento_atual: 2,
    tem_disparo_hoje: true,
    status_grupo_fechado: true,
    total_mensagens: 3
  };

  it('renderiza corretamente os dados do grupo e badges', () => {
    render(
      <table>
        <tbody>
          <GroupTableRow
            group={groupMock}
            isSelected={false}
            isEditing={false}
            idx={0}
            toggleSelectGroup={vi.fn()}
            extrairContatosAgora={vi.fn()}
            openConfirm={vi.fn()}
            abrirModalMensagens={vi.fn()}
            startEdit={vi.fn()}
            handleToggle={vi.fn()}
            isDisparoHoje={() => true}
            getGroupInitials={(n) => 'GT'}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('Grupo Teste')).toBeInTheDocument();
    expect(screen.getByText('Fechado (Só Admins)')).toBeInTheDocument();
    expect(screen.getByText('⚡ DISPARO HOJE')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('DIA 02')).toBeInTheDocument();
  });

  it('aciona callbacks de ação ao clicar nos botões', () => {
    const handleToggle = vi.fn();
    const startEdit = vi.fn();
    const abrirModalMensagens = vi.fn();

    render(
      <table>
        <tbody>
          <GroupTableRow
            group={groupMock}
            isSelected={false}
            isEditing={false}
            idx={0}
            toggleSelectGroup={vi.fn()}
            extrairContatosAgora={vi.fn()}
            openConfirm={vi.fn()}
            abrirModalMensagens={abrirModalMensagens}
            startEdit={startEdit}
            handleToggle={handleToggle}
            isDisparoHoje={() => true}
            getGroupInitials={(n) => 'GT'}
          />
        </tbody>
      </table>
    );

    const btnEdit = screen.getByTitle('Editar Grupo');
    fireEvent.click(btnEdit);
    expect(startEdit).toHaveBeenCalledWith(groupMock);

    const btnPausar = screen.getByTitle('Pausar');
    fireEvent.click(btnPausar);
    expect(handleToggle).toHaveBeenCalledWith('grp-1');

    const btnMensagens = screen.getByTitle('Vincular Mensagens');
    fireEvent.click(btnMensagens);
    expect(abrirModalMensagens).toHaveBeenCalledWith(groupMock);
  });
});
