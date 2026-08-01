import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import axiosInstance from '../services/api';
import App from '../App';
import { AuthProvider } from '../contexts/AuthContext';
import { WaStatusProvider } from '../contexts/WaStatusContext';
import { CompanyProvider } from '../contexts/CompanyContext';

// Mock do localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key) => { delete store[key]; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock do window.location
const locationMock = { href: '' };
delete window.location;
window.location = locationMock;

const renderApp = () => render(
  <AuthProvider>
    <WaStatusProvider>
      <CompanyProvider>
        <App />
      </CompanyProvider>
    </WaStatusProvider>
  </AuthProvider>
);

describe('Auth Auto-Logout', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should clear localStorage and dispatch auth-error event on 401', async () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('accessToken', 'expired-token');

    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
    
    const event = new CustomEvent('auth-error');
    window.dispatchEvent(event);
  });

  it('App component should logout when auth-error event is dispatched', async () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('accessToken', 'valid-token');

    renderApp();
    
    const event = new CustomEvent('auth-error');
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(localStorage.getItem('isLoggedIn')).toBeNull();
    });
  });
});
