import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ImportMessagesModal from '../pages/Scheduling/components/ImportMessagesModal';
import AITextInput from '../pages/Scheduling/components/AITextInput';
import AIPreviewList from '../pages/Scheduling/components/AIPreviewList';
import axiosInstance from '../services/api';

describe('ImportMessagesModal - Abas, Maximização e Fluxo IA', () => {
  const gruposMock = [
    { id: 'g1', nome: 'Grupo Alfa' },
    { id: 'g2', nome: 'Grupo Beta' }
  ];

  it('renderiza o modal aberto com abas de Arquivo JSON e Colar Texto com IA', () => {
    render(
      <ImportMessagesModal
        isOpen={true}
        onClose={vi.fn()}
        onImportSuccess={vi.fn()}
        grupos={gruposMock}
      />
    );

    expect(screen.getByText('Importar Roteiro de Mensagens')).toBeInTheDocument();
    expect(screen.getByText('Arquivo JSON')).toBeInTheDocument();
    expect(screen.getByText('Colar Texto com IA')).toBeInTheDocument();
  });

  it('permite alternar para a aba de Colar Texto com IA e renderiza botão de upload de PDF/DOCX', () => {
    render(
      <ImportMessagesModal
        isOpen={true}
        onClose={vi.fn()}
        onImportSuccess={vi.fn()}
        grupos={gruposMock}
      />
    );

    const abaIA = screen.getByText('Colar Texto com IA');
    fireEvent.click(abaIA);

    expect(screen.getByText(/Importar de Arquivo \(PDF, Word DOCX ou TXT\)/i)).toBeInTheDocument();
    expect(screen.getByText('Carregar PDF / DOCX')).toBeInTheDocument();
    expect(screen.getByText('Grupo Alfa')).toBeInTheDocument();
    expect(screen.getByText('Grupo Beta')).toBeInTheDocument();

    const btnProcessar = screen.getByRole('button', { name: /Processar Roteiro com IA/i });
    expect(btnProcessar).toBeInTheDocument();
  });

  it('permite alternar entre estado normal e maximizado pelo botão do cabeçalho', () => {
    render(
      <ImportMessagesModal
        isOpen={true}
        onClose={vi.fn()}
        onImportSuccess={vi.fn()}
        grupos={gruposMock}
      />
    );

    // Botão de maximizar
    const btnMaximizar = screen.getByTitle('Maximizar popup');
    expect(btnMaximizar).toBeInTheDocument();

    // Clica para maximizar
    fireEvent.click(btnMaximizar);

    // Agora o título muda para restaurar tamanho
    expect(screen.getByTitle('Restaurar tamanho normal')).toBeInTheDocument();

    // Clica novamente para restaurar
    fireEvent.click(screen.getByTitle('Restaurar tamanho normal'));
    expect(screen.getByTitle('Maximizar popup')).toBeInTheDocument();
  });
});

describe('AITextInput Component - Upload de Arquivo', () => {
  it('permite selecionar arquivo PDF/DOCX e preenche o textarea com o texto retornado pela API', async () => {
    const setRawTextMock = vi.fn();
    const setSelectedGroupIdsMock = vi.fn();

    vi.spyOn(axiosInstance, 'post').mockResolvedValueOnce({
      data: { texto: 'Dia 1 às 09:00 - Texto extraído do arquivo PDF!' }
    });

    render(
      <AITextInput
        rawText=""
        setRawText={setRawTextMock}
        selectedGroupIds={[]}
        setSelectedGroupIds={setSelectedGroupIdsMock}
        grupos={[{ id: '1', nome: 'Grupo VIP' }]}
        onProcess={vi.fn()}
        processing={false}
        error=""
        isMaximized={false}
      />
    );

    const file = new File(['conteudo fake pdf'], 'roteiro_lancamento.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/mensagens/extrair-texto-arquivo',
        expect.any(FormData),
        expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } })
      );
      expect(setRawTextMock).toHaveBeenCalledWith('Dia 1 às 09:00 - Texto extraído do arquivo PDF!');
    });
  });
});

describe('AIPreviewList Component', () => {
  it('renderiza lista de mensagens interpretadas e permite editar e remover', () => {
    const onConfirm = vi.fn();
    const onBack = vi.fn();
    const setMessages = vi.fn();

    const messagesMock = [
      {
        numero_da_mensagem: 1,
        dia_do_lancamento: 1,
        horario_do_disparo: '10:00',
        tipo_de_mensagem: 'texto',
        mensagem: 'Primeira mensagem interpretada',
        link_midia: '',
        opcoes_enquete: []
      },
      {
        numero_da_mensagem: 2,
        dia_do_lancamento: 2,
        horario_do_disparo: '15:00',
        tipo_de_mensagem: 'imagem',
        mensagem: 'Segunda mensagem com imagem',
        link_midia: 'https://exemplo.com/foto.jpg',
        opcoes_enquete: []
      }
    ];

    render(
      <AIPreviewList
        messages={messagesMock}
        setMessages={setMessages}
        onConfirm={onConfirm}
        onBack={onBack}
        loading={false}
        isMaximized={true}
      />
    );

    expect(screen.getByText(/2 mensagem\(ns\) pronta\(s\) para revisão/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Primeira mensagem interpretada')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Segunda mensagem com imagem')).toBeInTheDocument();

    // Botão de voltar
    const btnVoltar = screen.getByText(/Voltar ao texto/i);
    fireEvent.click(btnVoltar);
    expect(onBack).toHaveBeenCalled();

    // Botão de confirmar
    const btnConfirmar = screen.getByRole('button', { name: /Confirmar e Importar 2 Mensagem\(ns\)/i });
    fireEvent.click(btnConfirmar);
    expect(onConfirm).toHaveBeenCalled();
  });

  it('abre popup de confirmação ao clicar na lixeira e só remove após confirmar', () => {
    const onConfirm = vi.fn();
    const onBack = vi.fn();
    const setMessages = vi.fn();

    const messagesMock = [
      {
        numero_da_mensagem: 1,
        dia_do_lancamento: 1,
        horario_do_disparo: '10:00',
        tipo_de_mensagem: 'texto',
        mensagem: 'Primeira mensagem interpretada',
      }
    ];

    render(
      <AIPreviewList
        messages={messagesMock}
        setMessages={setMessages}
        onConfirm={onConfirm}
        onBack={onBack}
        loading={false}
      />
    );

    // Clica no botão da lixeira
    const btnLixeira = screen.getByTestId('delete-msg-btn-0');
    fireEvent.click(btnLixeira);

    // Deve abrir o popup de confirmação
    expect(screen.getByText('Excluir Mensagem')).toBeInTheDocument();
    expect(screen.getByText(/Tem certeza que deseja remover esta mensagem da lista de importação/i)).toBeInTheDocument();

    // Clica em Cancelar
    const btnCancelar = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(btnCancelar);

    // O modal deve fechar e setMessages NÃO deve ser chamado
    expect(screen.queryByText('Excluir Mensagem')).not.toBeInTheDocument();
    expect(setMessages).not.toHaveBeenCalled();

    // Clica na lixeira novamente
    fireEvent.click(btnLixeira);
    expect(screen.getByText('Excluir Mensagem')).toBeInTheDocument();

    // Clica em Excluir Agora
    const btnExcluirAgora = screen.getByRole('button', { name: /Excluir Agora/i });
    fireEvent.click(btnExcluirAgora);

    // Agora sim setMessages deve ser chamado removendo o item
    expect(setMessages).toHaveBeenCalledWith([]);
  });
});
