import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), loading: vi.fn(), dismiss: vi.fn() },
  Toaster: () => null,
  default: { success: vi.fn(), error: vi.fn(), loading: vi.fn(), dismiss: vi.fn() },
}));

import GroupForm from '../pages/Groups/components/GroupForm';

describe('GroupForm - Tempo de Digitando', () => {
  it('renderiza o campo "Simular Digitando Antes de Enviar"', () => {
    const novoGrupo = { nome: '', id_do_grupo: '', tempo_digitando_segundos: 0 };
    render(
      <GroupForm
        novoGrupo={novoGrupo}
        setNovoGrupo={vi.fn()}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        editingId={null}
        processing={false}
      />
    );

    expect(screen.getByText('Simular Digitando Antes de Enviar')).toBeInTheDocument();
    expect(screen.getByText('Desabilitado (envio imediato)')).toBeInTheDocument();
    expect(screen.getByText('5 segundos')).toBeInTheDocument();
  });

  it('chama setNovoGrupo ao alterar o tempo de digitando', () => {
    const setNovoGrupoMock = vi.fn();
    const novoGrupo = { nome: '', id_do_grupo: '', tempo_digitando_segundos: 0 };
    render(
      <GroupForm
        novoGrupo={novoGrupo}
        setNovoGrupo={setNovoGrupoMock}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        editingId={null}
        processing={false}
      />
    );

    const select = screen.getByDisplayValue('Desabilitado (envio imediato)');
    fireEvent.change(select, { target: { value: '5' } });

    expect(setNovoGrupoMock).toHaveBeenCalledWith(
      expect.objectContaining({ tempo_digitando_segundos: 5 })
    );
  });
});
