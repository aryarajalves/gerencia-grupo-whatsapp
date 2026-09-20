import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GroupSetCard from '../pages/GroupSets/components/GroupSetCard';

describe('GroupSetCard Component', () => {
  const mockSet = {
    id: 1,
    nome: 'Lançamento Black Friday',
    slug: 'black-friday',
    ativo: true,
    grupos: [
      { id: 10, grupo_id: 1, grupo_nome: 'Grupo 01 BF', quantidade_contatos: 500, max_leads: 900, posicao: 1 },
      { id: 11, grupo_id: 2, grupo_nome: 'Grupo 02 BF', quantidade_contatos: 900, max_leads: 900, posicao: 2 }
    ]
  };

  it('renderiza os dados do conjunto, badges e dispara edição e exclusão', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const copyToClipboard = vi.fn();
    const getRedirectLink = vi.fn((slug) => `http://localhost:8000/join/${slug}`);

    render(
      <GroupSetCard
        set={mockSet}
        getRedirectLink={getRedirectLink}
        copyToClipboard={copyToClipboard}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('Lançamento Black Friday')).toBeInTheDocument();
    expect(screen.getByText('Ativo')).toBeInTheDocument();
    expect(screen.getByText('Grupo 01 BF')).toBeInTheDocument();
    expect(screen.getByText('500 / 900 leads')).toBeInTheDocument();
    expect(screen.getByText('Grupo 02 BF')).toBeInTheDocument();

    const btnEdit = screen.getByTitle('Editar conjunto');
    fireEvent.click(btnEdit);
    expect(onEdit).toHaveBeenCalledWith(mockSet);

    const btnDelete = screen.getByTitle('Excluir conjunto');
    fireEvent.click(btnDelete);
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
