import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import Dashboard from '../pages/Dashboard';
import { WaStatusProvider } from '../contexts/WaStatusContext';

const sampleGrupos = [
  { id: '1', nome: 'Grupo Alfa 001', id_do_grupo: '111@g.us', ativo: true, dia_lancamento_atual: 1 },
  { id: '2', nome: 'Grupo Beta 002', id_do_grupo: '222@g.us', ativo: true, dia_lancamento_atual: 2 }
];

const sampleStats = {
  total_grupos_ativos: 2,
  total_grupos_lancamento: 2,
  total_mensagens: 10,
  disparos_hoje: 5,
  taxa_sucesso: 100,
  ultimo_disparo: { grupo_nome: 'Grupo Alfa 001', mensagem_corpo: 'Oi Alfa', criado_em: new Date().toISOString() },
  proximos_disparos: [
    { horario: '14:00', grupo: 'Grupo Alfa 001', mensagem: 'Mensagem Alfa', tipo: 'texto' },
    { horario: '15:00', grupo: 'Grupo Beta 002', mensagem: 'Mensagem Beta', tipo: 'texto' }
  ],
  grupos_por_dia: [
    { dia: 1, grupos: ['Grupo Alfa 001'] },
    { dia: 2, grupos: ['Grupo Beta 002'] }
  ],
  grupos_sem_mensagens: ['Grupo Alfa 001', 'Grupo Beta 002'],
  falhas_definitivas: [],
  conjuntos_quase_cheios: []
};

const renderDashboard = (props = {}) => render(
  <WaStatusProvider>
    <Dashboard
      stats={sampleStats}
      grupos={sampleGrupos}
      onRefresh={vi.fn()}
      {...props}
    />
  </WaStatusProvider>
);

describe('Dashboard - Seletor de Grupo e Consolidação de Avisos', () => {
  it('renderiza o seletor de grupos no cabeçalho com a opção padrão "Todos os Grupos"', () => {
    renderDashboard();
    expect(screen.getByText('Filtrar por Grupo:')).toBeInTheDocument();
    expect(screen.getByText('Todos os Grupos (2)')).toBeInTheDocument();
  });

  it('exibe aviso consolidado para múltiplos grupos sem mensagens quando TODOS está selecionado', () => {
    renderDashboard();
    expect(screen.getByText('Aviso de Configuração')).toBeInTheDocument();
    expect(screen.getByText('2 GRUPOS')).toBeInTheDocument();
    expect(screen.getByText('Ver Grupos (2)')).toBeInTheDocument();
  });

  it('expande a lista de grupos sem mensagem ao clicar em "Ver Grupos"', () => {
    renderDashboard();
    const btnExpandir = screen.getByText('Ver Grupos (2)');
    fireEvent.click(btnExpandir);

    expect(screen.getByPlaceholderText('Buscar grupo sem mensagem...')).toBeInTheDocument();
    expect(screen.getByText('Grupo Alfa 001')).toBeInTheDocument();
    expect(screen.getByText('Grupo Beta 002')).toBeInTheDocument();
  });

  it('filtra o Dashboard para um grupo específico ao selecionar no dropdown', () => {
    renderDashboard();
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '111@g.us' } });

    // Próximos disparos deve mostrar apenas o disparo do Grupo Alfa 001
    expect(screen.getByText('Mensagem Alfa')).toBeInTheDocument();
    expect(screen.queryByText('Mensagem Beta')).not.toBeInTheDocument();
  });

  it('renderiza os dias do Ciclo Atual em linhas compactas e permite expandir os grupos do dia', () => {
    renderDashboard();
    expect(screen.getByText('DIA 1')).toBeInTheDocument();
    expect(screen.getByText('DIA 2')).toBeInTheDocument();

    // Clica no botão para expandir os grupos do DIA 1
    const verGruposBtns = screen.getAllByText('Ver Grupos');
    fireEvent.click(verGruposBtns[0]);

    expect(screen.getByText('Grupo Alfa 001')).toBeInTheDocument();
  });
});

