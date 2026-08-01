import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';

describe('Simple Test', () => {
  it('passes', () => {
    expect(1 + 1).toBe(2);
  });
  
  it('renders a dummy component', () => {
    render(<div>Hello Test</div>);
    expect(screen.getByText(/Hello Test/i)).toBeInTheDocument();
  });
});
