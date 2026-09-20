import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import React from 'react';
import Users from '../pages/Users';
import { useUsers } from '../pages/Users/hooks/useUsers';

// Mock the custom hook
vi.mock('../pages/Users/hooks/useUsers', () => ({
  useUsers: vi.fn()
}));

test('renders Users component with user list', () => {
  useUsers.mockReturnValue({
    invites: [],
    activeTab: 'usuarios',
    setActiveTab: vi.fn(),
    searchTerm: '',
    setSearchTerm: vi.fn(),
    cargoFilter: '',
    setCargoFilter: vi.fn(),
    showInviteModal: false,
    setShowInviteModal: vi.fn(),
    showResetModal: false,
    setShowResetModal: vi.fn(),
    showEditModal: false,
    setShowEditModal: vi.fn(),
    selectedUser: null,
    editUser: { id: null, nome: '', email: '', cargo: 'ADMIN', password: '' },
    setEditUser: vi.fn(),
    submittingEdit: false,
    toast: { show: false, message: '', type: 'info' },
    filteredUsers: [
      { id: '1', nome: 'João Teste', email: 'joao@teste.com', cargo: 'ADMIN', ativo: true, isFixed: false }
    ],
    currentPage: 1,
    setCurrentPage: vi.fn(),
    itemsPerPage: 10,
    setItemsPerPage: vi.fn(),
    handleDeleteUser: vi.fn(),
    handleDeleteInvite: vi.fn(),
    toggleStatus: vi.fn(),
    startResetPassword: vi.fn(),
    startEditUser: vi.fn(),
    handleUpdateUser: vi.fn(),
    refreshInvites: vi.fn()
  });

  render(<Users openConfirm={vi.fn()} />);
  
  expect(screen.getByText(/João Teste/i)).toBeDefined();
  expect(screen.getByText(/joao@teste.com/i)).toBeDefined();
  expect(screen.getByText(/Gestão de Usuários/i)).toBeDefined();
});

test('renders empty state when no users found', () => {
  useUsers.mockReturnValue({
    invites: [],
    activeTab: 'usuarios',
    setActiveTab: vi.fn(),
    searchTerm: 'inexistente',
    setSearchTerm: vi.fn(),
    cargoFilter: '',
    setCargoFilter: vi.fn(),
    showInviteModal: false,
    setShowInviteModal: vi.fn(),
    showResetModal: false,
    setShowResetModal: vi.fn(),
    showEditModal: false,
    setShowEditModal: vi.fn(),
    selectedUser: null,
    editUser: { id: null, nome: '', email: '', cargo: 'ADMIN', password: '' },
    setEditUser: vi.fn(),
    submittingEdit: false,
    toast: { show: false, message: '', type: 'info' },
    filteredUsers: [],
    currentPage: 1,
    setCurrentPage: vi.fn(),
    itemsPerPage: 10,
    setItemsPerPage: vi.fn(),
    handleDeleteUser: vi.fn(),
    handleDeleteInvite: vi.fn(),
    toggleStatus: vi.fn(),
    startResetPassword: vi.fn(),
    startEditUser: vi.fn(),
    handleUpdateUser: vi.fn(),
    refreshInvites: vi.fn()
  });

  render(<Users openConfirm={vi.fn()} />);
  expect(screen.getByText(/Nenhum usuário encontrado/i)).toBeDefined();
});
