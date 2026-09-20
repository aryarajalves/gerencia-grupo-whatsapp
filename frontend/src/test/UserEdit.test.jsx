import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import UserTable from '../pages/Users/components/UserTable';
import UserModal from '../pages/Users/components/UserModal';

describe('UserTable Component', () => {
  it('renders "Sistema" for Super Admin and does not render edit/delete buttons', () => {
    const users = [
      { id: '1', nome: 'Super Administrador', email: 'admin@sistema.com', cargo: 'SUPER_ADMIN', ativo: true, isFixed: true }
    ];

    render(
      <UserTable 
        filteredUsers={users}
        startEditUser={vi.fn()}
        startResetPassword={vi.fn()}
        toggleStatus={vi.fn()}
        handleDeleteUser={vi.fn()}
      />
    );

    expect(screen.getByText('Super Administrador')).toBeInTheDocument();
    expect(screen.getByText('Diretor / CEO')).toBeInTheDocument();
    expect(screen.getByText('Sistema')).toBeInTheDocument();
    expect(screen.queryByTitle('Editar Usuário')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Remover')).not.toBeInTheDocument();
  });

  it('renders "Editar Usuário" pencil button for regular admin users', () => {
    const onEdit = vi.fn();
    const users = [
      { id: '2', nome: 'Hokage', email: 'hokage@empresa.com', cargo: 'ADMIN', ativo: true, isFixed: false }
    ];

    render(
      <UserTable 
        filteredUsers={users}
        startEditUser={onEdit}
        startResetPassword={vi.fn()}
        toggleStatus={vi.fn()}
        handleDeleteUser={vi.fn()}
      />
    );

    expect(screen.getByText('Hokage')).toBeInTheDocument();
    const editBtn = screen.getByTitle('Editar Usuário');
    expect(editBtn).toBeInTheDocument();

    fireEvent.click(editBtn);
    expect(onEdit).toHaveBeenCalledWith(users[0]);
  });
});

describe('UserModal Component', () => {
  it('renders edit modal with prefilled data and triggers save', () => {
    const onSave = vi.fn((e) => e.preventDefault());
    const editUser = {
      id: '2',
      nome: 'Hokage',
      email: 'hokage@empresa.com',
      cargo: 'ADMIN',
      password: ''
    };

    render(
      <UserModal 
        showModal={true}
        setShowModal={vi.fn()}
        editUser={editUser}
        setEditUser={vi.fn()}
        handleSaveUser={onSave}
      />
    );

    expect(screen.getByText('Editar Usuário')).toBeInTheDocument();
    expect(screen.getByText('Atualize o perfil do colaborador.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Hokage')).toBeInTheDocument();
    expect(screen.getByDisplayValue('hokage@empresa.com')).toBeInTheDocument();

    // Garante que campos de senha não aparecem no modal de edição
    expect(screen.queryByText(/Nova Senha/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Gerar Senha/i)).not.toBeInTheDocument();

    const submitBtn = screen.getByText('Salvar Alterações');
    fireEvent.click(submitBtn);
    expect(onSave).toHaveBeenCalled();
  });
});
