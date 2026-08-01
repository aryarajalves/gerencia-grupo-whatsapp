import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AgendarMensagens from '../pages/Scheduling';

// Mock child components or icons if needed
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        total_messages: 1,
        items: [{ mensagem: 'Teste Export', dia_do_lancamento: 1, horario_do_disparo: '12:00:00', tipo_de_mensagem: 'texto' }]
      }
    }),
    post: vi.fn().mockResolvedValue({
      data: { imported_count: 1, message: '1 mensagem importada com sucesso!' }
    })
  }
}));

describe('AgendarMensagens - Exportar e Importar Roteiro', () => {
  const mockMensagens = [
    { id: '1', mensagem: 'Mensagem Teste 1', dia_do_lancamento: 1, horario_do_disparo: '10:00:00', tipo_de_mensagem: 'texto' }
  ];

  it('deve renderizar os botões de Exportar Roteiro e Importar Roteiro', () => {
    render(<AgendarMensagens mensagens={mockMensagens} grupos={[]} onRefresh={vi.fn()} openConfirm={vi.fn()} />);

    const exportBtn = screen.getByRole('button', { name: /Exportar Roteiro/i });
    const importBtn = screen.getByRole('button', { name: /Importar Roteiro/i });

    expect(exportBtn).toBeDefined();
    expect(importBtn).toBeDefined();
  });

  it('deve abrir o modal de importação ao clicar em Importar Roteiro', () => {
    render(<AgendarMensagens mensagens={mockMensagens} grupos={[]} onRefresh={vi.fn()} openConfirm={vi.fn()} />);

    const importBtn = screen.getByRole('button', { name: /Importar Roteiro/i });
    fireEvent.click(importBtn);

    expect(screen.getByText(/Importar Roteiro de Mensagens/i)).toBeDefined();
    expect(screen.getByText(/Clique para selecionar o arquivo .json/i)).toBeDefined();
  });
});
