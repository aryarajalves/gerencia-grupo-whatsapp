import React from 'react';
import GroupSetCard from './GroupSetCard';

const GroupSetsList = ({
  filteredSets = [],
  loading = false,
  getRedirectLink,
  copyToClipboard,
  onEdit,
  onDelete
}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)', gridColumn: '1/-1' }}>
          Carregando conjuntos...
        </div>
      ) : filteredSets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)', gridColumn: '1/-1' }}>
          Nenhum conjunto encontrado.
        </div>
      ) : (
        filteredSets.map(set => (
          <GroupSetCard
            key={set.id}
            set={set}
            getRedirectLink={getRedirectLink}
            copyToClipboard={copyToClipboard}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
};

export default GroupSetsList;
