import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';
import React from 'react';



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

describe('App Component', () => {
  it('renders without crashing and shows the sidebar', () => {
    localStorage.setItem('isLoggedIn', 'true');
    renderApp();
    expect(screen.getByText(/Zap Group/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Grupos/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Mensagens/i).length).toBeGreaterThan(0);
  });

  it('navigates through sidebar tabs', async () => {
    localStorage.setItem('isLoggedIn', 'true');
    renderApp();
    
    // Default tab should be Dashboard
    expect(screen.getByText(/Taxa/i)).toBeInTheDocument();

    // Click on Grupos
    const gruposTab = screen.getAllByText(/Grupos/i)[0]; // Sidebar item
    fireEvent.click(gruposTab);
    expect(await screen.findByRole('heading', { name: /Gerenciamento de Grupos/i })).toBeInTheDocument();

    // Click on Mensagens
    const mensagensTab = screen.getAllByText(/Mensagens/i)[0]; // Sidebar item
    fireEvent.click(mensagensTab);
    expect(await screen.findByText(/Modelos de Mensagens/i)).toBeInTheDocument();
  });
});
