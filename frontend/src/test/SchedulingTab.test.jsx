import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
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
});
