import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ContactsFilters from '../pages/Contacts/components/ContactsFilters';

describe('ContactsFilters Component', () => {
  it('renderiza os campos de busca e filtros corretamente', () => {
    const setSearch = vi.fn();
    const setGroupFilter = vi.fn();
    const setRoleFilter = vi.fn();
    const setStatusFilter = vi.fn();
    const setResultsPerPage = vi.fn();
    const setCurrentPage = vi.fn();
    const setIsImportModalOpen = vi.fn();
    const handleExportCSV = vi.fn();
    const fetchContacts = vi.fn();

    render(
      <ContactsFilters
        search=""
        setSearch={setSearch}
        groupFilter=""
        setGroupFilter={setGroupFilter}
        roleFilter="all"
        setRoleFilter={setRoleFilter}
        statusFilter="all"
        setStatusFilter={setStatusFilter}
        resultsPerPage={20}
        setResultsPerPage={setResultsPerPage}
        setCurrentPage={setCurrentPage}
        groups={[{ jid_grupo: 'g1@g.us', nome_grupo: 'Grupo VIP' }]}
        selectedIds={[]}
        setSelectedIds={vi.fn()}
        totalContacts={50}
        isSelectingAllFiltered={false}
        setIsSelectingAllFiltered={vi.fn()}
        handleSelectAllFiltered={vi.fn()}
        handleDeleteBatch={vi.fn()}
        setIsImportModalOpen={setIsImportModalOpen}
        handleExportCSV={handleExportCSV}
        exporting={false}
        fetchContacts={fetchContacts}
        loading={false}
        contactsCount={20}
      />
    );

    const inputBusca = screen.getByPlaceholderText(/Buscar por nome ou número/i);
    expect(inputBusca).toBeInTheDocument();

    fireEvent.change(inputBusca, { target: { value: 'João' } });
    expect(setSearch).toHaveBeenCalledWith('João');

    const btnImportar = screen.getByRole('button', { name: /Importar Contatos/i });
    fireEvent.click(btnImportar);
    expect(setIsImportModalOpen).toHaveBeenCalledWith(true);

    const btnExportar = screen.getByRole('button', { name: /Exportar CSV/i });
    fireEvent.click(btnExportar);
    expect(handleExportCSV).toHaveBeenCalled();
  });
});
