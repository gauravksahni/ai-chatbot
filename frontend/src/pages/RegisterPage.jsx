import React from 'react';
import styled from 'styled-components';
import RegisterForm from '../components/Auth/RegisterForm';

const PageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 4rem);
  padding: 2rem;
  background-color: #f9fafb;
`;

const RegisterPage = () => {
  return (
    <PageContainer>
      <RegisterForm />
    </PageContainer>
  );
};

export default RegisterPage;
