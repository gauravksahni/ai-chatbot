import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: ${props => (props.marginBottom ? props.marginBottom : '1rem')};
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.375rem;
`;

const ErrorMessage = styled.div`
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.375rem;
`;

const HelperText = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.375rem;
`;

// Input sizes
const sizes = {
  sm: css`
    height: 2rem;
    padding: 0 0.75rem;
    font-size: 0.875rem;
  `,
  md: css`
    height: 2.5rem;
    padding: 0 0.875rem;
    font-size: 1rem;
  `,
  lg: css`
    height: 3rem;
    padding: 0 1rem;
    font-size: 1.125rem;
  `,
};

const inputStyles = css`
  display: block;
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: #ffffff;
  transition: all 150ms ease;

  /* Apply sizes */
  ${props => sizes[props.size || 'md']}

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }

  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
    opacity: 0.7;
  }

  ${props =>
    props.error &&
    css`
      border-color: #ef4444;

      &:focus {
        border-color: #ef4444;
        box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
      }
    `}
`;

const StyledInput = styled.input`
  ${inputStyles}
`;

const StyledTextarea = styled.textarea`
  ${inputStyles}
  min-height: 6rem;
  resize: ${props => (props.resize ? props.resize : 'vertical')};
`;

const Input = forwardRef(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      type = 'text',
      multiline = false,
      rows = 4,
      resize = 'vertical',
      marginBottom,
      ...rest
    },
    ref
  ) => {
    return (
      <InputWrapper marginBottom={marginBottom}>
        {label && <Label>{label}</Label>}

        {multiline ? (
          <StyledTextarea
            ref={ref}
            size={size}
            error={error}
            rows={rows}
            resize={resize}
            {...rest}
          />
        ) : (
          <StyledInput ref={ref} type={type} size={size} error={error} {...rest} />
        )}

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {helperText && <HelperText>{helperText}</HelperText>}
      </InputWrapper>
    );
  }
);

Input.displayName = 'Input';

export default Input;
