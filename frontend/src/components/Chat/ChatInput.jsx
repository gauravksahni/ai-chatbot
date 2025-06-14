import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FiSend } from 'react-icons/fi';
import useChat from '../../hooks/useChat';

const InputContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 280px;
  right: 0;
  padding: 1rem;
  background-color: #ffffff;
  border-top: 1px solid #e5e7eb;

  @media (max-width: 768px) {
    left: 0;
  }
`;

const InputForm = styled.form`
  display: flex;
  align-items: flex-end;
  max-width: 900px;
  margin: 0 auto;
`;

const TextareaWrapper = styled.div`
  position: relative;
  flex-grow: 1;
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  min-height: 60px;
  max-height: 200px;
  padding: 0.75rem 3rem 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  resize: none;
  outline: none;
  font-family: inherit;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const SendButton = styled.button`
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 150ms;

  &:hover {
    background-color: #4f46e5;
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: ${props => (props.connected ? '#10b981' : '#ef4444')};
  margin-left: 1rem;
  margin-bottom: 0.75rem;

  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props => (props.connected ? '#10b981' : '#ef4444')};
    margin-right: 0.25rem;
  }
`;

const ChatInput = () => {
  const { sendMessage, currentSession, loading, wsConnected } = useChat();
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const resizeTextarea = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    };

    textarea.addEventListener('input', resizeTextarea);
    return () => textarea.removeEventListener('input', resizeTextarea);
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    await sendMessage(message.trim(), currentSession?.session_id);
    setMessage('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <InputContainer>
      <InputForm onSubmit={handleSubmit}>
        <TextareaWrapper>
          <StyledTextarea
            ref={textareaRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            disabled={loading}
            rows={1}
          />
          <SendButton type="submit" disabled={!message.trim() || loading}>
            <FiSend size={16} />
          </SendButton>
        </TextareaWrapper>
      </InputForm>
    </InputContainer>
  );
};

export default ChatInput;
