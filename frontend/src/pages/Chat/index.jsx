import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useChat } from './hooks/useChat';
import GroupSidebar from './components/GroupSidebar';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import GroupContactsModal from './components/GroupContactsModal';
import './Chat.css';

const Chat = ({ openConfirm }) => {
  const {
    selectedGroup,
    setSelectedGroup,
    messages,
    loading,
    sending,
    groupSearch,
    setGroupSearch,
    messageInput,
    setMessageInput,
    waStatus,
    isMaximized,
    setIsMaximized,
    selectedFile,
    setSelectedFile,
    filePreview,
    setFilePreview,
    isRecording,
    recordingTime,
    showScrollButton,
    scrollRef,
    fileInputRef,
    filteredGroups,
    handleSendMessage,
    handleScroll,
    scrollToBottom,
    handleFileSelect,
    startRecording,
    stopRecording,
    handleDeleteMessage,
    fetchMessages
  } = useChat(openConfirm);

  const [showContactsModal, setShowContactsModal] = useState(false);

  return (
    <div className="page-container" style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 100px)', padding: '0' }}>
      <GroupSidebar 
        waStatus={waStatus}
        groupSearch={groupSearch}
        setGroupSearch={setGroupSearch}
        filteredGroups={filteredGroups}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
      />

      <div 
        className="glass-card" 
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          padding: '0', 
          overflow: 'hidden', 
          height: '100%',
          background: 'rgba(15, 18, 28, 0.85)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          borderRadius: '16px'
        }}
      >
        {selectedGroup ? (
          <>
            <ChatHeader 
              selectedGroup={selectedGroup}
              fetchMessages={fetchMessages}
              loading={loading}
              onOpenContacts={() => setShowContactsModal(true)}
              onCloseChat={() => setSelectedGroup(null)}
            />


            <MessageList 
              loading={loading}
              messages={messages}
              scrollRef={scrollRef}
              handleScroll={handleScroll}
              handleDeleteMessage={handleDeleteMessage}
              showScrollButton={showScrollButton}
              scrollToBottom={scrollToBottom}
            />

            <MessageInput 
              handleSendMessage={handleSendMessage}
              filePreview={filePreview}
              setSelectedFile={setSelectedFile}
              setFilePreview={setFilePreview}
              selectedFile={selectedFile}
              fileInputRef={fileInputRef}
              handleFileSelect={handleFileSelect}
              isRecording={isRecording}
              recordingTime={recordingTime}
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              isMaximized={isMaximized}
              setIsMaximized={setIsMaximized}
              startRecording={startRecording}
              stopRecording={stopRecording}
              sending={sending}
            />
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', color: 'var(--text-dim)' }}>
            <div style={{ padding: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <MessageCircle size={64} className="text-primary" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ color: '#fff', marginBottom: '10px' }}>Selecione um Grupo</h3>
              <p>Escolha um grupo na lista ao lado para ver as mensagens e interagir.</p>
            </div>
          </div>
        )}
      </div>

      {showContactsModal && selectedGroup && (
        <GroupContactsModal 
          group={selectedGroup}
          onClose={() => setShowContactsModal(false)}
        />
      )}
    </div>
  );
};

export default Chat;
