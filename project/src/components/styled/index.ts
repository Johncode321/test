import styled from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: 20px;
`;

export const Card = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 560px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);

  h1 {
    color: #1a1a1a;
    margin: 0 0 24px;
    font-size: 28px;
    text-align: center;
  }

  h2 {
    color: #2d2d2d;
    margin: 24px 0 16px;
    font-size: 20px;
  }
`;

export const Button = styled.button<{ primary?: boolean }>`
  background: ${props => props.primary ? '#512da8' : '#424242'};
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  margin: 8px 0;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.primary ? '#311b92' : '#616161'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #9e9e9e;
    cursor: not-allowed;
    transform: none;
  }
`;

export const IconButton = styled.button`
  background: transparent;
  border: none;
  color: #512da8;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(81, 45, 168, 0.1);
  }

  &:active {
    background: rgba(81, 45, 168, 0.2);
  }
`;

export const Input = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  margin: 8px 0 16px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #512da8;
  }

  &::placeholder {
    color: #9e9e9e;
  }
`;

export const WalletInfo = styled.div`
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin: 16px 0;

  h2 {
    margin-top: 0;
  }

  p {
    margin: 8px 0;
    color: #424242;
    
    &.address {
      word-break: break-all;
      font-family: monospace;
      font-size: 14px;
    }

    strong {
      color: #1a1a1a;
    }
  }
`;

export const SignatureDisplay = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;

  h3 {
    margin: 0 0 8px;
    color: #2d2d2d;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  p {
    margin: 0;
    color: #512da8;
    word-break: break-all;
    font-family: monospace;
    font-size: 14px;
    background: #ffffff;
    padding: 12px;
    border-radius: 4px;
    border: 1px solid #e9ecef;
  }
`;