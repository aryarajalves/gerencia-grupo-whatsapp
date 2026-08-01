import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GroupSidebar from '../pages/Chat/components/GroupSidebar';
import ChatHeader from '../pages/Chat/components/ChatHeader';

describe('Conversas WhatsApp - Novas Funcionalidades (Paginação, Fechar Chat e Fixar Grupo)', () => {
  const gruposMock = Array.from({ length: 25 }, (_, i) => ({
    id: `g-${i + 1}`,
    nome: `Grupo ${i + 1}`,
    id_do_grupo: `100${i + 1}@g.us`,
    quantidade_contatos: 10,
    tipo: 'grupo'
  }));

  const waStatusMock = { status: 'conectado', plan_type: 'PRO' };

  it('renderiza o seletor de paginação e alterna o número de itens por página', () => {
    render(
      <GroupSidebar 
        waStatus={waStatusMock} 
        groupSearch="" 
        setGroupSearch={vi.fn()} 
        filteredGroups={gruposMock} 
        selectedGroup={null} 
        setSelectedGroup={vi.fn()} 
      />
    );

    const selectPaginacao = screen.getByRole('combobox');
    expect(selectPaginacao).toBeInTheDocument();
    expect(screen.getByText('Pág 1 de 2')).toBeInTheDocument();

    // Troca para 50 por página
    fireEvent.change(selectPaginacao, { target: { value: '50' } });
    expect(screen.getByText('Pág 1 de 1')).toBeInTheDocument();
  });

  it('permite fixar e desafixar conversas no topo da lista', () => {
    render(
      <GroupSidebar 
        waStatus={waStatusMock} 
        groupSearch="" 
        setGroupSearch={vi.fn()} 
        filteredGroups={gruposMock} 
        selectedGroup={null} 
        setSelectedGroup={vi.fn()} 
      />
    );

    const pinButtons = screen.getAllByTitle(/Fixar conversa no topo/i);
    expect(pinButtons.length).toBeGreaterThan(0);

    // Fixar o primeiro grupo
    fireEvent.click(pinButtons[0]);
    expect(screen.getByTitle(/Desafixar conversa/i)).toBeInTheDocument();
  });

  it('renderiza o botão de fechar conversa no ChatHeader e aciona onCloseChat', () => {
    const onCloseChatMock = vi.fn();
    render(
      <ChatHeader 
        selectedGroup={gruposMock[0]} 
        fetchMessages={vi.fn()} 
        loading={false} 
        onOpenContacts={vi.fn()} 
        onCloseChat={onCloseChatMock} 
      />
    );

    const btnFechar = screen.getByTitle('Fechar conversa aberta');
    expect(btnFechar).toBeInTheDocument();

    fireEvent.click(btnFechar);
    expect(onCloseChatMock).toHaveBeenCalled();
  });
});
