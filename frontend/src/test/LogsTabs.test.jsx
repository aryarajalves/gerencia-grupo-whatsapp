import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import HistoricoEnvios from '../pages/Logs';

// Mock do axiosInstance
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        items: [
          { id: '1', grupo_nome: 'Grupo Teste', mensagem_corpo: 'Log 1', tipo: 'extracao_contatos', status: 'Sucesso', criado_em: '2026-08-14T10:00:00Z' }
        ],
        total: 1,
        total_sucesso: 1,
        total_erro: 0
      }
    }),
    delete: vi.fn().mockResolvedValue({ data: { message: 'ok' } }),
    post: vi.fn().mockResolvedValue({ data: { message: 'ok' } })
  }
}));

describe('HistoricoEnvios - Abas de Categorias', () => {
  it('renderiza as abas de categorias e permite alternar entre elas', async () => {
    render(<HistoricoEnvios openConfirm={vi.fn()} />);

    // Verifica se as abas estão presentes
    expect(screen.getByRole('button', { name: /Todos os Registros/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mensagens & Disparos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Extração de Leads/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Segurança de Admins/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sentinela Fantasma/i })).toBeInTheDocument();

    // Clica na aba Extração de Leads
    const tabExtracao = screen.getByRole('button', { name: /Extração de Leads/i });
    fireEvent.click(tabExtracao);
  });
});
