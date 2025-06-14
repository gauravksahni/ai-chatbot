import React, { useEffect } from 'react';
import styled from 'styled-components';
import Sidebar from '../components/Layout/Sidebar';
import ChatWindow from '../components/Chat/ChatWindow';
import ChatInput from '../components/Chat/ChatInput';
import useChat from '../hooks/useChat';
import Loader from '../components/UI/Loader';

const PageContainer = styled.div`
  display: flex;
  min-height: calc(100vh - 4rem);
  position: relative;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 4rem);
  width: 100%;
`;

const ChatPage = () => {
  const { fetchChatHistory, loading } = useChat();

  // Fetch chat history on component mount
  useEffect(() => {
    fetchChatHistory();
  }, [fetchChatHistory]);

  // Show loading state while fetching initial data
  if (loading && !window.location.hash) {
    return (
      <LoadingContainer>
        <Loader size="lg" color="primary" text="Loading chats..." />
      </LoadingContainer>
    );
  }

  return (
    <PageContainer>
      <Sidebar />
      <ChatWindow />
      <ChatInput />
    </PageContainer>
  );
};

export default ChatPage;
