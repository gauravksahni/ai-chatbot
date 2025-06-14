import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { FiUser, FiCpu } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MessageContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  padding: 0 1rem;

  @media (max-width: 640px) {
    padding: 0 0.5rem;
  }
`;

const UserMessage = styled(MessageContainer)`
  flex-direction: row-reverse;
`;

const AssistantMessage = styled(MessageContainer)`
  flex-direction: row;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  flex-shrink: 0;
  margin-bottom: auto;
`;

const UserIconContainer = styled(IconContainer)`
  background-color: #f3f4f6;
  color: #4b5563;
  margin-left: 0.75rem;
`;

const AssistantIconContainer = styled(IconContainer)`
  background-color: #ede9fe;
  color: #6366f1;
  margin-right: 0.75rem;
`;

const MessageContent = styled.div`
  padding: 1rem;
  border-radius: 0.75rem;
  max-width: 80%;
  position: relative;

  @media (max-width: 640px) {
    max-width: 85%;
    padding: 0.75rem;
  }
`;

const UserMessageContent = styled(MessageContent)`
  background-color: #f3f4f6;
  color: #1f2937;
  border-top-right-radius: 0;
`;

const AssistantMessageContent = styled(MessageContent)`
  background-color: #ede9fe;
  color: #1f2937;
  border-top-left-radius: 0;
`;

const MessageTime = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
  text-align: right;
`;

const MarkdownContainer = styled.div`
  font-size: 0.9375rem;
  line-height: 1.5;

  p {
    margin-top: 0;
    margin-bottom: 1rem;
    &:last-child {
      margin-bottom: 0;
    }
  }

  a {
    color: #6366f1;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  ul,
  ol {
    margin-top: 0;
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }

  blockquote {
    border-left: 3px solid #d1d5db;
    margin-left: 0;
    padding-left: 1rem;
    color: #4b5563;
  }

  code {
    font-family: monospace;
    font-size: 0.875em;
    background-color: rgba(0, 0, 0, 0.05);
    padding: 0.2em 0.4em;
    border-radius: 3px;
  }

  pre {
    margin: 0.5rem 0;
    background-color: transparent !important;
    padding: 0 !important;
    border-radius: 0.375rem;
    overflow: hidden;
  }
`;

const formatMessageTime = timestamp => {
  try {
    return format(new Date(timestamp), 'h:mm a');
  } catch (e) {
    return '';
  }
};

const ChatBubble = ({ message }) => {
  const isUser = message.role === 'user';

  const MessageComponent = isUser ? UserMessage : AssistantMessage;
  const ContentComponent = isUser ? UserMessageContent : AssistantMessageContent;
  const IconComponent = isUser ? UserIconContainer : AssistantIconContainer;

  return (
    <MessageComponent>
      <IconComponent>{isUser ? <FiUser size={18} /> : <FiCpu size={18} />}</IconComponent>

      <ContentComponent>
        {isUser ? (
          <div>{message.content}</div>
        ) : (
          <MarkdownContainer>
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter style={prism} language={match[1]} PreTag="div" {...props}>
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </MarkdownContainer>
        )}

        <MessageTime>{formatMessageTime(message.timestamp)}</MessageTime>
      </ContentComponent>
    </MessageComponent>
  );
};

export default ChatBubble;
