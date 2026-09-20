import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React, { useState } from 'react';
import GroupForm from '../pages/Groups/components/GroupForm';
import PollTab from '../pages/Groups/components/tabs/PollTab';

describe('GroupForm & PollTab - Webhook de Enquetes', () => {
  it('renderiza a aba de Webhook de Enquetes no GroupForm e navega até ela', () => {
    const ComponentWrapper = () => {
      const [novoGrupo, setNovoGrupo] = useState({
        nome: 'Grupo Teste Enquete',
        id_do_grupo: '12345@g.us',
        webhook_enquete_ativo: false,
        webhook_enquete_url: ''
      });

      return (
        <GroupForm 
          novoGrupo={novoGrupo}
          setNovoGrupo={setNovoGrupo}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
          editingId="123"
          processing={false}
          wapiGrupos={[]}
          wapiLoading={false}
          wapiErro=""
        />
      );
    };

    render(<ComponentWrapper />);

    // Localiza botão da aba Webhook de Enquetes
    const abaEnquete = screen.getByRole('button', { name: /Webhook de Enquetes/i });
    expect(abaEnquete).toBeInTheDocument();

    // Clica na aba
    fireEvent.click(abaEnquete);

    // Verifica conteúdo renderizado
    expect(screen.getByText(/Automação de Webhook para Enquetes/i)).toBeInTheDocument();
    expect(screen.getByText(/Habilitada/i)).toBeInTheDocument();
    expect(screen.getByText(/Desabilitada/i)).toBeInTheDocument();
  });

  it('permite habilitar a automação e preencher a URL do webhook', () => {
    const Wrapper = () => {
      const [novoGrupo, setNovoGrupo] = useState({
        webhook_enquete_ativo: false,
        webhook_enquete_url: ''
      });
      return <PollTab novoGrupo={novoGrupo} setNovoGrupo={setNovoGrupo} />;
    };

    render(<Wrapper />);

    // Clica em Habilitada
    const radioHabilitada = screen.getByLabelText(/Habilitada/i);
    fireEvent.click(radioHabilitada);
    expect(radioHabilitada).toBeChecked();

    // Campo de input de URL deve aparecer
    const inputUrl = screen.getByPlaceholderText(/https:\/\/sua-api.com\/webhook\/enquetes/i);
    expect(inputUrl).toBeInTheDocument();

    // Digita a URL
    fireEvent.change(inputUrl, { target: { value: 'https://webhook.site/teste-enquetes' } });
    expect(inputUrl.value).toBe('https://webhook.site/teste-enquetes');

    // Valida textos informativos do card
    expect(screen.getByText(/Quais dados são enviados para o seu Webhook\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Conteúdo & Pergunta/i)).toBeInTheDocument();
    expect(screen.getByText(/Opção Selecionada/i)).toBeInTheDocument();
    expect(screen.getByText(/Nome do Usuário/i)).toBeInTheDocument();
    expect(screen.getByText(/Número de WhatsApp/i)).toBeInTheDocument();

    // Valida seletor de delay
    const selectDelay = screen.getByRole('combobox');
    expect(selectDelay).toBeInTheDocument();
    fireEvent.change(selectDelay, { target: { value: '60' } });
    expect(selectDelay.value).toBe('60');
    expect(screen.getByText(/apenas a/i)).toBeInTheDocument();
  });
});
