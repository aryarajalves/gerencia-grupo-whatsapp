import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import React from 'react';
import axios from 'axios';
import { AuthProvider } from '../contexts/AuthContext';
import { WaStatusProvider } from '../contexts/WaStatusContext';
import { CompanyProvider } from '../contexts/CompanyContext';

const renderApp = () => render(
  <AuthProvider>
    <WaStatusProvider>
      <CompanyProvider>
        <App />
      </CompanyProvider>
    </WaStatusProvider>
  </AuthProvider>
);

describe('Funnel Visualization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify({ nome: 'Admin', cargo: 'SUPER_ADMIN' }));
  });

  it('should toggle between funnel and list view in the messages modal', async () => {
    // Mock groups response
    axios.get.mockImplementation((url) => {
      if (url.includes('/grupos/')) {
        return Promise.resolve({ data: [{ id: '1', nome: 'Grupo Teste', id_do_grupo: '123@g.us', dia_inicio_semana: 0, dia_fim_semana: 4, ativo: true }] });
      }
      if (url.includes('/mensagens/')) {
        return Promise.resolve({ data: { items: [{ id: 'msg1', mensagem: 'Ola', dia_do_lancamento: 1, horario_do_disparo: '10:00:00', tipo_de_mensagem: 'texto' }], total: 1 } });
      }
      if (url.includes('/wapi/grupos/')) {
         return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    renderApp();

    // Go to Grupos tab
    const gruposTab = screen.getAllByText(/Grupos/i)[0];
    fireEvent.click(gruposTab);

    // Wait for group to appear and click "Mensagens do grupo" (ListChecks icon button)
    // The button has a title "Mensagens do grupo"
    await waitFor(() => expect(screen.getByText('Grupo Teste')).toBeInTheDocument());
    
    // Find the button by its title which we set in App.jsx
    const msgBtn = screen.getByTitle('Mensagens do grupo');
    fireEvent.click(msgBtn);

    // Now modal should be open. Default mode is Funnel.
    // Check if "Funil" button is active (it has 'active' class but we can check if it's there)
    expect(screen.getByText('Funil')).toBeInTheDocument();
    expect(screen.getByText('Lista')).toBeInTheDocument();

    // Check if funnel node for Dia 01 is present
    expect(screen.getByText('Dia 01')).toBeInTheDocument();

    // Switch to List view
    fireEvent.click(screen.getByText('Lista'));
    
    // In list view, "Todos" button should be present
    expect(screen.getByText(/Todos/i)).toBeInTheDocument();
    
    // Switch back to Funnel
    fireEvent.click(screen.getByText('Funil'));
    expect(screen.getByText('Dia 01')).toBeInTheDocument();
  });
});
