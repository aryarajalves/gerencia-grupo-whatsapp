import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScheduling } from '../hooks/useScheduling';
import axiosInstance from '../services/api';
import { toast } from 'react-hot-toast';

vi.mock('../contexts/WaStatusContext', () => ({
  useWaStatus: () => ({ waStatus: { status: 'conectado', plan_type: 'PRO' } }),
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
  default: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  }
}));

describe('useScheduling - Bulk Delete & Error Sanitization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('executa exclusão em lote com sucesso chamando delete /mensagens/bulk', async () => {
    axiosInstance.delete.mockResolvedValueOnce({ data: { message: '2 mensagens deletadas com sucesso' } });
    const onRefresh = vi.fn();
    const onSuccess = vi.fn();
    const openConfirm = vi.fn((title, msg, onConfirm) => onConfirm());

    const { result } = renderHook(() => useScheduling(onRefresh));

    await act(async () => {
      await result.current.handleBulkDelete(['id-1', 'id-2'], openConfirm, onSuccess);
    });

    expect(axiosInstance.delete).toHaveBeenCalledWith('/mensagens/bulk', { data: { ids: ['id-1', 'id-2'] } });
    expect(onSuccess).toHaveBeenCalled();
    expect(onRefresh).toHaveBeenCalled();
  });

  it('não quebra a aplicação quando a API retorna erro em formato de array de validação (ex: 422)', async () => {
    const validationError = {
      response: {
        status: 422,
        data: {
          detail: [
            { type: 'uuid_parsing', loc: ['path', 'mensagem_id'], msg: 'Input should be a valid UUID', input: 'bulk' }
          ]
        }
      }
    };
    axiosInstance.delete.mockRejectedValueOnce(validationError);
    axiosInstance.post.mockRejectedValueOnce(validationError);

    const onRefresh = vi.fn();
    const openConfirm = vi.fn((title, msg, onConfirm) => onConfirm());

    const { result } = renderHook(() => useScheduling(onRefresh));

    await act(async () => {
      await result.current.handleBulkDelete(['id-1'], openConfirm);
    });

    expect(toast.error).toHaveBeenCalled();
    const errorMessageArg = toast.error.mock.calls[0][0];
    expect(typeof errorMessageArg).toBe('string');
    expect(errorMessageArg).toContain('Input should be a valid UUID');
  });
});
