import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Configuracoes from '../pages/Settings';
import axiosInstance from '../services/api';

// Mock axios
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('Configuracoes Identity Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axiosInstance.get.mockResolvedValue({ data: { COMPANY_NAME: 'Zap Group', COMPANY_LOGO: '' } });
  });

  it('should render identity fields', async () => {
    render(<Configuracoes />);
    
    await waitFor(() => {
      expect(screen.getByText(/Identidade da Empresa/i)).toBeDefined();
      expect(screen.getByPlaceholderText(/Ex: Zap Group/i)).toBeDefined();
      expect(screen.getByText(/Fazer Upload da Logo/i)).toBeDefined();
    });
  });

  it('should update company name state on input', async () => {
    render(<Configuracoes />);
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/Ex: Zap Group/i);
      fireEvent.change(input, { target: { value: 'Nova Empresa' } });
      expect(input.value).toBe('Nova Empresa');
    });
  });

  it('should call upload endpoint when file is selected', async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { url: 'https://new-logo.png' } });
    
    const { container } = render(<Configuracoes />);
    
    await waitFor(async () => {
      const file = new File(['hello'], 'hello.png', { type: 'image/png' });
      const fileInput = container.querySelector('input[type="file"]');
      
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/upload/', expect.any(FormData), expect.any(Object));
    });
  });
});
