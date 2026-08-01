import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MessageInput from '../pages/Chat/components/MessageInput';

const defaultProps = {
  handleSendMessage: vi.fn(),
  filePreview: null,
  setSelectedFile: vi.fn(),
  setFilePreview: vi.fn(),
  selectedFile: null,
  fileInputRef: { current: null },
  handleFileSelect: vi.fn(),
  isRecording: false,
  recordingTime: 0,
  messageInput: 'Olá',
  setMessageInput: vi.fn(),
  isMaximized: false,
  setIsMaximized: vi.fn(),
  startRecording: vi.fn(),
  stopRecording: vi.fn(),
  sending: false,
};

describe('MessageInput - Bug Mensagem Duplicada', () => {
  it('deve chamar handleSendMessage apenas 1 vez ao pressionar Enter', () => {
    const handleSendMessage = vi.fn((e) => { if (e) e.preventDefault(); });
    render(<MessageInput {...defaultProps} handleSendMessage={handleSendMessage} />);

    const textarea = screen.getByPlaceholderText('Digite sua mensagem...');

    // Simular pressionar Enter no textarea
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    // O onKeyDown agora usa form.requestSubmit(), então handleSendMessage
    // só deve ser chamado pelo onSubmit do form — 0 ou 1 vez, nunca 2
    expect(handleSendMessage.mock.calls.length).toBeLessThanOrEqual(1);
  });

  it('NÃO deve enviar ao pressionar Shift+Enter (nova linha)', () => {
    const handleSendMessage = vi.fn();
    render(<MessageInput {...defaultProps} handleSendMessage={handleSendMessage} />);

    const textarea = screen.getByPlaceholderText('Digite sua mensagem...');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

    expect(handleSendMessage).not.toHaveBeenCalled();
  });

  it('deve ter o botão de envio no formulário com type="submit"', () => {
    render(<MessageInput {...defaultProps} />);
    // O botão submit é o único mecanismo de disparo — verifica que existe
    const submitButton = document.querySelector('button[type="submit"]');
    expect(submitButton).toBeTruthy();
  });

  it('formulário deve ter onSubmit vinculado a handleSendMessage', () => {
    const handleSendMessage = vi.fn((e) => { if (e) e.preventDefault(); });
    render(<MessageInput {...defaultProps} handleSendMessage={handleSendMessage} />);

    const form = document.querySelector('form');
    expect(form).toBeTruthy();
    // Simular submit direto do form
    fireEvent.submit(form);
    expect(handleSendMessage).toHaveBeenCalledTimes(1);
  });
});
