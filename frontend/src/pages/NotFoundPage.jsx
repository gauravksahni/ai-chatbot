import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../components/UI/Button';
import { FiAlertTriangle, FiHome } from 'react-icons/fi';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 4rem);
  padding: 2rem;
  text-align: center;
`;

const ErrorCode = styled.h1`
  font-size: 6rem;
  font-weight: 800;
  color: #6366f1;
  margin-bottom: 1rem;

  @media (max-width: 640px) {
    font-size: 4rem;
  }
`;

const ErrorTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 2rem;
  max-width: 500px;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background-color: #fee2e2;
  border-radius: 50%;
  margin-bottom: 2rem;
`;

const WarningIcon = styled(FiAlertTriangle)`
  font-size: 2rem;
  color: #ef4444;
`;

const NotFoundPage = () => {
  return (
    <PageContainer>
      <IconWrapper>
        <WarningIcon />
      </IconWrapper>

      <ErrorCode>404</ErrorCode>
      <ErrorTitle>Page Not Found</ErrorTitle>
      <ErrorMessage>The page you are looking for doesnt exist or has been moved.</ErrorMessage>

      <Button as={Link} to="/" size="lg">
        <FiHome style={{ marginRight: '0.5rem' }} />
        Back to Home
      </Button>
    </PageContainer>
  );
};

export default NotFoundPage;
