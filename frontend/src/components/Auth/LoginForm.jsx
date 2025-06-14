import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Input from '../UI/Input';
import Button from '../UI/Button';
import Loader from '../UI/Loader';
import useAuth from '../../hooks/useAuth';

const FormContainer = styled.div`
  max-width: 400px;
  width: 100%;
  padding: 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const ErrorAlert = styled.div`
  padding: 0.75rem;
  background-color: #fee2e2;
  color: #b91c1c;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;

const ActionLink = styled(Link)`
  font-size: 0.875rem;
  color: #6366f1;
  text-decoration: none;
  margin-top: 1rem;
  display: inline-block;

  &:hover {
    text-decoration: underline;
  }
`;

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();

    // Simple validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await login(email, password);

      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormContainer>
      <Title>Log In</Title>

      {error && <ErrorAlert>{error}</ErrorAlert>}

      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <Button type="submit" fullWidth disabled={isLoading}>
          {isLoading ? <Loader size="sm" color="white" text="Logging in..." /> : 'Log In'}
        </Button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <ActionLink to="/register">Dont have an account? Sign up</ActionLink>
      </div>
    </FormContainer>
  );
};

export default LoginForm;
