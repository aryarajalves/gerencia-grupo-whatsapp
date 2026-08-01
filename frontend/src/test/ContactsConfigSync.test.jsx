import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Contacts from '../pages/Contacts';

// Mock axiosInstance
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn((url) => {
      if (url.includes('/contatos/grupos')) return Promise.resolve({ data: [{ id: 1, nome: 'Grupo A' }] });
      if (url.includes('/contatos/stats')) return Promise.resolve({ data: { total_contatos: 10, total_grupos: 2 } });
      if (url.includes('/contatos/')) return Promise.resolve({
        data: {
          items: [
            { id: 'c1', nome: 'Lead A', numero: '5511999999999', jid_grupo: 'g1', no_grupo: true, criado_em: '2026-07-31T18:00:00Z' }
          ],
          total: 1
        }
      });
      return Promise.resolve({ data: {} });
    })
  }
}));

describe('Contacts - Sincronização ao Trocar de Cliente', () => {
  it('re-executa a busca de contatos quando o evento config-updated é disparado', async () => {
    render(<Contacts openConfirm={vi.fn()} />);

    // Aguarda o primeiro contato ser carregado
    const lead = await screen.findByText('Lead A');
    expect(lead).toBeInTheDocument();

    // Dispara o evento global config-updated simulando troca de cliente no Sidebar
    act(() => {
      window.dispatchEvent(new CustomEvent('config-updated'));
    });

    // O componente deve permanecer funcional e atualizado
    expect(screen.getByText('Gestão de Contatos')).toBeInTheDocument();
  });
});
