import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import Backup from '../pages/Backup';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn((url) => {
      if (url === '/backup/info') {
        return Promise.resolve({
          data: {
            ultimo_backup: { filename: 'backup_teste.dump.gz', datetime: '14/08/2026 10:00' },
            proximo_backup: { datetime: '14/08/2026 16:00' },
            retencao_count: 30,
            interval_hours: 6,
            agendamento_ativo: true,
            s3_configurado: true
          }
        });
      }
      if (url === '/backup/list') {
        return Promise.resolve({
          data: {
            items: [
              { filename: 'backup_teste.dump.gz', size_bytes: 1048576, last_modified: '2026-08-14T10:00:00Z' }
            ]
          }
        });
      }
      return Promise.resolve({ data: {} });
    }),
    post: vi.fn(() => Promise.resolve({ data: { message: 'Operação concluída' } })),
    delete: vi.fn(() => Promise.resolve({ data: { message: 'Excluído' } }))
  }
}));

describe('Backup - Organização em Abas', () => {
  it('renderiza as abas de Backup e permite alternar entre elas', async () => {
    render(<Backup openConfirm={vi.fn()} />);

    // Verifica se os botões das abas estão presentes
    expect(screen.getByRole('button', { name: /Backups Armazenados/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Operações Manuais/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Agendamento & Retenção/i })).toBeInTheDocument();

    // Alterna para Operações Manuais
    const tabManuais = screen.getByRole('button', { name: /Operações Manuais/i });
    fireEvent.click(tabManuais);
    expect(screen.getByText(/Criar Backup Manual Imediato/i)).toBeInTheDocument();
    expect(screen.getByText(/Importar Backup Externo/i)).toBeInTheDocument();

    // Alterna para Agendamento & Retenção
    const tabAgendamento = screen.getByRole('button', { name: /Agendamento & Retenção/i });
    fireEvent.click(tabAgendamento);
    expect(screen.getByText(/Configurações de Agendamento Automático/i)).toBeInTheDocument();
    expect(screen.getByText(/Pasta do Backup no S3/i)).toBeInTheDocument();
  });
});
