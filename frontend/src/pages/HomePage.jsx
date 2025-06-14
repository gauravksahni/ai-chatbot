import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../components/UI/Button';
import { FiMessageSquare, FiArrowRight } from 'react-icons/fi';
import useAuth from '../hooks/useAuth';

const HeroContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 4rem);
  text-align: center;
  padding: 2rem;
  background-color: #f9fafb;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 1.5rem;

  @media (max-width: 640px) {
    font-size: 2.25rem;
  }
`;

const ColoredSpan = styled.span`
  color: #6366f1;
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  color: #4b5563;
  max-width: 700px;
  margin-bottom: 2.5rem;

  @media (max-width: 640px) {
    font-size: 1.125rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  background-color: #ede9fe;
  border-radius: 50%;
  margin-bottom: 2rem;
`;

const LargeIcon = styled(FiMessageSquare)`
  font-size: 2.5rem;
  color: #6366f1;
`;

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <HeroContainer>
      <IconWrapper>
        <LargeIcon />
      </IconWrapper>

      <HeroTitle>
        Chat with <ColoredSpan>Claude</ColoredSpan>
      </HeroTitle>

      <HeroSubtitle>
        Experience intelligent conversations with Claude, Anthropics advanced AI assistant. Get
        answers, brainstorm ideas, or just have a friendly chat.
      </HeroSubtitle>

      <ButtonGroup>
        {isAuthenticated ? (
          <Button as={Link} to="/chat" size="lg">
            Go to Chat <FiArrowRight style={{ marginLeft: '0.5rem' }} />
          </Button>
        ) : (
          <>
            <Button as={Link} to="/login" size="lg">
              Log In
            </Button>
            <Button as={Link} to="/register" variant="outline" size="lg">
              Sign Up
            </Button>
          </>
        )}
      </ButtonGroup>
    </HeroContainer>
  );
};

export default HomePage;
