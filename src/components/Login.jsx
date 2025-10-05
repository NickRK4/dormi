import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabaseClient';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f7fa;
`;

const LoginCard = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 350px;
`;

const Title = styled.h1`
  text-align: center;
  color: #ff4458;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  margin: 20px 0 10px;
  background-color: #ff4458;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #e5394d;
  }
`;

const ErrorText = styled.p`
  color: #ff4458;
  text-align: center;
`;

const ToggleText = styled.p`
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
`;

const ToggleLink = styled.span`
  color: #ff4458;
  cursor: pointer;
  font-weight: bold;
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (isRegistering && !fullName) {
      setError('Please enter your full name');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      if (isRegistering) {
        await signUp(email, password, fullName);
        setError('');
        // Switch to login view after registration
        setIsRegistering(false);
        setLoading(false);
        setError('Registration successful! Please check your email to confirm your account.');
      } else {
        const data = await login(email, password);
        
        if (!data || !data.user) {
          throw new Error('Login failed');
        }
        
        // After successful login, check the user profile to determine where to navigate
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_type, profile_completed, questionnaire_completed')
          .eq('id', data.user.id)
          .single();
        
        if (profileData && profileData.user_type && profileData.profile_completed && profileData.questionnaire_completed) {
          // User has completed their profile - direct to appropriate page
          navigate('/matches');
        } else if (profileData && profileData.user_type) {
          // User has a type but not complete profile - let PrivateRoute handle it
          navigate('/');
        } else {
          // New user or user without type - send to user-type selection
          navigate('/user-type');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Title>Dormi</Title>
        {error && <ErrorText>{error}</ErrorText>}
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <Input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Processing...' : isRegistering ? 'Sign Up' : 'Log In'}
          </Button>
        </form>
        <ToggleText>
          {isRegistering ? 'Already have an account? ' : 'Need an account? '}
          <ToggleLink onClick={toggleMode}>
            {isRegistering ? 'Log In' : 'Sign Up'}
          </ToggleLink>
        </ToggleText>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
