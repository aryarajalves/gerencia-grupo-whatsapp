import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HistoricoEnvios from '../pages/Logs';

// Mock axiosInstance
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({
      data: {
        items: [
          {
            id: 'log-ext-1',
            grupo_nome: 'Grupo Teste Logs',
            mensagem_corpo: 'Extração de contatos realizada (50 contatos encontrados)',
            status: 'SUCESSO',
            tipo: 'extracao_contatos',
            criado_em: '2026-07-31T18:00:00Z'
          }
        ],
        total: 1,
        total_geral: 1,
        total_sucesso: 1,
        total_erro: 0
      }
    }))
  }
}));

describe('HistoricoEnvios - Badge de Extração de Contatos', () => {
  it('exibe o badge Extração Contatos para logs do tipo extracao_contatos', async () => {
    render(<HistoricoEnvios openConfirm={vi.fn()} />);

    // Aguarda o badge de Extração Contatos aparecer na tela
    const badge = await screen.findByText('Extração Contatos');
    expect(badge).toBeInTheDocument();

    const corpo = screen.getByText('Extração de contatos realizada (50 contatos encontrados)');
    expect(corpo).toBeInTheDocument();
  });
});
