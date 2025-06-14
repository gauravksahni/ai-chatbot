import React from 'react';
import styled, { keyframes } from 'styled-components';

// Spinner animation
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Size variants
const sizes = {
  sm: '1.25rem',
  md: '2rem',
  lg: '3rem',
};

// Color variants
const colors = {
  primary: '#6366f1',
  secondary: '#6b7280',
  white: '#ffffff',
};

const LoaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.padding || '0'};
`;

const SpinnerContainer = styled.div`
  position: relative;
  width: ${props => sizes[props.size] || sizes.md};
  height: ${props => sizes[props.size] || sizes.md};
`;

const Spinner = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: ${props => colors[props.color] || colors.primary};
  border-right-color: ${props => colors[props.color] || colors.primary};
  animation: ${spin} 0.8s linear infinite;
`;

const LoaderText = styled.div`
  margin-left: ${props => (props.text ? '0.75rem' : '0')};
  font-size: 0.875rem;
  color: ${props => colors[props.color] || colors.primary};
`;

const Loader = ({
  size = 'md',
  color = 'primary',
  text = '',
  padding = '0',
  fullWidth = false,
}) => {
  return (
    <LoaderWrapper padding={padding} style={{ width: fullWidth ? '100%' : 'auto' }}>
      <SpinnerContainer size={size}>
        <Spinner color={color} />
      </SpinnerContainer>
      {text && <LoaderText color={color}>{text}</LoaderText>}
    </LoaderWrapper>
  );
};

export default Loader;
