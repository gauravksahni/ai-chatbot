import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiLogOut, FiUser, FiMessageSquare } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
  padding: 0 1.5rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #6366f1;
  text-decoration: none;

  &:hover {
    color: #4f46e5;
  }
`;

const LogoIcon = styled(FiMessageSquare)`
  margin-right: 0.5rem;
  font-size: 1.5rem;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  margin-right: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
`;

const UserIcon = styled(FiUser)`
  margin-right: 0.5rem;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;

  &:hover {
    background-color: #f3f4f6;
    color: #ef4444;
  }
`;

const LogoutIcon = styled(FiLogOut)`
  margin-right: 0.5rem;
`;

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <HeaderContainer>
      <Logo to={isAuthenticated ? '/chat' : '/'}>
        <LogoIcon />
        Claude Chat
      </Logo>

      {isAuthenticated && (
        <RightSection>
          <UserInfo>
            <UserIcon />
            {user?.username}
          </UserInfo>

          <LogoutButton onClick={handleLogout}>
            <LogoutIcon />
            Logout
          </LogoutButton>
        </RightSection>
      )}
    </HeaderContainer>
  );
};

export default Header;
