import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), loading: vi.fn(), dismiss: vi.fn() },
  Toaster: () => null,
  default: { success: vi.fn(), error: vi.fn(), loading: vi.fn(), dismiss: vi.fn() },
}));

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    defaults: { headers: { common: {} } },
  },
}));

import MessageForm from '../pages/Scheduling/components/MessageForm';
import MessagesList from '../pages/Scheduling/components/MessagesList';

describe('Funcionalidade de Etiqueta / Tag em Mensagens', () => {
  it('renderiza o campo de Etiqueta / Tag no MessageForm', () => {
    const setNovaMensagem = vi.fn();
    const novaMensagem = {
      mensagem: '',
      horario_do_disparo: '12:00',
      dia_do_lancamento: 1,
      tipo_de_mensagem: 'texto',
      etiqueta: '',
      grupo_ids: []
    };

    render(
      <MessageForm
        novaMensagem={novaMensagem}
        setNovaMensagem={setNovaMensagem}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        editingId={null}
        processing={false}
        file={null}
        previewUrl={null}
        setFile={vi.fn()}
        setPreviewUrl={vi.fn()}
        uploadProgress={0}
        handleFileChange={vi.fn()}
        grupos={[]}
      />
    );

    const inputEtiqueta = screen.getByPlaceholderText('Digite ou escolha uma etiqueta...');
    expect(inputEtiqueta).toBeInTheDocument();

    fireEvent.change(inputEtiqueta, { target: { value: 'Oferta' } });
    expect(setNovaMensagem).toHaveBeenCalledWith(expect.objectContaining({ etiqueta: 'Oferta' }));
  });

  it('exibe o dropdown de seleção com as etiquetas já criadas no MessageForm', () => {
    const setNovaMensagem = vi.fn();
    const novaMensagem = {
      mensagem: '',
      horario_do_disparo: '12:00',
      dia_do_lancamento: 1,
      tipo_de_mensagem: 'texto',
      etiqueta: '',
      grupo_ids: []
    };
    const mensagensExistentes = [
      { id: '1', mensagem: 'M1', etiqueta: 'Oferta' },
      { id: '2', mensagem: 'M2', etiqueta: 'Lembrete' }
    ];

    render(
      <MessageForm
        novaMensagem={novaMensagem}
        setNovaMensagem={setNovaMensagem}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        editingId={null}
        processing={false}
        file={null}
        previewUrl={null}
        setFile={vi.fn()}
        setPreviewUrl={vi.fn()}
        uploadProgress={0}
        handleFileChange={vi.fn()}
        grupos={[]}
        mensagens={mensagensExistentes}
      />
    );

    const selectDropdown = screen.getByRole('combobox');
    expect(selectDropdown).toBeInTheDocument();
    expect(screen.getByText('Oferta')).toBeInTheDocument();
    expect(screen.getByText('Lembrete')).toBeInTheDocument();

    fireEvent.change(selectDropdown, { target: { value: 'Lembrete' } });
    expect(setNovaMensagem).toHaveBeenCalledWith(expect.objectContaining({ etiqueta: 'Lembrete' }));
  });

  it('exibe a badge de etiqueta e permite filtrar por etiquetas no MessagesList', () => {
    const mensagensComEtiqueta = [
      { id: '1', mensagem: 'Super Oferta 1', horario_do_disparo: '10:00:00', dia_do_lancamento: 1, tipo_de_mensagem: 'texto', etiqueta: 'Oferta' },
      { id: '2', mensagem: 'Lembrete Live', horario_do_disparo: '14:00:00', dia_do_lancamento: 1, tipo_de_mensagem: 'texto', etiqueta: 'Lembrete' },
      { id: '3', mensagem: 'Sem Tag', horario_do_disparo: '16:00:00', dia_do_lancamento: 1, tipo_de_mensagem: 'texto', etiqueta: null }
    ];

    render(
      <MessagesList
        mensagens={mensagensComEtiqueta}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        openConfirm={vi.fn()}
        editingId={null}
        onOpenNewForm={vi.fn()}
      />
    );

    // Verifica se os badges das etiquetas são exibidos nos cards
    expect(screen.getByText('🏷️ Oferta')).toBeInTheDocument();
    expect(screen.getByText('🏷️ Lembrete')).toBeInTheDocument();

    // Filtra clicando na pill "Oferta"
    const pillOferta = screen.getByRole('button', { name: /Oferta/i });
    fireEvent.click(pillOferta);

    // Deve exibir 'Super Oferta 1' e não exibir 'Lembrete Live'
    expect(screen.getByText('Super Oferta 1')).toBeInTheDocument();
    expect(screen.queryByText('Lembrete Live')).not.toBeInTheDocument();
  });
});
