import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { FiPlus, FiMessageCircle } from 'react-icons/fi';
import { useChat } from '../../hooks/useChat';

const Sidebar = styled.div`
  position: fixed;
  left: 0;
  top: 4rem;
  bottom: 0;
  width: 280px;
  background-color: #f9fafb;
  border-right: 1px solid #e5e7eb;
  padding: 1rem;
  overflow-y: auto;
  z-index: 10;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Title = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
`;

const SessionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  background-color: ${({ active }) => (active ? '#e0e7ff' : 'transparent')};
  color: ${({ active }) => (active ? '#1e40af' : '#374151')};

  &:hover {
    background-color: #e5e7eb;
  }
`;

const SessionText = styled.div`
  flex: 1;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Timestamp = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const NewChatButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  background-color: #6366f1;
  color: #fff;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background-color: #4f46e5;
  }
`;

const ChatHistory = () => {
  const { chatSessions, currentSession, selectSession, startNewChat } = useChat();

  return (
    <Sidebar>
      <Title>Chat History</Title>

      {chatSessions.map(session => (
        <SessionItem
          key={session.session_id}
          active={currentSession?.session_id === session.session_id}
          onClick={() => selectSession(session.session_id)}
        >
          <FiMessageCircle size={18} />
          <SessionText>
            {session.title || 'Untitled'}
            <Timestamp>{format(new Date(session.updated_at), 'MMM d, h:mm a')}</Timestamp>
          </SessionText>
        </SessionItem>
      ))}

      <NewChatButton onClick={startNewChat}>
        <FiPlus size={18} />
        New Chat
      </NewChatButton>
    </Sidebar>
  );
};

export default ChatHistory;
