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

const SuccessAlert = styled.div`
  padding: 0.75rem;
  background-color: #d1fae5;
  color: #065f46;
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

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        setSuccess('Registration successful! You can now login.');
        // Reset form
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
        });

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred during registration');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormContainer>
      <Title>Create an Account</Title>

      {error && <ErrorAlert>{error}</ErrorAlert>}
      {success && <SuccessAlert>{success}</SuccessAlert>}

      <form onSubmit={handleSubmit}>
        <Input
          label="Username"
          name="username"
          placeholder="johndoe"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          helperText="Password must be at least 8 characters long"
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <Button type="submit" fullWidth disabled={isLoading}>
          {isLoading ? <Loader size="sm" color="white" text="Creating account..." /> : 'Sign Up'}
        </Button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <ActionLink to="/login">Already have an account? Log in</ActionLink>
      </div>
    </FormContainer>
  );
};

export default RegisterForm;
