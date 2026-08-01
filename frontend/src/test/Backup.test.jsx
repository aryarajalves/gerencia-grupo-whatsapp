import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import Backup from '../pages/Backup';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn((url) => {
      if (url === '/backup/info') {
        return Promise.resolve({
          data: {
            ultimo_backup: { filename: 'zapgroup_backup_2026_08_01.dump.gz', datetime: '01/08/2026, 08:39:32' },
            proximo_backup: { datetime: '01/08/2026, 14:39:32', interval_hours: 6 },
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
            total: 1,
            items: [
              { filename: 'zapgroup_backup_2026_08_01.dump.gz', size_bytes: 1048576, last_modified: '2026-08-01T08:39:32Z' }
            ]
          }
        });
      }
      return Promise.resolve({ data: {} });
    }),
    post: vi.fn(() => Promise.resolve({ data: { status: 'success', message: 'Ok' } }))
  }
}));

describe('Backup Component', () => {
  const mockOpenConfirm = vi.fn();

  it('renderiza o cabeçalho, os 3 cards de resumo e botões de ação', async () => {
    render(<Backup openConfirm={mockOpenConfirm} />);

    expect(screen.getByRole('heading', { name: /Backup Banco/i })).toBeInTheDocument();
    expect(await screen.findByText(/zapgroup_backup_2026_08_01.dump.gz/i)).toBeInTheDocument();
    expect(screen.getByText(/30/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fazer Backup Agora/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fazer Upload de Backup/i })).toBeInTheDocument();
  });
});
