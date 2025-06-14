import React from 'react';
import styled, { css } from 'styled-components';

// Button variants
const variants = {
  primary: css`
    background-color: #6366f1;
    color: white;

    &:hover:not(:disabled) {
      background-color: #4f46e5;
    }

    &:focus {
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.4);
    }
  `,
  secondary: css`
    background-color: #6b7280;
    color: white;

    &:hover:not(:disabled) {
      background-color: #4b5563;
    }

    &:focus {
      box-shadow: 0 0 0 2px rgba(107, 114, 128, 0.4);
    }
  `,
  outline: css`
    background-color: transparent;
    color: #6366f1;
    border: 1px solid #6366f1;

    &:hover:not(:disabled) {
      background-color: rgba(99, 102, 241, 0.05);
    }

    &:focus {
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.4);
    }
  `,
  ghost: css`
    background-color: transparent;
    color: #6b7280;

    &:hover:not(:disabled) {
      background-color: rgba(107, 114, 128, 0.1);
    }

    &:focus {
      box-shadow: 0 0 0 2px rgba(107, 114, 128, 0.4);
    }
  `,
};

// Button sizes
const sizes = {
  sm: css`
    height: 2rem;
    padding: 0 0.75rem;
    font-size: 0.875rem;
  `,
  md: css`
    height: 2.5rem;
    padding: 0 1rem;
    font-size: 1rem;
  `,
  lg: css`
    height: 3rem;
    padding: 0 1.5rem;
    font-size: 1.125rem;
  `,
};

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 150ms ease;
  cursor: pointer;
  border: none;
  outline: none;

  ${props => variants[props.variant || 'primary']}
  ${props => sizes[props.size || 'md']}
  
  ${props =>
    props.fullWidth &&
    css`
      width: 100%;
    `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* If button has left icon, add spacing */
  & > svg:first-child:not(:last-child) {
    margin-right: 0.5rem;
  }

  /* If button has right icon, add spacing */
  & > svg:last-child:not(:first-child) {
    margin-left: 0.5rem;
  }
`;

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  onClick,
  disabled = false,
  type = 'button',
  ...rest
}) => {
  return (
    <StyledButton
      type={type}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
