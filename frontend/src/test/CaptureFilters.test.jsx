import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import CapturaMensagens from '../pages/Capture';
import { AuthProvider } from '../contexts/AuthContext';
import { WaStatusProvider } from '../contexts/WaStatusContext';
import { CompanyProvider } from '../contexts/CompanyContext';

vi.mock('../services/api', () => ({
  API_BASE: 'http://localhost:8000',
  default: {
    get: vi.fn((url) => {
      if (url === '/captura/webhook-url') return Promise.resolve({ data: { url: 'http://localhost:8000/webhook' } });
      if (url === '/grupos/') return Promise.resolve({ data: [{ id: '1', nome: 'Grupo Lançamento', id_do_grupo: '123@g.us' }] });
      if (url === '/captura/mensagens/') return Promise.resolve({ 
        data: { 
          items: [{
            id: 1,
            group_name: 'Grupo Lançamento',
            group_jid: '123@g.us',
            sender_name: 'João',
            sender_number: '5511999999999',
            message_content: 'Documento recebido',
            media_url: 'http://example.com/arquivo.pdf',
            media_type: 'document',
            timestamp: new Date().toISOString()
          }], 
          total: 1 
        } 
      });
      return Promise.resolve({ data: {} });
    }),
    delete: vi.fn(() => Promise.resolve({ data: {} }))
  }
}));

describe('CapturaMensagens - Abas e Filtros', () => {
  it('renderiza as abas, os filtros e a mensagem com anexo de documento', async () => {
    render(
      <AuthProvider>
        <WaStatusProvider>
          <CompanyProvider>
            <CapturaMensagens openConfirm={vi.fn()} />
          </CompanyProvider>
        </WaStatusProvider>
      </AuthProvider>
    );

    // Verifica abas
    const abaMensagens = screen.getByRole('button', { name: /Mensagens Capturadas/i });
    const abaWebhook = screen.getByRole('button', { name: /Configurar Webhook/i });
    expect(abaMensagens).toBeInTheDocument();
    expect(abaWebhook).toBeInTheDocument();

    // Verifica filtros
    expect(await screen.findByPlaceholderText(/Buscar no conteúdo ou remetente/i)).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: 'Grupo Lançamento' })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: 'Todas as Origens' })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: 'Disparo Automático (Sistema)' })).toBeInTheDocument();

    // Verifica renderização do documento com anexo
    expect(await screen.findByText(/Ver Anexo \/ Documento/i)).toBeInTheDocument();

    // Testa troca de aba
    fireEvent.click(abaWebhook);
    expect(screen.getByText(/Sua URL de Webhook/i)).toBeInTheDocument();
  });
});
