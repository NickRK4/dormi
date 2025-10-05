import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import TinderCard from 'react-tinder-card';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabaseClient';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f7fa;
  overflow: hidden;
  padding: 20px;
`;

const CardContainer = styled.div`
  width: 500px;
  max-width: 80vw;
  height: 400px;
  position: relative;
  margin-bottom: 40px;
`;

// Add styling to the TinderCard wrapper
const StyledTinderCard = styled(TinderCard)`
  position: absolute;
  width: 100%;
  height: 100%;
`;

const Card = styled.div`
  position: absolute;
  background-color: white;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(255, 10, 10, 0.15);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
  text-align: center;
`;

const Question = styled.h2`
  color: #424242;
  margin-bottom: 20px;
`;

const Progress = styled.div`
  position: absolute;
  bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 5px;
`;

const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.$active ? '#ff4458' : '#ddd'};
  transition: background-color 0.3s;
`;

const Instructions = styled.div`
  margin-top: 40px;
  display: flex;
  justify-content: space-between;
  width: 500px;
  max-width: 80vw;
`;

const Instruction = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const InstructionText = styled.p`
  margin-top: 5px;
  color: ${props => props.$color};
  font-weight: 600;
`;

const KeyIcon = styled.div`
  padding: 8px 12px;
  border: 2px solid ${props => props.$color};
  border-radius: 5px;
  color: ${props => props.$color};
  font-weight: bold;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #424242;
`;

const ErrorMessage = styled.div`
  color: #ff4458;
  background-color: #fff0f0;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
  max-width: 80%;
`;

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, userType, updateProfileStatus } = useAuth();
  const navigate = useNavigate();
  
  // Fetch questions from Supabase
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        
        // Get questions from the database
        const { data, error } = await supabase
          .from('questions')
          .select('id, question_text')
          .order('id', { ascending: true });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setQuestions(data);
        } else {
          throw new Error('No questions found');
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, []);
  
  // Handle key presses for swiping
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (questions.length === 0 || currentQuestionIndex >= questions.length) return;
    
      if (e.key === 'ArrowLeft') {
        handleSwipe('left');
      } else if (e.key === 'ArrowRight') {
        handleSwipe('right');
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestionIndex, questions]);
  
  
  // Save questionnaire responses and navigate to appropriate page
  const markQuestionnaireCompleted = async () => {
    try {
      // Create a binary string representation of the answers
      // First get all questions sorted by ID to ensure consistent ordering
      const sortedQuestions = [...questions].sort((a, b) => a.id - b.id);
      let binaryString = '';
      
      // Build the binary string
      sortedQuestions.forEach(question => {
        const answer = answers[question.id];
        // Append '1' for Yes (true) and '0' for No (false)
        binaryString += answer ? '1' : '0';
      });
      
      // Save the binary string to the binary_responses table
      await supabase
        .from('binary_responses')
        .upsert({
          user_id: currentUser.id,
          response_string: binaryString
        }, { onConflict: ['user_id'] });
      
      // Then update the profile to mark questionnaire as completed
      await updateProfileStatus({ questionnaireCompleted: true });
      
      // Navigate to proper page based on user type
      if (userType === 'rent') {
        navigate('/matches');
      } else {
        navigate('/matches'); // Sublease users will see the dashboard in the Matches component
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      // Continue despite errors to allow user to progress
    }
  };
  
  const handleSwipe = async (direction) => {
    if (questions.length === 0) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const response = direction === 'right'; // right = true (yes), left = false (no)
    
    // Save to local state
    const newAnswers = { ...answers };
    newAnswers[currentQuestion.id] = response;
    setAnswers(newAnswers);
    
 
    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, mark questionnaire as completed and navigate
      await markQuestionnaireCompleted();
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <h2>Loading questions...</h2>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <LoadingContainer>
          <h2>Something went wrong</h2>
          <ErrorMessage>{error}</ErrorMessage>
        </LoadingContainer>
      </Container>
    );
  }

  if (questions.length === 0) {
    return (
      <Container>
        <LoadingContainer>
          <h2>No questions available</h2>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <CardContainer>
        {currentQuestionIndex < questions.length && (
          <StyledTinderCard
            preventSwipe={['up', 'down']}
            onSwipe={handleSwipe}
            key={currentQuestionIndex}
          >
            <Card>
              <Question>{questions[currentQuestionIndex].question_text}</Question>
              <Progress>
                {questions.map((_, index) => (
                  <Dot 
                    key={index} 
                    $active={index <= currentQuestionIndex} 
                  />
                ))}
              </Progress>
            </Card>
          </StyledTinderCard>
        )}
      </CardContainer>
      
      <Instructions>
        <Instruction>
          <KeyIcon $color="#ff3b5c">←</KeyIcon>
          <InstructionText $color="#ff3b5c">Swipe Left for No</InstructionText>
        </Instruction>
        <Instruction>
          <KeyIcon $color="#26de81">→</KeyIcon>
          <InstructionText $color="#26de81">Swipe Right for Yes</InstructionText>
        </Instruction>
      </Instructions>
    </Container>
  );
};

export default Questions;
