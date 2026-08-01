import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';
window.scrollTo = vi.fn();

// Mock lucide-react com Proxy de fallback
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal();
  const DummyIcon = (props) => React.createElement('span', props);
  return new Proxy({ ...actual }, {
    get: (target, prop) => {
      if (prop in target) return target[prop];
      return DummyIcon;
    }
  });
});

// Mock axios globally
vi.mock('axios', () => ({
  default: {
    get: vi.fn((url) => {
      if (url.includes('/logs/') || (url.includes('/mensagens/') && !url.includes('/capturadas/'))) {
        return Promise.resolve({ data: { items: [], total: 0, total_sucesso: 0, total_erro: 0, total_geral: 0 } });
      }
      if (url.includes('/mensagens/capturadas/')) {
        return Promise.resolve({ data: { items: [] } });
      }
      if (url.includes('/dashboard/stats')) {
        return Promise.resolve({ data: { 
          total_grupos_ativos: 0, total_grupos_encerrados: 0, total_mensagens: 0, 
          disparos_hoje: 0, taxa_sucesso: 100, ultimo_disparo: null, proximos_disparos: [], grupos_por_dia: [] 
        } });
      }
      if (url.includes('/config/')) {
        return Promise.resolve({ data: {} });
      }
      return Promise.resolve({ data: [] });
    }),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
    patch: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
    create: vi.fn(function() { return this; }),
    defaults: { headers: { common: {} } },
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  },
}));
