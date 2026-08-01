import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GroupForm from '../pages/Groups/components/GroupForm';

describe('GroupForm - Configurações de Extração de Contatos', () => {
  it('renderiza as opções de habilitação e intervalo de extração', () => {
    const novoGrupo = {
      nome: 'Grupo Teste',
      id_do_grupo: 'g1@g.us',
      dia_inicio_semana: 0,
      dia_fim_semana: 4,
      ativo: true,
      tipo_ciclo: 'semanal',
      extrair_contatos: true,
      intervalo_extracao_minutos: 30
    };
    const setNovoGrupo = vi.fn();

    render(
      <GroupForm 
        novoGrupo={novoGrupo} 
        setNovoGrupo={setNovoGrupo} 
        onSubmit={vi.fn()} 
        onCancel={vi.fn()} 
        editingId={null} 
        processing={false} 
        wapiGrupos={[]} 
        wapiLoading={false} 
        wapiErro="" 
      />
    );

    expect(screen.getByText('Extração de Contatos')).toBeInTheDocument();
    expect(screen.getByText('Habilitada')).toBeInTheDocument();
    expect(screen.getByText('Desabilitada')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A cada 30 minutos (Padrão)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://hook.plataforma.com/webhook/...')).toBeInTheDocument();
  });

  it('permite alterar o campo Webhook de Contatos', () => {
    const novoGrupo = {
      nome: 'Grupo Teste',
      id_do_grupo: 'g1@g.us',
      extrair_contatos: true,
      webhook_extracao_url: 'https://webhook.site/abc'
    };
    const setNovoGrupo = vi.fn();

    render(
      <GroupForm 
        novoGrupo={novoGrupo} 
        setNovoGrupo={setNovoGrupo} 
        onSubmit={vi.fn()} 
        onCancel={vi.fn()} 
        editingId={null} 
        processing={false} 
        wapiGrupos={[]} 
        wapiLoading={false} 
        wapiErro="" 
      />
    );

    const input = screen.getByPlaceholderText('https://hook.plataforma.com/webhook/...');
    expect(input.value).toBe('https://webhook.site/abc');

    fireEvent.change(input, { target: { value: 'https://webhook.site/xyz' } });
    expect(setNovoGrupo).toHaveBeenCalledWith(expect.objectContaining({
      webhook_extracao_url: 'https://webhook.site/xyz'
    }));
  });
});

