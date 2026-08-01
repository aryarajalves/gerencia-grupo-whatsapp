import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MessagesModal from '../pages/Groups/components/MessagesModal';

describe('MessagesModal', () => {
  it('renderiza o modal de vincular mensagens sem erro de XCircle', () => {
    const grupo = {
      id: 'g-test-modal',
      nome: 'Grupo Lançamento Teste',
      dia_inicio_semana: 4,
      dia_fim_semana: 6
    };
    const mensagens = [
      {
        id: 'msg-1',
        mensagem: 'Olá grupo',
        dia_do_lancamento: 1,
        horario_do_disparo: '10:00:00',
        tipo_de_mensagem: 'texto',
        grupo_ids: ['g-test-modal']
      }
    ];

    render(
      <MessagesModal 
        grupo={grupo}
        mensagens={mensagens}
        mensagensAssociadas={[]}
        toggleMensagem={vi.fn()}
        onSave={vi.fn()}
        onClose={vi.fn()}
        loading={false}
        saving={false}
      />
    );

    expect(screen.getByText('Mensagens do Grupo')).toBeInTheDocument();
    expect(screen.getByText('Grupo Lançamento Teste')).toBeInTheDocument();
  });
});
