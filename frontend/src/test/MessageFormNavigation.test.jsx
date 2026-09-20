import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MessageForm from '../pages/Scheduling/components/MessageForm';

describe('MessageForm - Navegação entre Mensagens', () => {
  const mensagensMock = [
    {
      id: 'm1',
      dia_do_lancamento: 1,
      horario_do_disparo: '09:00',
      mensagem: 'Primeira mensagem do Dia 1',
      tipo_de_mensagem: 'texto',
      grupo_ids: []
    },
    {
      id: 'm2',
      dia_do_lancamento: 1,
      horario_do_disparo: '14:00',
      mensagem: 'Segunda mensagem do Dia 1',
      tipo_de_mensagem: 'texto',
      grupo_ids: []
    },
    {
      id: 'm3',
      dia_do_lancamento: 2,
      horario_do_disparo: '10:00',
      mensagem: 'Terceira mensagem no Dia 2',
      tipo_de_mensagem: 'texto',
      grupo_ids: []
    }
  ];

  const defaultProps = {
    novaMensagem: {
      mensagem: 'Mensagem atual',
      horario_do_disparo: '09:00',
      dia_do_lancamento: 1,
      tipo_de_mensagem: 'texto',
      grupo_ids: []
    },
    setNovaMensagem: vi.fn(),
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    processing: false,
    file: null,
    previewUrl: null,
    setFile: vi.fn(),
    setPreviewUrl: vi.fn(),
    uploadProgress: 0,
    handleFileChange: vi.fn(),
    grupos: [],
    mensagens: mensagensMock
  };

  it('desabilita botão Anterior e deixa 100% visível/clicável o botão Próxima na primeira mensagem', () => {
    const onNavigateMessage = vi.fn();

    render(
      <MessageForm
        {...defaultProps}
        editingId="m1"
        onNavigateMessage={onNavigateMessage}
      />
    );

    const btnPrev = screen.getByTestId('btn-nav-prev-message');
    const btnNext = screen.getByTestId('btn-nav-next-message');

    // Primeira mensagem: sem anterior
    expect(btnPrev).toBeDisabled();
    expect(btnPrev).toHaveStyle({ opacity: '0.25' });

    // Primeira mensagem: tem próxima
    expect(btnNext).not.toBeDisabled();
    expect(btnNext).toHaveStyle({ opacity: '1' });

    // Clica em próxima e navega para m2
    fireEvent.click(btnNext);
    expect(onNavigateMessage).toHaveBeenCalledWith(mensagensMock[1]);
  });

  it('deixa ambos os botões clicáveis e 100% visíveis em mensagem intermediária', () => {
    const onNavigateMessage = vi.fn();

    render(
      <MessageForm
        {...defaultProps}
        editingId="m2"
        onNavigateMessage={onNavigateMessage}
      />
    );

    const btnPrev = screen.getByTestId('btn-nav-prev-message');
    const btnNext = screen.getByTestId('btn-nav-next-message');

    expect(btnPrev).not.toBeDisabled();
    expect(btnPrev).toHaveStyle({ opacity: '1' });

    expect(btnNext).not.toBeDisabled();
    expect(btnNext).toHaveStyle({ opacity: '1' });

    // Navega para anterior (m1)
    fireEvent.click(btnPrev);
    expect(onNavigateMessage).toHaveBeenCalledWith(mensagensMock[0]);

    // Navega para próxima (m3)
    fireEvent.click(btnNext);
    expect(onNavigateMessage).toHaveBeenCalledWith(mensagensMock[2]);
  });

  it('desabilita botão Próxima e deixa 100% visível/clicável o botão Anterior na última mensagem', () => {
    const onNavigateMessage = vi.fn();

    render(
      <MessageForm
        {...defaultProps}
        editingId="m3"
        onNavigateMessage={onNavigateMessage}
      />
    );

    const btnPrev = screen.getByTestId('btn-nav-prev-message');
    const btnNext = screen.getByTestId('btn-nav-next-message');

    // Última mensagem: tem anterior
    expect(btnPrev).not.toBeDisabled();
    expect(btnPrev).toHaveStyle({ opacity: '1' });

    // Última mensagem: não tem próxima
    expect(btnNext).toBeDisabled();
    expect(btnNext).toHaveStyle({ opacity: '0.25' });

    // Clica em anterior e navega para m2
    fireEvent.click(btnPrev);
    expect(onNavigateMessage).toHaveBeenCalledWith(mensagensMock[1]);
  });
});
