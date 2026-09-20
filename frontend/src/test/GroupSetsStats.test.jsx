import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GroupSetsStats from '../pages/GroupSets/components/GroupSetsStats';

describe('GroupSetsStats Component', () => {
  it('renderiza os contadores de total de conjuntos e conjuntos ativos', () => {
    render(<GroupSetsStats totalSets={15} activeSets={12} />);

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Total de Conjuntos')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Conjuntos Ativos')).toBeInTheDocument();
  });
});
