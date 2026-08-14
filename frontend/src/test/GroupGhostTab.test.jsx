import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React, { useState } from 'react';
import GroupForm from '../pages/Groups/components/GroupForm';

describe('GroupForm - Aba Número Fantasma', () => {
  it('renderiza a aba de Número Fantasma e permite alternar entre ativado e desativado', () => {
    const ComponentWrapper = () => {
      const [novoGrupo, setNovoGrupo] = useState({
        nome: 'Grupo Teste',
        id_do_grupo: '12345@g.us',
        numero_fantasma_ativo: false
      });

      return (
        <GroupForm 
          novoGrupo={novoGrupo}
          setNovoGrupo={setNovoGrupo}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
          editingId="123"
          processing={false}
          wapiGrupos={[]}
          wapiLoading={false}
          wapiErro=""
        />
      );
    };

    render(<ComponentWrapper />);

    // Localiza botão da aba Número Fantasma
    const abaFantasma = screen.getByRole('button', { name: /Número Fantasma/i });
    expect(abaFantasma).toBeInTheDocument();

    // Clica na aba
    fireEvent.click(abaFantasma);

    // Verifica conteúdo renderizado
    expect(screen.getByText(/Monitoramento por Número Fantasma/i)).toBeInTheDocument();
    expect(screen.getByText(/Ativado para este Grupo/i)).toBeInTheDocument();
    expect(screen.getByText(/Desativado/i)).toBeInTheDocument();

    // Clica para ativar
    const radioAtivado = screen.getByLabelText(/Ativado para este Grupo/i);
    fireEvent.click(radioAtivado);
    expect(radioAtivado).toBeChecked();
  });
});
