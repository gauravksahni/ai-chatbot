import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import AuthProvider from './contexts/AuthContext';
import ChatProvider from './contexts/ChatContext';
import Header from './components/Layout/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import NotFoundPage from './pages/NotFoundPage';
import useAuth from './hooks/useAuth';

import './App.css';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const MainContent = styled.main`
  flex-grow: 1;
  margin-top: 4rem; /* Height of the header */
`;

// Protected route wrapper component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show nothing while checking authentication
  if (loading) {
    return null;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Auth route wrapper component (redirects to chat if already logged in)
const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show nothing while checking authentication
  if (loading) {
    return null;
  }

  return isAuthenticated ? <Navigate to="/chat" /> : children;
};

const AppWithAuth = () => {
  return (
    <AppContainer>
      <Header />
      <MainContent>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/login"
            element={
              <AuthRoute>
                <LoginPage />
              </AuthRoute>
            }
          />

          <Route
            path="/register"
            element={
              <AuthRoute>
                <RegisterPage />
              </AuthRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatProvider>
                  <ChatPage />
                </ChatProvider>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MainContent>
    </AppContainer>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppWithAuth />
      </AuthProvider>
    </Router>
  );
};

export default App;
