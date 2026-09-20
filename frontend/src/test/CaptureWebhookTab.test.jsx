import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CaptureWebhookTab from '../pages/Capture/components/CaptureWebhookTab';

describe('CaptureWebhookTab Component', () => {
  it('renderiza os cards de webhook principal e fantasma e dispara o handleCopy', () => {
    const handleCopy = vi.fn();
    const webhookUrl = 'https://api.empresa.com/webhook/whatsapp';

    render(
      <CaptureWebhookTab
        webhookUrl={webhookUrl}
        copiedId={null}
        handleCopy={handleCopy}
      />
    );

    expect(screen.getByText('Webhook da Instância Principal')).toBeInTheDocument();
    expect(screen.getByText('Webhook do Número Fantasma (Sentinela de Grupos)')).toBeInTheDocument();

    const copyButtons = screen.getAllByRole('button', { name: /Copiar URL/i });
    expect(copyButtons.length).toBe(2);

    fireEvent.click(copyButtons[0]);
    expect(handleCopy).toHaveBeenCalledWith(webhookUrl, 'webhook_principal', expect.any(String));
  });
});
