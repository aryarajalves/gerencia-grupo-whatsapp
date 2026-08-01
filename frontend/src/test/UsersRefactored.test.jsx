import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import Users from '../pages/Users';
import { useUsers } from '../pages/Users/hooks/useUsers';

// Mock the custom hook
vi.mock('../pages/Users/hooks/useUsers', () => ({
  useUsers: vi.fn()
}));

test('renders Users component with user list', () => {
  // Setup mock return value
  useUsers.mockReturnValue({
    searchTerm: '',
    setSearchTerm: vi.fn(),
    cargoFilter: '',
    setCargoFilter: vi.fn(),
    showModal: false,
    setShowModal: vi.fn(),
    newUser: { id: null, nome: '', email: '', password: '', cargo: 'USER' },
    setNewUser: vi.fn(),
    showPass: false,
    setShowPass: vi.fn(),
    toast: { show: false, message: '', type: 'info' },
    filteredUsers: [
      { id: 1, nome: 'João Teste', email: 'joao@teste.com', cargo: 'ADMIN', ativo: true }
    ],
    handleSaveUser: vi.fn(),
    handleDeleteUser: vi.fn(),
    toggleStatus: vi.fn(),
    startEditUser: vi.fn()
  });

  render(<Users openConfirm={vi.fn()} />);
  
  expect(screen.getByText(/João Teste/i)).toBeDefined();
  expect(screen.getByText(/joao@teste.com/i)).toBeDefined();
  expect(screen.getByText(/Gestão de Usuários/i)).toBeDefined();
});

test('renders empty state when no users found', () => {
  useUsers.mockReturnValue({
    searchTerm: 'inexistente',
    setSearchTerm: vi.fn(),
    cargoFilter: '',
    setCargoFilter: vi.fn(),
    showModal: false,
    setShowModal: vi.fn(),
    newUser: { id: null, nome: '', email: '', password: '', cargo: 'USER' },
    setNewUser: vi.fn(),
    showPass: false,
    setShowPass: vi.fn(),
    toast: { show: false, message: '', type: 'info' },
    filteredUsers: [],
    handleSaveUser: vi.fn(),
    handleDeleteUser: vi.fn(),
    toggleStatus: vi.fn(),
    startEditUser: vi.fn()
  });

  render(<Users openConfirm={vi.fn()} />);
  
  expect(screen.getByText(/Nenhum usuário encontrado com os filtros atuais/i)).toBeDefined();
});
