import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import Chat from '../pages/Chat';
import { useChat } from '../pages/Chat/hooks/useChat';

// Mock the custom hook
vi.mock('../pages/Chat/hooks/useChat', () => ({
  useChat: vi.fn()
}));

test('renders Chat component empty state when no group is selected', () => {
  // Setup mock return value
  useChat.mockReturnValue({
    selectedGroup: null,
    setSelectedGroup: vi.fn(),
    messages: [],
    loading: false,
    sending: false,
    groupSearch: '',
    setGroupSearch: vi.fn(),
    messageInput: '',
    setMessageInput: vi.fn(),
    waStatus: { status: 'conectado', plan_type: 'PRO' },
    isMaximized: false,
    setIsMaximized: vi.fn(),
    selectedFile: null,
    setSelectedFile: vi.fn(),
    filePreview: null,
    setFilePreview: vi.fn(),
    isRecording: false,
    recordingTime: 0,
    showScrollButton: false,
    scrollRef: { current: null },
    fileInputRef: { current: null },
    filteredGroups: [],
    handleSendMessage: vi.fn(),
    handleScroll: vi.fn(),
    scrollToBottom: vi.fn(),
    handleFileSelect: vi.fn(),
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    handleDeleteMessage: vi.fn(),
    fetchMessages: vi.fn()
  });

  render(<Chat openConfirm={vi.fn()} />);
  
  expect(screen.getByText(/Selecione um Grupo/i)).toBeDefined();
  expect(screen.getByText(/Escolha um grupo na lista ao lado/i)).toBeDefined();
});

test('renders GroupSidebar in Chat component', () => {
  useChat.mockReturnValue({
    selectedGroup: null,
    setSelectedGroup: vi.fn(),
    messages: [],
    loading: false,
    sending: false,
    groupSearch: '',
    setGroupSearch: vi.fn(),
    messageInput: '',
    setMessageInput: vi.fn(),
    waStatus: { status: 'conectado', plan_type: 'PRO' },
    isMaximized: false,
    setIsMaximized: vi.fn(),
    selectedFile: null,
    setSelectedFile: vi.fn(),
    filePreview: null,
    setFilePreview: vi.fn(),
    isRecording: false,
    recordingTime: 0,
    showScrollButton: false,
    scrollRef: { current: null },
    fileInputRef: { current: null },
    filteredGroups: [{ id: 1, nome: 'Grupo Teste', id_do_grupo: '123@g.us' }],
    handleSendMessage: vi.fn(),
    handleScroll: vi.fn(),
    scrollToBottom: vi.fn(),
    handleFileSelect: vi.fn(),
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    handleDeleteMessage: vi.fn(),
    fetchMessages: vi.fn()
  });

  expect(screen.getByText(/Grupo Teste/i)).toBeDefined();
  expect(screen.getByPlaceholderText(/Buscar grupo.../i)).toBeDefined();
});

test('renders poll message card with options when selectedGroup and poll message are active', () => {
  useChat.mockReturnValue({
    selectedGroup: { id: 1, nome: 'Grupo Teste', id_do_grupo: '123@g.us' },
    setSelectedGroup: vi.fn(),
    messages: [{
      id: 10,
      from_me: true,
      sender_name: 'Disparo Automático',
      sender_number: 'Sistema',
      message_content: 'Quanto é 2 + 2 ?',
      media_type: 'enquete',
      media_url: 'Opção A|Opção B',
      timestamp: new Date().toISOString()
    }],
    loading: false,
    sending: false,
    groupSearch: '',
    setGroupSearch: vi.fn(),
    messageInput: '',
    setMessageInput: vi.fn(),
    waStatus: { status: 'conectado', plan_type: 'PRO' },
    isMaximized: false,
    setIsMaximized: vi.fn(),
    selectedFile: null,
    setSelectedFile: vi.fn(),
    filePreview: null,
    setFilePreview: vi.fn(),
    isRecording: false,
    recordingTime: 0,
    showScrollButton: false,
    scrollRef: { current: null },
    fileInputRef: { current: null },
    filteredGroups: [{ id: 1, nome: 'Grupo Teste', id_do_grupo: '123@g.us' }],
    handleSendMessage: vi.fn(),
    handleScroll: vi.fn(),
    scrollToBottom: vi.fn(),
    handleFileSelect: vi.fn(),
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    handleDeleteMessage: vi.fn(),
    fetchMessages: vi.fn()
  });

  render(<Chat openConfirm={vi.fn()} />);

  expect(screen.getByText(/ENQUETE/i)).toBeDefined();
  expect(screen.getByText(/Quanto é 2 \+ 2 \?/i)).toBeDefined();
  expect(screen.getByText(/Opção A/i)).toBeDefined();
  expect(screen.getByText(/Opção B/i)).toBeDefined();
});
