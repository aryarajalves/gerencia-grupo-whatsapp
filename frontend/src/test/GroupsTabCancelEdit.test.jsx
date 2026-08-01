import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GerenciarGrupos from '../pages/Groups/index';

// Mock do hook useGroups
vi.mock('../hooks/useGroups', () => ({
  useGroups: () => ({
    activeSubTab: 'form',
    setActiveSubTab: vi.fn(),
    novoGrupo: { nome: 'Grupo Em Edição' },
    setNovoGrupo: vi.fn(),
    editingId: 'g-123',
    processing: false,
    wapiGrupos: [],
    wapiLoading: false,
    wapiErro: '',
    handleSubmit: vi.fn(),
    handleToggle: vi.fn(),
    finalizeDelete: vi.fn(),
    startEdit: vi.fn(),
    cancelEdit: mockCancelEdit,
    mensagensModalGrupo: null,
    setMensagensModalGrupo: vi.fn(),
    mensagensAssociadas: [],
    loadingMensagens: false,
    savingMensagens: false,
    abrirModalMensagens: vi.fn(),
    toggleMensagem: vi.fn(),
    salvarMensagensDoGrupo: vi.fn(),
    deletingId: null,
    setDeletingId: vi.fn(),
    syncData: vi.fn(),
    extrairContatosAgora: vi.fn()
  })
}));

const mockCancelEdit = vi.fn();

describe('GerenciarGrupos - Cancelar edição ao clicar na aba Grupos Monitorados', () => {
  it('chama cancelEdit quando o usuário clica na aba Grupos Monitorados enquanto edita um grupo', () => {
    render(
      <GerenciarGrupos 
        grupos={[{ id: 'g-123', nome: 'Grupo Em Edição', ativo: true }]} 
        setGrupos={vi.fn()} 
        mensagens={[]} 
        onRefresh={vi.fn()} 
        openConfirm={vi.fn()} 
      />
    );

    const btnGruposMonitorados = screen.getByRole('button', { name: /Grupos Monitorados/i });
    expect(btnGruposMonitorados).toBeInTheDocument();

    fireEvent.click(btnGruposMonitorados);
    expect(mockCancelEdit).toHaveBeenCalled();
  });
});
