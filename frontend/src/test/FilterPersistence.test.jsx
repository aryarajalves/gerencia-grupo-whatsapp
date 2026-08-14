import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), loading: vi.fn(), dismiss: vi.fn() },
  Toaster: () => null,
  default: { success: vi.fn(), error: vi.fn(), loading: vi.fn(), dismiss: vi.fn() },
}));

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    defaults: { headers: { common: {} } },
  },
}));

import AgendarMensagens from '../pages/Scheduling';
import { AuthProvider } from '../contexts/AuthContext';
import { WaStatusProvider } from '../contexts/WaStatusContext';
import { CompanyProvider } from '../contexts/CompanyContext';

const sampleMensagens = [
  { id: 'm1', mensagem: 'Mensagem Oferta Especial', horario_do_disparo: '10:00:00', dia_do_lancamento: 1, etiqueta: 'promo', tipo_de_mensagem: 'texto' },
  { id: 'm2', mensagem: 'Mensagem de Lembrete', horario_do_disparo: '14:00:00', dia_do_lancamento: 3, etiqueta: 'aviso', tipo_de_mensagem: 'texto' }
];

const renderAgendarMensagens = (props = {}) => render(
  <AuthProvider>
    <WaStatusProvider>
      <CompanyProvider>
        <AgendarMensagens
          mensagens={sampleMensagens}
          grupos={[]}
          onRefresh={vi.fn()}
          openConfirm={vi.fn()}
          {...props}
        />
      </CompanyProvider>
    </WaStatusProvider>
  </AuthProvider>
);

describe('AgendarMensagens - Preservação de Filtros', () => {
  it('preserva os filtros ao alternar para cadastro e retornar para a lista', () => {
    renderAgendarMensagens();

    // 1. Aplica um filtro de busca no input
    const searchInput = screen.getByPlaceholderText('Buscar texto ou etiqueta...');
    fireEvent.change(searchInput, { target: { value: 'Oferta Especial' } });

    // Apenas a mensagem correspondente ao filtro deve estar visível
    expect(screen.getByText('Mensagem Oferta Especial')).toBeInTheDocument();
    expect(screen.queryByText('Mensagem de Lembrete')).not.toBeInTheDocument();

    // 2. Clica em "Cadastrar Novo Template"
    const tabForm = screen.getByText('Cadastrar Novo Template');
    fireEvent.click(tabForm);
    expect(screen.getByPlaceholderText('Digite o conteúdo da mensagem...')).toBeInTheDocument();

    // 3. Cancela / Volta para a lista de roteiro
    const tabList = screen.getByText('Roteiro Configurado');
    fireEvent.click(tabList);

    // 4. Verifica se o filtro 'Oferta Especial' permaneceu ativo e o input manteve o valor
    const searchInputAfter = screen.getByPlaceholderText('Buscar texto ou etiqueta...');
    expect(searchInputAfter.value).toBe('Oferta Especial');
    expect(screen.getByText('Mensagem Oferta Especial')).toBeInTheDocument();
    expect(screen.queryByText('Mensagem de Lembrete')).not.toBeInTheDocument();
  });
});
