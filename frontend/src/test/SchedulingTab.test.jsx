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
  { id: 'm1', mensagem: 'Olá bem vindo', horario_do_disparo: '10:00:00', dia_do_lancamento: 1, tipo_de_mensagem: 'texto' }
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

describe('AgendarMensagens - Navegação por Abas', () => {
  it('renderiza por padrão a aba "Roteiro Configurado"', () => {
    renderAgendarMensagens();
    expect(screen.getByText('Roteiro Configurado')).toBeInTheDocument();
    expect(screen.getByText('Olá bem vindo')).toBeInTheDocument();
  });

  it('alterna para a aba "Cadastrar Novo Template" ao clicar na aba', () => {
    renderAgendarMensagens();
    const tabBtn = screen.getByText('Cadastrar Novo Template');
    fireEvent.click(tabBtn);

    // O formulário de template deve ser renderizado
    expect(screen.getByPlaceholderText('Digite o conteúdo da mensagem...')).toBeInTheDocument();
  });
  it('cancela a edição e volta para a lista ao clicar em "Roteiro Configurado" durante edição', () => {
    renderAgendarMensagens();

    // 1. Navega para o formulário
    const tabForm = screen.getByText('Cadastrar Novo Template');
    fireEvent.click(tabForm);
    expect(screen.getByPlaceholderText('Digite o conteúdo da mensagem...')).toBeInTheDocument();

    // 2. Clica em "Roteiro Configurado" para voltar
    const tabLista = screen.getByText('Roteiro Configurado');
    fireEvent.click(tabLista);

    // 3. A lista de mensagens deve estar visível novamente
    expect(screen.getByText('Olá bem vindo')).toBeInTheDocument();

    // 4. O formulário não deve estar visível
    expect(screen.queryByPlaceholderText('Digite o conteúdo da mensagem...')).not.toBeInTheDocument();
  });
});
