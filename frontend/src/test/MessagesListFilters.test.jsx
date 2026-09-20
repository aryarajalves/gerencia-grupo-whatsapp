import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MessagesListFilters from '../pages/Scheduling/components/MessagesListFilters';

describe('MessagesListFilters Component', () => {
  it('renderiza campo de busca e aciona setSearchTerm', () => {
    const setSearchTerm = vi.fn();
    const handleSelectAll = vi.fn();
    const onOpenNewForm = vi.fn();
    const setActiveTag = vi.fn();
    const setActiveDay = vi.fn();

    render(
      <MessagesListFilters
        searchTerm=""
        setSearchTerm={setSearchTerm}
        isAllFilteredSelected={false}
        handleSelectAll={handleSelectAll}
        onOpenNewForm={onOpenNewForm}
        availableTags={['Oferta', 'Aviso']}
        activeTag="ALL"
        setActiveTag={setActiveTag}
        availableDays={[1, 2]}
        activeDay="ALL"
        setActiveDay={setActiveDay}
        totalMessagesCount={10}
        mensagens={[]}
      />
    );

    const inputBusca = screen.getByPlaceholderText(/Buscar texto ou etiqueta/i);
    expect(inputBusca).toBeInTheDocument();

    fireEvent.change(inputBusca, { target: { value: 'Cupom' } });
    expect(setSearchTerm).toHaveBeenCalledWith('Cupom');

    const btnNovo = screen.getByRole('button', { name: /\+ Novo Template/i });
    fireEvent.click(btnNovo);
    expect(onOpenNewForm).toHaveBeenCalled();

    const tabDia = screen.getByRole('button', { name: /DIA 01/i });
    fireEvent.click(tabDia);
    expect(setActiveDay).toHaveBeenCalledWith('1');
  });

  it('renderiza os botões de filtro por tipo e aciona setActiveType', () => {
    const setActiveType = vi.fn();
    const mensagensMock = [
      { id: '1', tipo_de_mensagem: 'texto' },
      { id: '2', tipo_de_mensagem: 'imagem' },
      { id: '3', tipo_de_mensagem: 'enquete' }
    ];

    render(
      <MessagesListFilters
        availableTypes={['texto', 'imagem', 'enquete']}
        activeType="ALL"
        setActiveType={setActiveType}
        mensagens={mensagensMock}
      />
    );

    // Botão Todos os Tipos
    const btnTodosTipos = screen.getByRole('button', { name: /Todos os Tipos/i });
    expect(btnTodosTipos).toBeInTheDocument();
    fireEvent.click(btnTodosTipos);
    expect(setActiveType).toHaveBeenCalledWith('ALL');

    // Botão Texto
    const btnTexto = screen.getByRole('button', { name: /Texto/i });
    expect(btnTexto).toBeInTheDocument();
    fireEvent.click(btnTexto);
    expect(setActiveType).toHaveBeenCalledWith('texto');

    // Botão Imagem
    const btnImagem = screen.getByRole('button', { name: /Imagem/i });
    expect(btnImagem).toBeInTheDocument();
    fireEvent.click(btnImagem);
    expect(setActiveType).toHaveBeenCalledWith('imagem');

    // Botão Enquete
    const btnEnquete = screen.getByRole('button', { name: /Enquete/i });
    expect(btnEnquete).toBeInTheDocument();
    fireEvent.click(btnEnquete);
    expect(setActiveType).toHaveBeenCalledWith('enquete');
  });
});
