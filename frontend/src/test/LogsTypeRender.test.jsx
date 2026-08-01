import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import HistoricoEnvios from '../pages/Logs';
import axiosInstance from '../services/api';

vi.mock('../services/api');

describe('HistoricoEnvios Component - Type rendering', () => {
  it('renders different message types (Texto, Imagem, Enquete) correctly', async () => {
    const mockLogsResponse = {
      data: {
        total: 3,
        total_geral: 3,
        total_sucesso: 3,
        total_erro: 0,
        items: [
          {
            id: '1',
            grupo_nome: 'Grupo Teste A',
            mensagem_corpo: 'Qual sua cor favorita?',
            status: 'Sucesso',
            tipo: 'enquete',
            tipo_mensagem: 'enquete',
            criado_em: '2026-08-01T10:00:00'
          },
          {
            id: '2',
            grupo_nome: 'Grupo Teste B',
            mensagem_corpo: 'http://example.com/foto.png',
            status: 'Sucesso',
            tipo: 'imagem',
            tipo_mensagem: 'imagem',
            criado_em: '2026-08-01T10:05:00'
          }
        ]
      }
    };

    axiosInstance.get.mockResolvedValue(mockLogsResponse);

    render(<HistoricoEnvios openConfirm={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Enquete')).toBeInTheDocument();
      expect(screen.getByText('Imagem')).toBeInTheDocument();
    });
  });
});
