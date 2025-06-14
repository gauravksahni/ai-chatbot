import React from 'react';
import styled from 'styled-components';
import LoginForm from '../components/Auth/LoginForm';

const PageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 4rem);
  padding: 2rem;
  background-color: #f9fafb;
`;

const LoginPage = () => {
  return (
    <PageContainer>
      <LoginForm />
    </PageContainer>
  );
};

export default LoginPage;
