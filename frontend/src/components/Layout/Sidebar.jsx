import React, { useState } from 'react';
import styled from 'styled-components';
import { FiPlus, FiMessageSquare, FiEdit2, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import Button from '../UI/Button';
import useChat from '../../hooks/useChat';
import { format } from 'date-fns';

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 280px;
  background-color: #f9fafb;
  border-right: 1px solid #e5e7eb;
  height: calc(100vh - 4rem);
  position: fixed;
  top: 4rem;
  left: 0;
  overflow-y: auto;
  padding: 1rem;
`;

const NewChatButton = styled(Button)`
  margin-bottom: 1.5rem;
`;

const SessionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-grow: 1;
  overflow-y: auto;
`;

const SessionItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 150ms;
  position: relative;

  ${props =>
    props.active &&
    `
    background-color: #ede9fe;
    font-weight: 500;
  `}

  &:hover {
    background-color: ${props => (props.active ? '#ede9fe' : '#f3f4f6')};
  }

  &:hover .actions {
    opacity: 1;
  }
`;

const SessionIcon = styled(FiMessageSquare)`
  margin-right: 0.75rem;
  color: #6366f1;
  flex-shrink: 0;
`;

const SessionTitle = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  font-size: 0.875rem;
`;

const SessionDate = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const SessionActions = styled.div`
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 150ms;
  position: absolute;
  right: 0.75rem;
  background-color: inherit;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: ${props => (props.danger ? '#ef4444' : '#6b7280')};
  padding: 0.25rem;
  border-radius: 0.25rem;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: ${props => (props.danger ? '#dc2626' : '#6366f1')};
  }

  &:not(:last-child) {
    margin-right: 0.25rem;
  }
`;

const NoSessionsMessage = styled.div`
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 2rem;
`;

// Modal for editing session title or confirming deletion
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
`;

const ModalTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }
`;

const ModalMessage = styled.p`
  margin-bottom: 1.5rem;
  color: #4b5563;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const DeleteIcon = styled(FiAlertTriangle)`
  color: #ef4444;
  font-size: 2rem;
  margin: 0 auto 1rem;
  display: block;
`;

const Sidebar = () => {
  const {
    chatSessions,
    currentSession,
    loading,
    startNewChat,
    selectSession,
    updateSessionTitle,
    deleteChat,
  } = useChat();

  const [editingSession, setEditingSession] = useState(null);
  const [deletingSession, setDeletingSession] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  const handleNewChat = async () => {
    await startNewChat();
  };

  const handleSelectSession = sessionId => {
    selectSession(sessionId);
  };

  const handleEditTitle = (e, session) => {
    e.stopPropagation();
    setEditingSession(session);
    setNewTitle(session.title);
  };

  const handleDeleteClick = (e, session) => {
    e.stopPropagation();
    setDeletingSession(session);
  };

  const handleSaveTitle = async () => {
    if (editingSession && newTitle.trim()) {
      await updateSessionTitle(editingSession.session_id, newTitle.trim());
      setEditingSession(null);
      setNewTitle('');
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingSession) {
      await deleteChat(deletingSession.session_id);
      setDeletingSession(null);
    }
  };

  const formatDate = dateString => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Unknown date';
    }
  };

  return (
    <SidebarContainer>
      <NewChatButton fullWidth onClick={handleNewChat} disabled={loading}>
        <FiPlus style={{ marginRight: '0.5rem' }} />
        New Chat
      </NewChatButton>

      <SessionsList>
        {chatSessions.length === 0 ? (
          <NoSessionsMessage>No chat sessions yet. Start a new chat!</NoSessionsMessage>
        ) : (
          chatSessions.map(session => (
            <SessionItem
              key={session.session_id}
              active={currentSession?.session_id === session.session_id}
              onClick={() => handleSelectSession(session.session_id)}
            >
              <SessionIcon />
              <div style={{ overflow: 'hidden' }}>
                <SessionTitle>{session.title}</SessionTitle>
                <SessionDate>{formatDate(session.created_at)}</SessionDate>
              </div>
              <SessionActions className="actions">
                <ActionButton onClick={e => handleEditTitle(e, session)} title="Edit title">
                  <FiEdit2 size={16} />
                </ActionButton>
                <ActionButton
                  onClick={e => handleDeleteClick(e, session)}
                  title="Delete chat"
                  danger
                >
                  <FiTrash2 size={16} />
                </ActionButton>
              </SessionActions>
            </SessionItem>
          ))
        )}
      </SessionsList>

      {/* Edit Title Modal */}
      {editingSession && (
        <Modal>
          <ModalContent>
            <ModalTitle>Edit Chat Title</ModalTitle>
            <ModalInput
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Enter a new title"
              autoFocus
            />
            <ModalActions>
              <Button variant="outline" onClick={() => setEditingSession(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTitle}>Save</Button>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSession && (
        <Modal>
          <ModalContent>
            <ModalTitle>Delete Chat</ModalTitle>
            <DeleteIcon />
            <ModalMessage>
              Are you sure you want to delete this chat? This action cannot be undone.
            </ModalMessage>
            <ModalActions>
              <Button variant="outline" onClick={() => setDeletingSession(null)}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </SidebarContainer>
  );
};

export default Sidebar;
