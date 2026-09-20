import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import BulkAssignGroupsModal from './BulkAssignGroupsModal';
import BulkDuplicateModal from './BulkDuplicateModal';
import FullscreenMediaModal from './FullscreenMediaModal';
import MessagesBulkBar from './MessagesBulkBar';
import MessagesListFilters from './MessagesListFilters';
import MessageCard from './MessageCard';
import MessagesPagination from './MessagesPagination';

const MessagesList = ({
  mensagens = [],
  grupos = [],
  searchTerm: externalSearchTerm,
  setSearchTerm: externalSetSearchTerm,
  activeDay: externalActiveDay,
  setActiveDay: externalSetActiveDay,
  activeTag: externalActiveTag,
  setActiveTag: externalSetActiveTag,
  activeType: externalActiveType,
  setActiveType: externalSetActiveType,
  onEdit,
  onDelete,
  onBulkDelete,
  onBulkAssignGroups,
  onBulkDuplicate,
  openConfirm,
  editingId,
  onOpenNewForm
}) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [internalActiveDay, setInternalActiveDay] = useState('ALL');
  const [internalActiveTag, setInternalActiveTag] = useState('ALL');
  const [internalActiveType, setInternalActiveType] = useState('ALL');

  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
  const setSearchTerm = externalSetSearchTerm || setInternalSearchTerm;

  const activeDay = externalActiveDay !== undefined ? externalActiveDay : internalActiveDay;
  const setActiveDay = externalSetActiveDay || setInternalActiveDay;

  const activeTag = externalActiveTag !== undefined ? externalActiveTag : internalActiveTag;
  const setActiveTag = externalSetActiveTag || setInternalActiveTag;

  const activeType = externalActiveType !== undefined ? externalActiveType : internalActiveType;
  const setActiveType = externalSetActiveType || setInternalActiveType;

  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [fullscreenMedia, setFullscreenMedia] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkGroupModalOpen, setIsBulkGroupModalOpen] = useState(false);
  const [isBulkDuplicateModalOpen, setIsBulkDuplicateModalOpen] = useState(false);

  // Lista única e ordenada de todos os dias existentes
  const availableDays = [...new Set((mensagens || []).map(m => m.dia_do_lancamento))].sort((a, b) => a - b);

  // Lista única e ordenada de todas as etiquetas existentes
  const availableTags = [...new Set((mensagens || []).map(m => m.etiqueta).filter(Boolean))].sort();

  // Lista única e ordenada de todos os tipos existentes
  const availableTypes = [...new Set((mensagens || []).map(m => m.tipo_de_mensagem).filter(Boolean))].sort();

  // Filtragem inicial por busca de texto, por aba de dia, por etiqueta e por tipo
  const filtered = (mensagens || []).filter(m => {
    const matchesSearch = (m.mensagem || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (m.etiqueta || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDay = activeDay === 'ALL' || m.dia_do_lancamento === parseInt(activeDay);
    const matchesTag = activeTag === 'ALL' || (m.etiqueta || '') === activeTag;
    const matchesType = activeType === 'ALL' || m.tipo_de_mensagem === activeType;
    return matchesSearch && matchesDay && matchesTag && matchesType;
  });

  // Ordenação consistente por Dia e por Horário de Disparo
  const sortedMessages = [...filtered].sort((a, b) => {
    if (a.dia_do_lancamento !== b.dia_do_lancamento) {
      return a.dia_do_lancamento - b.dia_do_lancamento;
    }
    return (a.horario_do_disparo || '').localeCompare(b.horario_do_disparo || '');
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeDay, activeTag, activeType, pageSize]);

  const totalItems = sortedMessages.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedMessages = sortedMessages.slice(startIndex, startIndex + pageSize);

  const groupedPageMessages = paginatedMessages.reduce((acc, m) => {
    acc[m.dia_do_lancamento] = acc[m.dia_do_lancamento] || [];
    acc[m.dia_do_lancamento].push(m);
    return acc;
  }, {});

  const daysOnCurrentPage = Object.keys(groupedPageMessages).map(Number).sort((a, b) => a - b);

  // Manipulação de seleção
  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    const allFilteredIds = sortedMessages.map(m => m.id);
    const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.includes(id));

    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allFilteredIds);
    }
  };

  const handleExecuteBulkDelete = () => {
    if (onBulkDelete) {
      onBulkDelete(selectedIds, openConfirm, () => setSelectedIds([]));
    }
  };

  const handleExecuteBulkAssignGroups = (grupoIds) => {
    if (onBulkAssignGroups) {
      onBulkAssignGroups(selectedIds, grupoIds, () => setSelectedIds([]));
    }
  };

  const handleExecuteBulkDuplicate = (diaDoLancamento, grupoIds) => {
    if (onBulkDuplicate) {
      onBulkDuplicate(selectedIds, diaDoLancamento, grupoIds, () => setSelectedIds([]));
    }
  };

  const maxDayInMessages = availableDays.length > 0 ? Math.max(...availableDays) : 1;
  const isAllFilteredSelected = sortedMessages.length > 0 && sortedMessages.every(m => selectedIds.includes(m.id));

  return (
    <div className="fade-in">
      {/* Modal Mídia Tela Cheia */}
      <FullscreenMediaModal
        media={fullscreenMedia}
        onClose={() => setFullscreenMedia(null)}
      />

      {/* Modal de Atribuição de Grupos */}
      <BulkAssignGroupsModal 
        isOpen={isBulkGroupModalOpen}
        onClose={() => setIsBulkGroupModalOpen(false)}
        grupos={grupos}
        selectedCount={selectedIds.length}
        onSave={handleExecuteBulkAssignGroups}
      />

      {/* Modal de Duplicação de Mensagens */}
      <BulkDuplicateModal 
        isOpen={isBulkDuplicateModalOpen}
        onClose={() => setIsBulkDuplicateModalOpen(false)}
        grupos={grupos}
        selectedCount={selectedIds.length}
        defaultDay={maxDayInMessages}
        onSave={handleExecuteBulkDuplicate}
      />

      {/* Barra de Ações em Lote */}
      <MessagesBulkBar
        selectedIds={selectedIds}
        sortedMessages={sortedMessages}
        isAllFilteredSelected={isAllFilteredSelected}
        handleSelectAll={handleSelectAll}
        onOpenDuplicateModal={() => setIsBulkDuplicateModalOpen(true)}
        onOpenGroupModal={() => setIsBulkGroupModalOpen(true)}
        onExecuteBulkDelete={handleExecuteBulkDelete}
      />

      {/* Filtros e Abas de Navegação */}
      <MessagesListFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isAllFilteredSelected={isAllFilteredSelected}
        handleSelectAll={handleSelectAll}
        onOpenNewForm={onOpenNewForm}
        availableTags={availableTags}
        activeTag={activeTag}
        setActiveTag={setActiveTag}
        availableTypes={availableTypes}
        activeType={activeType}
        setActiveType={setActiveType}
        availableDays={availableDays}
        activeDay={activeDay}
        setActiveDay={setActiveDay}
        totalMessagesCount={mensagens?.length || 0}
        mensagens={mensagens}
      />

      {/* Grid de Mensagens Agrupadas por Dia */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {daysOnCurrentPage.length > 0 ? (
          daysOnCurrentPage.map(day => (
            <div key={day}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--primary)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
                  DIA {day.toString().padStart(2, '0')}
                </div>
                <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {groupedPageMessages[day].map((m) => {
                  const allDayMessages = [...(mensagens || [])]
                    .filter(item => item.dia_do_lancamento === day)
                    .sort((a, b) => (a.horario_do_disparo || '').localeCompare(b.horario_do_disparo || ''));
                  const messageNumberOnDay = allDayMessages.findIndex(item => item.id === m.id) + 1;
                  
                  return (
                    <MessageCard
                      key={m.id}
                      message={m}
                      day={day}
                      messageNumberOnDay={messageNumberOnDay}
                      isEditing={editingId === m.id}
                      isSelected={selectedIds.includes(m.id)}
                      toggleSelect={toggleSelect}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      openConfirm={openConfirm}
                      setFullscreenMedia={setFullscreenMedia}
                    />
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-dim)' }}>
            <Send size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
            Nenhuma mensagem encontrada.
          </div>
        )}
      </div>

      {/* Rodapé de Paginação */}
      <MessagesPagination
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalItems={totalItems}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default MessagesList;
