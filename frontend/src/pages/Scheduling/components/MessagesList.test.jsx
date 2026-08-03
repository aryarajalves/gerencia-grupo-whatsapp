import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import MessagesList from './MessagesList';

const mockMensagens = Array.from({ length: 25 }, (_, i) => ({
  id: `msg-${i + 1}`,
  dia_do_lancamento: i < 15 ? 1 : 2,
  horario_do_disparo: '10:00',
  tipo_de_mensagem: 'texto',
  mensagem: `Mensagem de teste ${i + 1}`,
  link_midia: null
}));

describe('MessagesList Component (Abas de Dias e Paginação)', () => {
  it('deve renderizar as abas de todos os dias e dos dias 1 e 2', () => {
    render(<MessagesList mensagens={mockMensagens} />);

    expect(screen.getByText(/Todos os Dias \(25\)/i)).toBeInTheDocument();
    expect(screen.getByText(/DIA 01/i)).toBeInTheDocument();
    expect(screen.getByText(/DIA 02/i)).toBeInTheDocument();
  });

  it('deve paginar 20 mensagens por padrão', () => {
    render(<MessagesList mensagens={mockMensagens} />);

    expect(screen.getByText(/Página 1 de 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Mostrar/i)).toBeInTheDocument();
    expect(screen.getByText(/de 25 mensagens/i)).toBeInTheDocument();
  });

  it('deve alterar a quantidade por página ao selecionar 50 no dropdown', () => {
    render(<MessagesList mensagens={mockMensagens} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '50' } });

    expect(screen.getByText(/Página 1 de 1/i)).toBeInTheDocument();
  });
});
