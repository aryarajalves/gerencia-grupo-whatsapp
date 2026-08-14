import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import GroupForm from '../pages/Groups/components/GroupForm';

describe('GroupForm - Badges da Lista de Segurança de Administradores', () => {
  it('limpa caracteres não numéricos ao criar badge com Enter', () => {
    const setNovoGrupoMock = vi.fn();
    const novoGrupo = {
      nome: 'Grupo Teste',
      id_do_grupo: '123@g.us',
      adms_permitidos: '',
      seguranca_adms_ativa: true
    };

    render(
      <GroupForm
        novoGrupo={novoGrupo}
        setNovoGrupo={setNovoGrupoMock}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        editingId={null}
        processing={false}
        wapiGrupos={[]}
        wapiLoading={false}
        wapiErro={null}
      />
    );

    const input = screen.getByPlaceholderText('Digite o número e aperte Enter...');
    fireEvent.change(input, { target: { value: '+55 85 9612-3586' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(setNovoGrupoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        adms_permitidos: '558596123586',
        seguranca_adms_ativa: true
      })
    );
  });

  it('exibe badges existentes e permite remoção ao clicar no botão X', () => {
    const setNovoGrupoMock = vi.fn();
    const novoGrupo = {
      nome: 'Grupo Teste',
      id_do_grupo: '123@g.us',
      adms_permitidos: '5511999998888, 5511977776666',
      seguranca_adms_ativa: true
    };

    render(
      <GroupForm
        novoGrupo={novoGrupo}
        setNovoGrupo={setNovoGrupoMock}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        editingId={null}
        processing={false}
        wapiGrupos={[]}
        wapiLoading={false}
        wapiErro={null}
      />
    );

    expect(screen.getByText('5511999998888')).toBeInTheDocument();
    expect(screen.getByText('5511977776666')).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole('button').filter(b => b.querySelector('svg'));
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
      expect(setNovoGrupoMock).toHaveBeenCalledWith(
        expect.objectContaining({
          adms_permitidos: '5511977776666'
        })
      );
    }
  });
});
