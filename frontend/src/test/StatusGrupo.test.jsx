import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import MessageForm from '../pages/Scheduling/components/MessageForm';

describe('MessageForm - Novo tipo de conteúdo: Status do Grupo (Abrir/Fechar)', () => {
  const initialMessage = {
    tipo_de_mensagem: 'texto',
    dia_do_lancamento: 1,
    horario_do_disparo: '10:00',
    mensagem: '',
    grupo_ids: []
  };

  it('permite selecionar o novo tipo de conteúdo "ABRIR/FECHAR"', () => {
    const setNovaMensagem = vi.fn();
    render(
      <MessageForm
        novaMensagem={initialMessage}
        setNovaMensagem={setNovaMensagem}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        editingId={null}
        processing={false}
        grupos={[]}
      />
    );

    const btnAbrirFechar = screen.getByText('ABRIR/FECHAR');
    expect(btnAbrirFechar).toBeInTheDocument();
    fireEvent.click(btnAbrirFechar);

    expect(setNovaMensagem).toHaveBeenCalledWith(expect.objectContaining({
      tipo_de_mensagem: 'status_grupo'
    }));
  });

  it('exibe os botões de ação de Fechar Grupo e Abrir Grupo quando o tipo é status_grupo', () => {
    const messageStatusGrupo = { ...initialMessage, tipo_de_mensagem: 'status_grupo', mensagem: 'fechar' };
    const setNovaMensagem = vi.fn();
    render(
      <MessageForm
        novaMensagem={messageStatusGrupo}
        setNovaMensagem={setNovaMensagem}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        editingId={null}
        processing={false}
        grupos={[]}
      />
    );

    expect(screen.getByText('Fechar Grupo')).toBeInTheDocument();
    expect(screen.getByText('Abrir Grupo')).toBeInTheDocument();

    const btnAbrir = screen.getByText('Abrir Grupo');
    fireEvent.click(btnAbrir);

    expect(setNovaMensagem).toHaveBeenCalledWith(expect.objectContaining({
      mensagem: 'abrir'
    }));
  });
});
