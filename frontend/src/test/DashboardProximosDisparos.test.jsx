import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DashboardProximosDisparos from '../components/Dashboard/DashboardProximosDisparos';

describe('DashboardProximosDisparos Component', () => {
  it('renderiza empty state quando a lista de disparos está vazia', () => {
    render(<DashboardProximosDisparos disparos={[]} />);
    expect(screen.getByText('Próximos Disparos de Hoje')).toBeInTheDocument();
    expect(screen.getByText('Sem disparos agendados para este filtro.')).toBeInTheDocument();
  });

  it('renderiza todas as mensagens sem corte quando houver mais de 5 mensagens', () => {
    const disparosMock = [
      { horario: '20:00', grupo: 'Grupo Alpha', mensagem: 'Mensagem 1', tipo: 'texto', etiqueta: 'AQUECIMENTO', link_convite: 'https://chat.whatsapp.com/alpha' },
      { horario: '20:05', grupo: 'Grupo Beta', mensagem: 'Mensagem 2', tipo: 'imagem' },
      { horario: '20:10', grupo: 'Grupo Alpha', mensagem: 'Mensagem 3', tipo: 'texto' },
      { horario: '20:15', grupo: 'Grupo Gamma', mensagem: 'Mensagem 4', tipo: 'enquete' },
      { horario: '20:20', grupo: 'Grupo Alpha', mensagem: 'Mensagem 5', tipo: 'video' },
      { horario: '20:25', grupo: 'Grupo Beta', mensagem: 'Mensagem 6', tipo: 'audio' },
      { horario: '20:30', grupo: 'Grupo Gamma', mensagem: 'Mensagem 7', tipo: 'arquivo' },
      { horario: '20:35', grupo: 'Grupo Alpha', mensagem: 'Mensagem 8', tipo: 'texto' }
    ];

    render(<DashboardProximosDisparos disparos={disparosMock} />);

    // Deve exibir o badge de 8 agendados
    expect(screen.getByText('8 agendado(s)')).toBeInTheDocument();

    // Deve exibir o destaque de Próximo para o primeiro item
    expect(screen.getByText('Próximo')).toBeInTheDocument();

    // Deve renderizar a etiqueta se existir
    expect(screen.getByText('AQUECIMENTO')).toBeInTheDocument();

    // Todas as 8 mensagens devem estar no DOM
    expect(screen.getByText('Mensagem 1')).toBeInTheDocument();
    expect(screen.getByText('Mensagem 2')).toBeInTheDocument();
    expect(screen.getByText('Mensagem 3')).toBeInTheDocument();
    expect(screen.getByText('Mensagem 4')).toBeInTheDocument();
    expect(screen.getByText('Mensagem 5')).toBeInTheDocument();
    expect(screen.getByText('Mensagem 6')).toBeInTheDocument();
    expect(screen.getByText('Mensagem 7')).toBeInTheDocument();
    expect(screen.getByText('Mensagem 8')).toBeInTheDocument();

    // Rodapé deve indicar 8 mensagens
    expect(screen.getByText('8 mensagens')).toBeInTheDocument();
  });

  it('permite filtrar mensagens em tempo real pelo campo de busca', () => {
    const disparosMock = [
      { horario: '20:00', grupo: 'Grupo Alpha', mensagem: 'Começou a aula ao vivo!', tipo: 'texto' },
      { horario: '20:05', grupo: 'Grupo Beta', mensagem: 'Link dos slides em anexo', tipo: 'arquivo' },
      { horario: '20:10', grupo: 'Grupo Gamma', mensagem: 'Votação aberta na enquete', tipo: 'enquete' },
      { horario: '20:15', grupo: 'Grupo Delta', mensagem: 'Última chamada da aula', tipo: 'texto' }
    ];

    render(<DashboardProximosDisparos disparos={disparosMock} />);

    const inputBusca = screen.getByPlaceholderText('Buscar mensagem...');
    expect(inputBusca).toBeInTheDocument();

    // Digita 'slides' no campo de busca
    fireEvent.change(inputBusca, { target: { value: 'slides' } });

    // Apenas a mensagem filtrada deve permanecer visível
    expect(screen.getByText('Link dos slides em anexo')).toBeInTheDocument();
    expect(screen.queryByText('Começou a aula ao vivo!')).not.toBeInTheDocument();
    expect(screen.getByText('1 de 4')).toBeInTheDocument();
  });
});
