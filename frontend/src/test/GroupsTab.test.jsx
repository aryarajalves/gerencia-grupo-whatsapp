import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import GerenciarGrupos from '../pages/Groups';
import { AuthProvider } from '../contexts/AuthContext';
import { WaStatusProvider } from '../contexts/WaStatusContext';
import { CompanyProvider } from '../contexts/CompanyContext';

const sampleGrupos = [
  { id: '1', nome: 'Grupo Alfa', id_do_grupo: '111@g.us', dia_inicio_semana: 0, dia_fim_semana: 4, ativo: true, quantidade_contatos: 5, total_mensagens: 2 },
  { id: '2', nome: 'Grupo Beta', id_do_grupo: '222@g.us', dia_inicio_semana: 1, dia_fim_semana: 5, ativo: false, quantidade_contatos: 3, total_mensagens: 0 }
];

const renderGerenciarGrupos = (props = {}) => render(
  <AuthProvider>
    <WaStatusProvider>
      <CompanyProvider>
        <GerenciarGrupos
          grupos={sampleGrupos}
          setGrupos={vi.fn()}
          mensagens={[]}
          onRefresh={vi.fn()}
          openConfirm={vi.fn()}
          {...props}
        />
      </CompanyProvider>
    </WaStatusProvider>
  </AuthProvider>
);

describe('GerenciarGrupos - Navegação por Abas', () => {
  it('renderiza por padrão a aba "Grupos Monitorados"', () => {
    renderGerenciarGrupos();
    expect(screen.getByText('Grupos Monitorados')).toBeInTheDocument();
    expect(screen.getByText('Grupo Alfa')).toBeInTheDocument();
    expect(screen.getByText('Grupo Beta')).toBeInTheDocument();
  });

  it('alterna para a aba "Cadastrar Novo Grupo" ao clicar no botão da aba', () => {
    renderGerenciarGrupos();
    const tabBtn = screen.getByText('Cadastrar Novo Grupo');
    fireEvent.click(tabBtn);

    // O formulário de cadastro deve estar visível
    expect(screen.getByPlaceholderText('Ex: Lançamento VIP A')).toBeInTheDocument();
  });

  it('filtra grupos na tabela pelo campo de busca', () => {
    renderGerenciarGrupos();
    const searchInput = screen.getByPlaceholderText('Buscar por nome ou JID...');
    fireEvent.change(searchInput, { target: { value: 'Alfa' } });

    expect(screen.getByText('Grupo Alfa')).toBeInTheDocument();
    expect(screen.queryByText('Grupo Beta')).not.toBeInTheDocument();
  });
});
