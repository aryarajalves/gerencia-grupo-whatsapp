import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Chat from '../pages/Chat';
import React from 'react';

// Mock do axios para evitar chamadas reais
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
  }
}));

describe('Chat Scroll Logic', () => {
  it('deve renderizar o componente de chat corretamente', () => {
    render(<Chat openConfirm={() => {}} />);
    expect(screen.getByText(/Chat de Grupos/i)).toBeDefined();
  });

  // Nota: Testar scroll real no JSDOM é limitado, 
  // mas podemos validar a existência do botão se simularmos o estado.
  it('não deve mostrar o botão de scroll inicialmente', () => {
    render(<Chat openConfirm={() => {}} />);
    const scrollButton = screen.queryByRole('button', { name: /chevron-down/i });
    expect(scrollButton).toBeNull();
  });
});
