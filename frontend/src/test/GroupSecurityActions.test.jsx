import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import GroupForm from '../pages/Groups/components/GroupForm';

describe('GroupForm - Aba de Segurança e Ações de Invasor', () => {
  const defaultNovoGrupo = {
    nome: 'Grupo Teste',
    id_do_grupo: '120363000000000000@g.us',
    dia_inicio_semana: 0,
    dia_fim_semana: 4,
    tipo_ciclo: 'semanal',
    extrair_contatos: true,
    intervalo_extracao_minutos: 30,
    tempo_digitando_segundos: 0,
    adms_permitidos: '558596123586',
    seguranca_adms_ativa: true,
    remover_impostor_msg: true,
    msg_remocao_impostor: ''
  };

  it('deve renderizar as opções de remoção e template de mensagem na aba de segurança', () => {
    render(
      <GroupForm
        novoGrupo={defaultNovoGrupo}
        setNovoGrupo={vi.fn()}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        editingId="123"
        processing={false}
        wapiGrupos={[]}
        wapiLoading={false}
      />
    );

    // Clica na aba Segurança de Admins
    const tabSeguranca = screen.getByText(/Segurança de Admins/i);
    fireEvent.click(tabSeguranca);

    // Valida textos das ações
    expect(screen.getByText(/Ação para Mensagens de Não-Admins em Grupo Fechado/i)).toBeInTheDocument();
    expect(screen.getByText(/Remover e Alertar no Grupo/i)).toBeInTheDocument();
    expect(screen.getByText(/Apenas Alertar no Grupo/i)).toBeInTheDocument();
    expect(screen.getByText(/Mensagem Pré-Pronta de Aviso no Grupo/i)).toBeInTheDocument();
  });
});
