import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f7fa;
`;

const Card = styled.div`
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 450px;
  text-align: center;
`;

const Title = styled.h1`
  color: #ff4458;
  margin-bottom: 30px;
`;

const Question = styled.h2`
  color: #424242;
  margin-bottom: 40px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
`;

const Button = styled.button`
  flex: 1;
  padding: 15px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: ${props => props.$primary ? '#ff4458' : 'white'};
  color: ${props => props.$primary ? 'white' : '#ff4458'};
  border: 2px solid ${props => props.$primary ? 'transparent' : '#ff4458'};

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background-color: ${props => props.$primary ? '#e5394d' : '#fff2f3'};
  }
`;

const UserType = () => {
  const { setType } = useAuth();
  const navigate = useNavigate();

  const handleTypeSelection = (type) => {
    setType(type);
    navigate('/questions');
  };

  return (
    <Container>
      <Card>
        <Title>Dormi</Title>
        <Question>Are you looking to:</Question>
        <ButtonsContainer>
          <Button $primary onClick={() => handleTypeSelection('rent')}>
            Rent
          </Button>
          <Button onClick={() => handleTypeSelection('sublease')}>
            Sublease
          </Button>
        </ButtonsContainer>
      </Card>
    </Container>
  );
};

export default UserType;
