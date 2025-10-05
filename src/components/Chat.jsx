import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabaseClient';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin-right: 15px;
  color: #ff4458;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfileImage = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-image: url(${props => props.src || 'https://placehold.co/40x40'});
  background-size: cover;
  background-position: center;
  margin-right: 15px;
`;

const ChatName = styled.h2`
  margin: 0;
  color: #333;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 18px;
  margin-bottom: 10px;
  word-wrap: break-word;
  background-color: ${props => props.$sent ? '#ff4458' : 'white'};
  color: ${props => props.$sent ? 'white' : '#333'};
  align-self: ${props => props.$sent ? 'flex-end' : 'flex-start'};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const Timestamp = styled.div`
  font-size: 12px;
  color: ${props => props.$sent ? 'rgba(255, 255, 255, 0.7)' : '#999'};
  margin-top: 5px;
  text-align: right;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: white;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 25px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #ff4458;
  }
`;

const SendButton = styled.button`
  background-color: #ff4458;
  color: white;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  margin-left: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;

  &:hover {
    background-color: #e5394d;
  }

  &:disabled {
    background-color: #ffa4ae;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 18px;
  color: #333;
`;

const ErrorMessage = styled.div`
  color: #ff4458;
  text-align: center;
  margin: 10px 0;
  padding: 10px 15px;
  background-color: #fff0f0;
  border-radius: 5px;
`;

// Function to format timestamp
const formatTime = (date) => {
  if (!date) return '';
  
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const Chat = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [match, setMatch] = useState(null);
  const [matchedUser, setMatchedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Ref to the end of messages container
  const messagesEndRef = useRef(null);
  
  // Fetch match details and messages
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchMatchAndMessages = async () => {
      try {
        setLoading(true);
        
        // Get match details
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select('*')
          .eq('id', matchId)
          .single();
        
        if (matchError) throw matchError;
        if (!matchData) throw new Error('Match not found');
        
        setMatch(matchData);
        
        // Determine which user is the matched user
        const otherUserId = matchData.user1_id === currentUser.id 
          ? matchData.user2_id 
          : matchData.user1_id;
        
        // Get matched user details
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', otherUserId)
          .single();
        
        if (userError) throw userError;
        setMatchedUser(userData);
        
        // Get messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('match_id', matchId)
          .order('created_at', { ascending: true });
        
        if (messagesError) throw messagesError;
        setMessages(messagesData || []);
        
        // Mark messages as read
        markMessagesAsRead(matchData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching chat data:', err);
        setError('Failed to load chat. Please try again.');
        setLoading(false);
      }
    };
    
    fetchMatchAndMessages();
    
    // Subscribe to real-time messages
    const messagesSubscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `match_id=eq.${matchId}`
      }, (payload) => {
        setMessages(previous => [...previous, payload.new]);
      })
      .subscribe();
    
    // Update message read status
    const markMessagesAsRead = async (matchData) => {
      if (!matchData) return;
      
      try {
        const { error } = await supabase
          .from('messages')
          .update({ read: true })
          .eq('match_id', matchId)
          .eq('sender_id', currentUser.id === matchData.user1_id ? matchData.user2_id : matchData.user1_id)
          .eq('read', false);
          
        if (error) throw error;
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    };
    
    return () => {
      // Clean up subscriptions
      supabase.removeChannel(messagesSubscription);
    };
  }, [matchId, currentUser]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;
    
    try {
      // Create message object with temporary ID
      const tempMessage = {
        id: 'temp-' + Date.now(),
        match_id: matchId,
        sender_id: currentUser.id,
        content: newMessage.trim(),
        read: false,
        created_at: new Date().toISOString()
      };
      
      // Immediately add to UI for responsive feedback
      setMessages(previous => [...previous, tempMessage]);
      
      // Clear the input
      setNewMessage('');
      
      // Actual database insert
      const { data, error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: currentUser.id,
          content: newMessage.trim(),
          read: false
        })
        .select();
      
      if (error) throw error;
      
      // If we want to replace the temp message with the real one from DB
      // This step is optional since the real-time subscription should update it
      if (data && data.length > 0) {
        setMessages(previous => 
          previous.map(msg => msg.id === tempMessage.id ? data[0] : msg)
        );
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      
      // Remove the temporary message if there was an error
      setMessages(previous => 
        previous.filter(msg => !msg.id.toString().startsWith('temp-'))
      );
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        Loading chat...
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate('/matches')}>
            <ArrowBackIcon />
          </BackButton>
          <ChatName>Error</ChatName>
        </Header>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  if (!match || !matchedUser) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate('/matches')}>
            <ArrowBackIcon />
          </BackButton>
          <ChatName>Chat not found</ChatName>
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/chats')}>
          <ArrowBackIcon />
        </BackButton>
        <ProfileImage src={matchedUser.avatar_url} />
        <ChatName>{matchedUser.full_name}</ChatName>
      </Header>
      
      <MessagesContainer>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', margin: '20px 0', color: '#666' }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          // converts each message to a MessageBubble component using map function
          messages.map((message) => (
            <MessageBubble 
            // id keeps track of which components have been updated
              key={message.id} 
              $sent={message.sender_id === currentUser.id}
            >
              {message.content}
              <Timestamp $sent={message.sender_id === currentUser.id}>
                {formatTime(message.created_at)}
              </Timestamp>
            </MessageBubble>
          ))
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputContainer>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <SendButton 
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <SendIcon />
        </SendButton>
      </InputContainer>
    </Container>
  );
};

export default Chat;
