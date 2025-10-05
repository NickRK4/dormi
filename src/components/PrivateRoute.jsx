import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Component to protect routes that require authentication
const PrivateRoute = ({ children }) => {
  const { 
    currentUser, 
    userType, 
    loading, 
    profileCompleted, 
    questionnaireCompleted 
  } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Current path is already login, no need to redirect
  if (location.pathname === '/login') {
    return children;
  }

  // If the user has completed everything (has a type, completed questionnaire and profile)
  if (userType && questionnaireCompleted && profileCompleted) {
    // Allow navigation to chat-related routes
    if (location.pathname.startsWith('/chat') || location.pathname === '/chats') {
      return children;
    }
    
    // For completed users, direct to their appropriate destination if not on matches
    if (location.pathname !== '/matches') {
      return <Navigate to="/matches" />;
    }
    
    // If they're already on the right page, just show the children
    return children;
  }

  // User hasn't selected a type yet
  if (!userType && location.pathname !== '/user-type') {
    return <Navigate to="/user-type" />;
  }

  // User has selected a type but hasn't completed questionnaire
  if (userType && !questionnaireCompleted && location.pathname !== '/questions') {
    return <Navigate to="/questions" />;
  }

  // Questionnaire is completed but not profile
  if (userType && questionnaireCompleted && !profileCompleted) {
    if (userType === 'rent' && location.pathname !== '/additional-rent') {
      return <Navigate to="/additional-rent" />;
    } else if (userType === 'sublease' && location.pathname !== '/additional-sublease') {
      return <Navigate to="/additional-sublease" />;
    }
  }

  return children;
};

export default PrivateRoute;
