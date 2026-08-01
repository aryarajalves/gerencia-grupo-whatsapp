import { describe, it, expect, vi } from 'vitest';
import { toastDeletado } from '../utils/toastNotifications';
import { toast } from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  toast: {
    custom: vi.fn(),
    dismiss: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('ToastNotifications - toastDeletado', () => {
  it('dispara toast.custom com parâmetros padrão', () => {
    toastDeletado('Grupo Excluído com Sucesso!', 'O grupo "Grupo Teste" foi removido.');
    expect(toast.custom).toHaveBeenCalled();
  });
});
