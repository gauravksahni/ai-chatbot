import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import ChatBubble from './ChatBubble';
import useChat from '../../hooks/useChat';
import Button from '../UI/Button';
import Loader from '../UI/Loader';
import { FiMessageSquare } from 'react-icons/fi';

const WindowContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 4rem - 90px); /* Viewport height - Header - Input area */
  margin-left: 280px;
  padding-bottom: 90px; /* Height of input area */
  overflow-y: auto;
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const MessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem 1rem;
  flex-grow: 1;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  text-align: center;
  padding: 2rem;
  color: #6b7280;
`;

const EmptyStateIcon = styled(FiMessageSquare)`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #d1d5db;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const EmptyStateText = styled.p`
  color: #6b7280;
  margin-bottom: 1.5rem;
  max-width: 500px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 1rem 0;
`;

const ChatWindow = () => {
  const { messages, currentSession, loading, startNewChat } = useChat();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleNewChat = async () => {
    await startNewChat();
  };

  // Empty state - no session selected
  if (!currentSession) {
    return (
      <WindowContainer>
        <EmptyState>
          <EmptyStateIcon />
          <EmptyStateTitle>No chat selected</EmptyStateTitle>
          <EmptyStateText>
            Select an existing chat from the sidebar or start a new conversation.
          </EmptyStateText>
          <Button onClick={handleNewChat}>Start a new chat</Button>
        </EmptyState>
      </WindowContainer>
    );
  }

  // Empty state - session selected but no messages
  if (messages.length === 0 && !loading) {
    return (
      <WindowContainer>
        <EmptyState>
          <EmptyStateIcon />
          <EmptyStateTitle>Start a conversation</EmptyStateTitle>
          <EmptyStateText>Start chatting with Claude by typing a message below.</EmptyStateText>
        </EmptyState>
      </WindowContainer>
    );
  }

  return (
    <WindowContainer>
      <MessagesContainer>
        {messages.map(message => (
          <ChatBubble key={message.id} message={message} />
        ))}
        {loading && (
          <LoadingContainer>
            <Loader size="md" text="Claude is thinking..." color="primary" padding="0.5rem" />
          </LoadingContainer>
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>
    </WindowContainer>
  );
};

export default ChatWindow;
