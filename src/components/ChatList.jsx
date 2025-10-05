import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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

const Title = styled.h1`
  margin: 0;
  color: #ff4458;
`;

const ChatsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 20px;
`;

const ChatItem = styled.div`
  margin-top: 10px;
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  background-color: white;
  cursor: pointer;
  transition: background-color 0.3s;
  border-radius: 10px;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #f9f9f9;
  }
`;

const ProfileImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-image: url(${props => props.src || 'https://placehold.co/60x60'});
  background-size: cover;
  background-position: center;
  margin-right: 15px;
  flex-shrink: 0;
`;

const ChatDetails = styled.div`
  flex: 1;
  min-width: 0; /* Allows text to truncate correctly */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
`;

const ChatName = styled.h3`
  margin: 0 0 0px 0;
  color: #333;
  display: flex;
  align-items: center;
  width: 100%;
`;

const LastMessage = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
  text-align: left;
  align-self: flex-start;
`;

const MessageTime = styled.span`
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  align-self: flex-start;
  margin-left: auto;
  padding-left: 10px;
  flex-shrink: 0;
`;

const NoChats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
`;

const NoChatsText = styled.h2`
  color: #ff4458;
  margin-bottom: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #ff4458;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #e5394d;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 18px;
  color: #666;
`;

const UnreadIndicator = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ff4458;
  margin-left: 10px;
`;

// Function to format timestamp
const formatTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const messageDate = new Date(date);
  
  // If the message was sent today
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // If the message was sent within the last week
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);
  
  if (messageDate > oneWeekAgo) {
    return messageDate.toLocaleDateString([], {
      weekday: 'short'
    });
  }
  
  // Otherwise, return the date
  return messageDate.toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  });
};

const ChatList = () => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchChats = async () => {
      try {
        setLoading(true);
        
        // Get all matches for the current user
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select('*')
          .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`);
        
        if (matchesError) throw matchesError;
        
        if (!matchesData || matchesData.length === 0) {
          setChats([]);
          setLoading(false);
          return;
        }
        
        // Get latest message and user info for each match
        const chatPromises = matchesData.map(async (match) => {
          // Get the other user's ID
          const otherUserId = match.user1_id === currentUser.id 
            ? match.user2_id 
            : match.user1_id;
          
          // Get the other user's profile
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherUserId)
            .single();
          
          if (userError) throw userError;
          
          // Get the latest message for this match
          const { data: messageData, error: messageError } = await supabase
            .from('messages')
            .select('*')
            .eq('match_id', match.id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (messageError) throw messageError;
          
          // Get unread message count
          const { data: unreadData, error: unreadError } = await supabase
            .from('messages')
            .select('id', { count: 'exact' })
            .eq('match_id', match.id)
            .eq('sender_id', otherUserId)
            .eq('read', false);
            
          if (unreadError) throw unreadError;
          
          return {
            id: match.id,
            otherUser: userData,
            // use [0] because of how messages are ordered in the database
            lastMessage: messageData?.[0] || null,
            unreadCount: unreadData?.length || 0
          };
        });
        
        const chatResults = await Promise.all(chatPromises);
        
        // Filter out any matches without messages
        const chatsWithMessages = chatResults
          .filter(chat => chat.lastMessage)
          .sort((a, b) => {
            const dateA = new Date(a.lastMessage?.created_at || 0);
            const dateB = new Date(b.lastMessage?.created_at || 0);
            return dateB - dateA; // Sort by most recent message
          });
        setChats(chatsWithMessages);
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChats();
    
    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages'
      }, (payload) => {
        // Update the chat list when a new message is received
        fetchChats();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  }, [currentUser]);
  
  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Messages</Title>
        </Header>
        <LoadingContainer>
          Loading chats...
        </LoadingContainer>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/matches')}>
          <ArrowBackIcon />
        </BackButton>
        <Title>Messages</Title>
      </Header>
      
      <ChatsList>
        {chats.length > 0 ? (
          chats.map((chat) => (
            <ChatItem 
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
            >
              <ProfileImage src={chat.otherUser.avatar_url} />
              <ChatDetails>
                <ChatName>
                  {chat.otherUser.full_name}
                  {chat.unreadCount > 0 && <UnreadIndicator />}
                </ChatName>
                <LastMessage>
                  {chat.lastMessage?.content || ''}
                </LastMessage>
              </ChatDetails>
              <MessageTime>
                {formatTime(chat.lastMessage?.created_at)}
              </MessageTime>
            </ChatItem>
          ))
        ) : (
          <NoChats>
            <NoChatsText>No Messages Yet</NoChatsText>
            <p>Match with potential roommates to start chatting!</p>
            <Button onClick={() => navigate('/matches')}>
              Find Roommates
            </Button>
          </NoChats>
        )}
      </ChatsList>
    </Container>
  );
};

export default ChatList;
