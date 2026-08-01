import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import ImportContactsModal from '../pages/Contacts/components/ImportContactsModal';

describe('ImportContactsModal Component', () => {
  it('renderiza o modal de importação quando aberto', () => {
    render(
      <ImportContactsModal 
        isOpen={true} 
        onClose={vi.fn()} 
        groups={[{ jid_grupo: 'g1@g.us', nome_grupo: 'Grupo Teste' }]} 
      />
    );

    expect(screen.getByText('Importar Contatos (CSV)')).toBeInTheDocument();
    expect(screen.getByText(/Clique ou arraste o arquivo CSV aqui/i)).toBeInTheDocument();
    expect(screen.getByText('Grupo Teste')).toBeInTheDocument();
  });

  it('não renderiza nada quando isOpen for false', () => {
    const { container } = render(
      <ImportContactsModal 
        isOpen={false} 
        onClose={vi.fn()} 
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
