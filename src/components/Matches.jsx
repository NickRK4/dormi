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
  justify-content: flex-start;
  height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
  box-sizing: border-box;
`;

const SubletterContainer = styled(Container)`
  justify-content: flex-start;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  width: 100%;
  margin-top: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 10px 20px;
`;

const Title = styled.h1`
  color: #ff4458;
  margin: 0;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
`;

const SignOutButton = styled.button`
  cursor: pointer;
  background: none;
  margin-left: 20px;
  border: 1px solid #ff4458;
  color: #ff4458;
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: bold;
  transition: all 0.3s;
  margin-right: 10px;

  &:hover {
    background-color: #ff4458;
    color: white;
  }
`;

const MessagesButton = styled.div`
  cursor: pointer;
  background-color: #ff4458;
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: bold;
  transition: background-color 0.3s;

  &:hover {
    background-color: #e5394d;
  }
`;

const CardContainer = styled.div`
  width: 600px;
  max-width: 90vw;
  height: 65vh;
  position: relative;
`;

const Card = styled.div`
  position: absolute;
  background-color: white;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background-size: cover;
  background-position: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const CardInfo = styled.div`
  position: absolute;
  bottom: 0;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  border-radius: 0 0 20px 20px;
  color: white;
`;

const Name = styled.h2`
  margin: 0 0 5px 0;
  font-size: 28px;
`;

const Bio = styled.p`
  margin: 0;
  font-size: 18px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Details = styled.div`
  display: flex;
  margin-top: 10px;
  gap: 15px;
  flex-wrap: wrap;
`;

const Detail = styled.div`
  background-color: rgba(255, 255, 255, 0.2);
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 14px;
`;

const NoMatches = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 65vh;
  background-color: transparent;
  border-radius: 20px;
  padding: 20px;
  text-align: center;
`;

const NoMatchesText = styled.h2`
  color: #ff4458;
`;

const Instructions = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  max-width: 600px;
  margin: 20px 0;
`;

const Instruction = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Circle = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  font-size: 24px;
  color: ${props => props.$color};
`;

const InstructionText = styled.p`
  margin: 0;
  color: #666;
  font-weight: 500;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 65vh;
  background-color: transparent;
  border-radius: 20px;
  padding: 20px;
  text-align: center;

`;

const MatchOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  text-align: center;
`;

const MatchText = styled.h1`
  color: white;
  font-size: 48px;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const MatchButton = styled.button`
  padding: 15px 30px;
  background-color: #ff4458;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s;
  box-shadow: 0 2px 10px rgba(255, 68, 88, 0.5);

  &:hover {
    background-color: #e5394d;
  }
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  width: 100%;
  max-width: 600px;
  margin: 20px auto;
  border-bottom: 1px solid #eee;
`;

const Tab = styled.div`
  padding: 10px 20px;
  margin: 0 10px;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.$active ? '#ff4458' : 'transparent'};
  color: ${props => props.$active ? '#ff4458' : '#666'};
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  transition: all 0.3s;
  
  &:hover {
    color: #ff4458;
  }
`;

const Dashboard = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
`;

const DashboardCard = styled.div`
  background-color: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 180px;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
`;

const DashboardValue = styled.div`
  font-size: 36px;
  font-weight: bold;
  color: #ff4458;
  margin-bottom: 10px;
`;

const DashboardLabel = styled.div`
  font-size: 16px;
  color: #666;
`;

const ApplicantList = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

const ApplicantCard = styled.div`
  background-color: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-3px);
  }
`;

const ApplicantAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  margin-right: 20px;
  flex-shrink: 0;
`;

const ApplicantInfo = styled.div`
  flex-grow: 1;
`;

const ApplicantName = styled.h3`
  margin: 0 0 5px 0;
  color: #333;
`;

const ApplicantDetail = styled.div`
  color: #666;
  font-size: 14px;
  margin-bottom: 3px;
`;

const ApplicantDetailsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;

const ApplicantDetailsItem = styled.span`
  background-color: #f5f5f5;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 13px;
`;

const ApplicantModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ApplicantModalContent = styled.div`
  background-color: white;
  padding: 40px;
  border-radius: 20px;
  position: relative;
  width: 90%;
  max-width: 700px;
  height: 850px;
  overflow-y: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const ActionButton = styled.button`
  padding: 12px 0;
  width: 48%;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
`;

const AcceptButton = styled(ActionButton)`
  background-color: #26de81;
  color: white;
  
  &:hover {
    background-color: #20c974;
  }
`;

const DeclineButton = styled(ActionButton)`
  background-color: #ff4458;
  color: white;
  
  &:hover {
    background-color: #e5394d;
  }
`;

const QuestionnaireSection = styled.div`
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 20px;
  width: 100%;
`;

const QuestionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 15px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const QuestionItem = styled.div`
  margin-bottom: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  align-items: center;
`;

const QuestionText = styled.div`
  font-weight: 500;
  font-size: 14px;
  flex: 1;
`;

const AnswerIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 10px;
  font-weight: bold;
  color: white;
  background-color: ${props => props.$isYes ? '#26de81' : '#ff4458'};
`;

const QuestionnaireTitle = styled.h3`
  margin-bottom: 5px;
`;

const QuestionnaireSummary = styled.p`
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
`;

const NoApplicants = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const ExpandButton = styled.button`
  background: rgba(255, 255, 255, 0.3);
  border: none;
  border-radius: 15px;
  padding: 3px 10px;
  font-size: 12px;
  margin-top: 5px;
  cursor: pointer;
  color: white;
  transition: background-color 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;

const PropertyModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PropertyModalContent = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 20px;
  position: relative;
  width: 90%;
  max-width: 700px;
  height: 850px; /* Match the ApplicantModalContent height */
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const CarouselContainer = styled.div`
  width: 100%;
  height: 500px; /* Increase from 400px to maintain proportion */
  position: relative;
  border-radius: 15px;
  overflow: hidden;
`;

const CarouselImage = styled.div`
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
`;

const CarouselButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.4);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  cursor: pointer;
  z-index: 2;
  padding: 0;
  line-height: 1;
  
  &:hover {
    background: rgba(255, 255, 255, 0.8);
  }
  
  &.prev {
    left: 10px;
  }
  
  &.next {
    right: 10px;
  }
`;

const PropertyDescription = styled.div`
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  margin-bottom: 40px;
`;

const PropertyDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const PropertyDetail = styled.div`
  background-color: #f5f5f5;
  padding: 8px 15px;
  border-radius: 15px;
  font-size: 14px;
  color: #333;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  margin-bottom: 10px;
`;

const PageButton = styled.button`
  padding: 10px 15px;
  border: none;
  border-radius: 20px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  background-color: ${props => props.$active ? '#ff4458' : '#f5f5f5'};
  color: ${props => props.$active ? 'white' : '#666'};
`;

const Matches = () => {
  const { currentUser, userType } = useAuth();
  const navigate = useNavigate();
  
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [showButtons, setShowButtons] = useState(true);
  
  // New state for subletter dashboard
  const [pendingApplicants, setPendingApplicants] = useState([]);
  const [acceptedApplicants, setAcceptedApplicants] = useState([]);
  const [activeProperties, setActiveProperties] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [applicantResponses, setApplicantResponses] = useState([]);
  const [applicantPreferences, setApplicantPreferences] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // New state for property detail modal
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [propertyModalPage, setPropertyModalPage] = useState(1);
  const [modalPage, setModalPage] = useState(1);
  const [ownerResponses, setOwnerResponses] = useState([]);

  useEffect(() => {
    if (currentUser) {
      // Log the current user to see its structure
      console.log('Current user in Matches component:', currentUser);
      
      // Check if rental_preferences table exists and its structure
      const checkRentalPreferences = async () => {
        try {
          const { data, error } = await supabase
            .from('rental_preferences')
            .select('*')
            .limit(5);
            
          if (error) {
            console.error('Error checking rental_preferences table:', error);
          } else {
            console.log('Sample rental_preferences data:', data);
          }
        } catch (err) {
          console.error('Exception checking rental_preferences:', err);
        }
      };
      
      checkRentalPreferences();
      
      if (userType === 'rent') {
        fetchMatches();
      } else {
        fetchSubletterDashboard();
      }
    }
  }, [currentUser, userType]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      // Fetch existing matches to exclude them
      const { data: existingMatches, error: matchesError } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`);
        
      if (matchesError) throw matchesError;
      
      // Create a set of user IDs that current user has already matched with
      const matchedUserIds = new Set();
      existingMatches?.forEach(match => {
        if (match.user1_id === currentUser.id) {
          matchedUserIds.add(match.user2_id);
        } else {
          matchedUserIds.add(match.user1_id);
        }
      });
      
      // Add current user to the set
      matchedUserIds.add(currentUser.id);
      
      // Get existing applications to exclude them as well
      const { data: existingApplications, error: applicationsError } = await supabase
        .from('applications')
        .select('sublease_id')
        .eq('applicant_id', currentUser.id);
          
      if (applicationsError) throw applicationsError;
      
      const appliedSubleaseIds = new Set();
      existingApplications?.forEach(app => {
        appliedSubleaseIds.add(app.sublease_id);
      });
      
      let data = [];
      
      if (userType === 'rent') {
        // Users looking to rent should see all sublease offers
        const { data: subleaseData, error: subleaseError } = await supabase
          .from('sublease_offers')
          .select(`
            id,
            price,
            location,
            available_from,
            available_until,
            room_type,
            bathroom_type,
            roommate_count,
            description,
            user_id,
            profiles (
              id,
              full_name,
              avatar_url
            )
          `)
          .not('user_id', 'in', `(${Array.from(matchedUserIds).join(',')})`)
          .not('id', 'in', `(${Array.from(appliedSubleaseIds).length > 0 ? Array.from(appliedSubleaseIds).join(',') : '00000000-0000-0000-0000-000000000000'})`)
          .order('created_at', { ascending: false });
          
        if (subleaseError) throw subleaseError;
        
        // Get images for each sublease
        if (subleaseData && subleaseData.length > 0) {
          const subleaseWithImages = await Promise.all(
            subleaseData.map(async (sublease) => {
              const { data: imageData, error: imageError } = await supabase
                .from('property_images')
                .select('image_url')
                .eq('sublease_id', sublease.id);
                
              if (imageError) throw imageError;
              
              return {
                ...sublease,
                images: imageData?.map(img => img.image_url) || [],
                image_url: imageData?.[0]?.image_url || 'https://picsum.photos/400/400'
              };
            })
          );
          
          data = subleaseWithImages;
        }
      } else if (userType === 'sublease') {
        // Subletters will now have a dashboard instead of swipe feature
        // This code will be replaced with fetchSubletterDashboard
      }
      
      setPotentialMatches(data || []);
      
      // Get unread message count
      const { data: unreadData, error: unreadError } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('read', false)
        .not('sender_id', 'eq', currentUser.id);
          
      if (unreadError) throw unreadError;
      
      setUnreadCount(unreadData?.length || 0);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchSubletterDashboard = async () => {
    try {
      setLoading(true);
      // Fetch active properties
      const { data: properties, error: propertiesError } = await supabase
        .from('sublease_offers')
        .select('id, price, location, available_from, available_until, created_at')
        .eq('user_id', currentUser.id);
        
      if (propertiesError) throw propertiesError;
      
      setActiveProperties(properties || []);

      // Check if there are any properties
      if (!properties || properties.length === 0) {
        setPendingApplicants([]);
        setAcceptedApplicants([]);
        setLoading(false);
        return;
      }
      
      // Fetch pending applications
      const { data: pendingApps, error: pendingError } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          created_at,
          applicant_id,
          sublease_id,
          profiles!applications_applicant_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'pending')
        .in('sublease_id', properties.map(p => p.id));
        
      if (pendingError) throw pendingError;
      
      // For each applicant, fetch their rental preferences separately
      if (pendingApps && pendingApps.length > 0) {
        const pendingWithPrefs = await Promise.all(
          pendingApps.map(async (app) => {
            // Just use the applicant_id directly
            const applicantId = app.applicant_id;
            let prefData = null;
            
            if (applicantId) {
              console.log(`Fetching preferences with applicant_id: ${applicantId}`);
              
              try {
                // First attempt
                const { data, error } = await supabase
                  .from('rental_preferences')
                  .select('*')
                  .eq('user_id', applicantId)
                  .maybeSingle();
                
                console.log('Raw preference query result:', { data, error });
                
                if (error) {
                  console.error('Error fetching preferences:', error);
                } else if (data) {
                  console.log('Successfully found rental preferences:', data);
                  prefData = data;
                } else {
                  console.log('No preferences found with primary query');
                  
                  // Second attempt with different approach
                  try {
                    const { data: altData, error: altError } = await supabase
                      .from('rental_preferences')
                      .select('*')
                      .filter('user_id', 'eq', applicantId)
                      .limit(1);
                    
                    if (altError) {
                      console.error('Error with alternative query:', altError);
                    } else if (altData && altData.length > 0) {
                      console.log('Found preferences with alternative query:', altData[0]);
                      prefData = altData[0];
                    } else {
                      console.log('Still no preferences found');
                    }
                  } catch (innerErr) {
                    console.error('Inner query error:', innerErr);
                  }
                }
              } catch (err) {
                console.error('Main query error:', err);
              }
            }
            
            // Default fallback if no preferences were found
            if (!prefData) {
              prefData = {
                budget_min: 500,
                budget_max: 1500,
                move_in_date: new Date().toISOString().split('T')[0],
                lease_duration: 12,
                roommate_count: 1,
                location: 'Not specified',
                description: 'No additional details provided'
              };
            }
            
            // Return the application with preferences
            return {
              ...app,
              rental_preferences: prefData
            };
          })
        );
        
        setPendingApplicants(pendingWithPrefs);
      } else {
        setPendingApplicants([]);
      }
      
      // Fetch accepted applications
      const { data: acceptedApps, error: acceptedError } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          created_at,
          applicant_id,
          sublease_id,
          profiles!applications_applicant_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'accepted')
        .in('sublease_id', properties.map(p => p.id));
        
      if (acceptedError) throw acceptedError;
      
      // For each accepted applicant, fetch their match for direct chat access
      if (acceptedApps && acceptedApps.length > 0) {
        const acceptedWithMatches = await Promise.all(
          acceptedApps.map(async (app) => {
            // Find the match between the current user and the applicant
            let matchId = null;
            
            // Try first combination (current user is user1)
            const { data: matchData1, error: matchError1 } = await supabase
              .from('matches')
              .select('id')
              .eq('user1_id', currentUser.id)
              .eq('user2_id', app.applicant_id);
              
            if (matchError1) {
              console.error('Error fetching match (combination 1):', matchError1);
            } else if (matchData1 && matchData1.length > 0) {
              matchId = matchData1[0].id;
              console.log('Found match (combination 1):', matchId);
            } else {
              // Try second combination (current user is user2)
              const { data: matchData2, error: matchError2 } = await supabase
                .from('matches')
                .select('id')
                .eq('user1_id', app.applicant_id)
                .eq('user2_id', currentUser.id);
                
              if (matchError2) {
                console.error('Error fetching match (combination 2):', matchError2);
              } else if (matchData2 && matchData2.length > 0) {
                matchId = matchData2[0].id;
                console.log('Found match (combination 2):', matchId);
              }
            }
            
            return {
              ...app,
              match_id: matchId
            };
          })
        );
        
        setAcceptedApplicants(acceptedWithMatches);
      } else {
        setAcceptedApplicants([]);
      }
      
      // Get unread message count
      const { data: unreadData, error: unreadError } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('read', false)
        .not('sender_id', 'eq', currentUser.id);
        
      if (unreadError) throw unreadError;
      
      setUnreadCount(unreadData?.length || 0);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching subletter dashboard:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const createMatch = async (userId) => {
    try {
      // Create a new match
      const { data, error } = await supabase
        .from('matches')
        .insert({
          user1_id: currentUser.id,
          user2_id: userId
        })
        .select();
      
      if (error) throw error;
      
      return data[0];
    } catch (err) {
      console.error('Error creating match:', err);
      return null;
    }
  };

  const createApplication = async (subleaseId) => {
    try {
      // Create the application record
      const { data, error } = await supabase
        .from('applications')
        .insert([
          {
            applicant_id: currentUser.id,
            sublease_id: subleaseId,
            status: 'pending'
          }
        ])
        .select();

      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error('Error creating application:', err);
      throw err;
    }
  };

  const handleSwipe = async (direction, match) => {
    try {
      if (direction === 'right') {
        await createApplication(match.id);
      }
      
      // Remove the property from potential matches
      setPotentialMatches(prev => prev.filter(m => m.id !== match.id));
    } catch (err) {
      console.error('Error handling swipe:', err);
    }
  };

  const handleApplicantClick = async (applicant) => {
    try {
      setSelectedApplicant(applicant);
      
      // Log the full applicant object to see its structure
      console.log('Full applicant object:', applicant);
      
      // Directly fetch rental preferences using the applicant_id
      if (applicant && applicant.applicant_id) {
        const applicantId = applicant.applicant_id;
        console.log('Directly querying rental_preferences for applicant ID:', applicantId);
        
        // First attempt with standard query
        try {
          const { data, error } = await supabase
            .from('rental_preferences')
            .select('*')
            .eq('user_id', applicantId)
            .maybeSingle();
          
          console.log('Raw preference query result:', { data, error });
          
          if (error) {
            console.error('Error fetching preferences:', error);
          } else if (data) {
            console.log('Successfully found rental preferences:', data);
            setSelectedApplicant({
              ...applicant,
              rental_preferences: data
            });
            setApplicantPreferences(data);
          } else {
            console.log('No preferences found with primary query');
            
            // Fallback to alternative query
            const { data: altData, error: altError } = await supabase
              .from('rental_preferences')
              .select('*')
              .filter('user_id', 'eq', applicantId)
              .limit(1);
            
            if (altError) {
              console.error('Error with alternative query:', altError);
            } else if (altData && altData.length > 0) {
              console.log('Found preferences with alternative query:', altData[0]);
              setApplicantPreferences(altData[0]);
            } else {
              console.log('No preferences found with any query method');
              setApplicantPreferences({
                budget_min: 500,
                budget_max: 1500,
                move_in_date: new Date().toISOString().split('T')[0],
                lease_duration: 12,
                roommate_count: 1,
                location: 'Not specified',
                description: 'No additional details provided'
              });
            }
          }
        } catch (err) {
          console.error('Error in preferences fetch:', err);
          setApplicantPreferences({
            budget_min: 500,
            budget_max: 1500,
            move_in_date: new Date().toISOString().split('T')[0],
            lease_duration: 12,
            roommate_count: 1,
            location: 'Not specified',
            description: 'No additional details provided'
          });
        }
      }
      
      // Create a set of common yes/no questions for roommates
      const commonQuestions = [
        { id: 1, question: "Do you smoke?" },
        { id: 2, question: "Are you okay with pets?" },
        { id: 3, question: "Do you prefer a quiet living environment?" },
        { id: 4, question: "Are you a night owl?" },
        { id: 5, question: "Do you cook regularly?" },
        { id: 6, question: "Are you comfortable sharing food/groceries?" },
        { id: 7, question: "Do you clean regularly?" },
        { id: 8, question: "Are you a student?" },
        { id: 9, question: "Do you work from home?" },
        { id: 10, question: "Are you comfortable with guests?" },
        { id: 11, question: "Do you have allergies?" },
        { id: 12, question: "Do you have a car?" },
        { id: 13, question: "Do you play musical instruments?" },
        { id: 14, question: "Are you okay with shared bathrooms?" },
        { id: 15, question: "Do you prefer to socialize with roommates?" },
        { id: 16, question: "Are you planning to stay long-term (>1 year)?" },
        { id: 17, question: "Are you okay with roommates using your appliances?" },
        { id: 18, question: "Do you have furniture to bring?" },
        { id: 19, question: "Do you have specific dietary restrictions?" },
        { id: 20, question: "Are you comfortable with overnight guests?" }
      ];
      
      // Determine the correct user ID to use
      const applicantId = applicant.applicant_id;
      console.log('Using applicant_id for queries:', applicantId);
      
      // Fetch binary response string from the database
      const { data: binaryData, error: binaryError } = await supabase
        .from('binary_responses')
        .select('response_string')
        .eq('user_id', applicantId)
        .single();
        
      let responses = [];
      
      if (binaryError || !binaryData || !binaryData.response_string) {
        console.error('Error fetching binary responses:', binaryError);
        // Generate default responses if binary data is not available
        responses = commonQuestions.map(q => ({
          question: q.question,
          answer: 'No data',
          isYes: false
        }));
      } else {
        // Convert binary string to response objects
        const binaryString = binaryData.response_string;
        responses = commonQuestions.map((q, index) => {
          // Make sure we don't access beyond the string length
          const isYes = index < binaryString.length ? binaryString[index] === '1' : false;
          return {
            question: q.question,
            answer: isYes ? 'Yes' : 'No',
            isYes: isYes
          };
        });
      }
      
      setApplicantResponses(responses);
      setShowApplicantModal(true);
    } catch (err) {
      console.error('Error fetching applicant details:', err);
    }
  };

  const handleApplicationAction = async (action) => {
    try {
      if (!selectedApplicant) return;
      
      // Update application status
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: action })
        .eq('id', selectedApplicant.id);
        
      if (updateError) throw updateError;
      
      if (action === 'accepted') {
        // Create a new match in the matches table without created_at field
        // The database will handle this with default values
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .insert([
            {
              user1_id: currentUser.id,
              user2_id: selectedApplicant.applicant_id
              // Let the database handle created_at with its default value
            }
          ])
          .select();
          
        if (matchError) throw matchError;
        
        if (matchData && matchData.length > 0) {
          const match = matchData[0];
          
          // Create a welcome message without created_at field
          // The database will handle this with default values
          const { error: messageError } = await supabase
            .from('messages')
            .insert([
              {
                match_id: match.id,
                sender_id: currentUser.id,
                content: `Hi! I've accepted your application for my property. Let's chat about the details!`,
                read: false
                // Let the database handle created_at with its default value
              }
            ]);
          
          if (messageError) throw messageError;
          
          // Close the modal
          setShowApplicantModal(false);
          setSelectedApplicant(null);
          
          // Navigate to the chat
          console.log('Navigating to chat with match ID:', match.id);
          navigate(`/chat/${match.id}`);
          return; // Exit early since we're navigating away
        }
      }
      
      // Close the modal and refresh the data (only for declined or if match creation failed)
      setShowApplicantModal(false);
      setSelectedApplicant(null);
      fetchSubletterDashboard();
    } catch (err) {
      console.error(`Error ${action === 'accepted' ? 'accepting' : 'declining'} application:`, err);
      alert(`There was an error ${action === 'accepted' ? 'accepting' : 'declining'} this application. Please try again.`);
    }
  };

  const handleMatchClick = () => {
    setShowMatch(false);
    if (currentMatch) {
      navigate('/chats');
    }
  };

  const navigateToChatList = () => {
    console.log('Navigating to chat list');
    navigate('/chats');
  };

  const handleShowPropertyDetails = (event, match) => {
    event.stopPropagation(); // Prevent the card from swiping
    setSelectedProperty(match);
    setCurrentImageIndex(0);
    setPropertyModalPage(1); // Reset to page 1 when opening modal
    setShowPropertyModal(true);
    
    // Fetch owner's questionnaire responses
    fetchOwnerResponses(match);
  };

  const handleClosePropertyModal = (event) => {
    if (event.target === event.currentTarget) {
      setShowPropertyModal(false);
    }
  };

  const handleCarouselNav = (direction) => {
    if (!selectedProperty || !selectedProperty.images || selectedProperty.images.length <= 1) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === selectedProperty.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProperty.images.length - 1 : prev - 1
      );
    }
  };

  const fetchOwnerResponses = async (property) => {
    try {
      if (!property || !property.profiles || !property.profiles.id) {
        console.error('Property owner ID not available');
        return;
      }
      
      const ownerId = property.profiles.id;
      console.log('Fetching responses for owner ID:', ownerId);
      
      // Create a set of common yes/no questions for roommates
      const commonQuestions = [
        { id: 1, question: "Do you smoke?" },
        { id: 2, question: "Are you okay with pets?" },
        { id: 3, question: "Do you prefer a quiet living environment?" },
        { id: 4, question: "Are you a night owl?" },
        { id: 5, question: "Do you cook regularly?" },
        { id: 6, question: "Are you comfortable sharing food/groceries?" },
        { id: 7, question: "Do you clean regularly?" },
        { id: 8, question: "Are you a student?" },
        { id: 9, question: "Do you work from home?" },
        { id: 10, question: "Are you comfortable with guests?" },
        { id: 11, question: "Do you have allergies?" },
        { id: 12, question: "Do you have a car?" },
        { id: 13, question: "Do you play musical instruments?" },
        { id: 14, question: "Are you okay with shared bathrooms?" },
        { id: 15, question: "Do you prefer to socialize with roommates?" },
        { id: 16, question: "Are you planning to stay long-term (>1 year)?" },
        { id: 17, question: "Are you okay with roommates using your appliances?" },
        { id: 18, question: "Do you have furniture to bring?" },
        { id: 19, question: "Do you have specific dietary restrictions?" },
        { id: 20, question: "Are you comfortable with overnight guests?" }
      ];
      
      // Fetch binary response string from the database
      const { data: binaryData, error: binaryError } = await supabase
        .from('binary_responses')
        .select('response_string')
        .eq('user_id', ownerId)
        .single();
        
      let responses = [];
      
      if (binaryError || !binaryData || !binaryData.response_string) {
        console.error('Error fetching binary responses for owner:', binaryError);
        // Generate default responses if binary data is not available
        responses = commonQuestions.map(q => ({
          question: q.question,
          answer: 'No data',
          isYes: false
        }));
      } else {
        // Convert binary string to response objects
        const binaryString = binaryData.response_string;
        responses = commonQuestions.map((q, index) => {
          // Make sure we don't access beyond the string length
          const isYes = index < binaryString.length ? binaryString[index] === '1' : false;
          return {
            question: q.question,
            answer: isYes ? 'Yes' : 'No',
            isYes: isYes
          };
        });
      }
      
      setOwnerResponses(responses);
    } catch (err) {
      console.error('Error fetching owner responses:', err);
      setOwnerResponses([]);
    }
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Dormi</Title>
        </Header>
        <LoadingContainer>
          <p>Loading...</p>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>Dormi</Title>
        </Header>
        <LoadingContainer>
          <p>Error: {error}</p>
        </LoadingContainer>
      </Container>
    );
  }

  // Render different UI based on user type
  if (userType === 'sublease') {
    return (
      <SubletterContainer>
        <Header>
          <Title>Dormi</Title>
          <HeaderRight>
            {unreadCount > 0 ? (
              <MessagesButton onClick={navigateToChatList}>
                Messages ({unreadCount})
              </MessagesButton>
            ) : (
              <div 
                style={{ cursor: 'pointer' }}
                onClick={navigateToChatList}
              >
                Messages
              </div>
            )}
            <SignOutButton onClick={() => supabase.auth.signOut()}>
              Sign out
            </SignOutButton>
          </HeaderRight>
        </Header>
        
        <ContentContainer>
          <TabContainer>
            <Tab 
              $active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </Tab>
            <Tab 
              $active={activeTab === 'pending'} 
              onClick={() => setActiveTab('pending')}
            >
              Pending Applications {pendingApplicants.length > 0 && `(${pendingApplicants.length})`}
            </Tab>
            <Tab 
              $active={activeTab === 'accepted'} 
              onClick={() => setActiveTab('accepted')}
            >
              Accepted Applications
            </Tab>
          </TabContainer>
          
          {activeTab === 'dashboard' && (
            <Dashboard>
              <DashboardCard onClick={() => setActiveTab('pending')}>
                <DashboardValue>{pendingApplicants.length}</DashboardValue>
                <DashboardLabel>Pending Applications</DashboardLabel>
              </DashboardCard>
              <DashboardCard onClick={() => setActiveTab('accepted')}>
                <DashboardValue>{acceptedApplicants.length}</DashboardValue>
                <DashboardLabel>Accepted Applications</DashboardLabel>
              </DashboardCard>
              <DashboardCard onClick={navigateToChatList}>
                <DashboardValue>{unreadCount}</DashboardValue>
                <DashboardLabel>Unread Messages</DashboardLabel>
              </DashboardCard>
              <DashboardCard onClick={() => navigate('/properties')}>
                <DashboardValue>{activeProperties.length}</DashboardValue>
                <DashboardLabel>Active Properties</DashboardLabel>
              </DashboardCard>
            </Dashboard>
          )}
          
          {activeTab === 'pending' && (
            <ApplicantList>
              {pendingApplicants.length > 0 ? (
                pendingApplicants.map(applicant => (
                  <ApplicantCard 
                    key={applicant.id} 
                    onClick={() => handleApplicantClick(applicant)}
                  >
                    <ApplicantAvatar 
                      style={{ backgroundImage: `url(${applicant.profiles.avatar_url || 'https://picsum.photos/60/60'})` }} 
                    />
                    <ApplicantInfo>
                      <ApplicantName>{applicant.profiles.full_name}</ApplicantName>
                      <ApplicantDetail>Applied {new Date(applicant.created_at).toLocaleDateString()}</ApplicantDetail>
                      {applicant.rental_preferences && (
                        <ApplicantDetailsList>
                          <ApplicantDetailsItem>
                            Budget: ${applicant.rental_preferences.budget_min}-${applicant.rental_preferences.budget_max}
                          </ApplicantDetailsItem>
                          <ApplicantDetailsItem>
                            Move in: {formatDate(applicant.rental_preferences.move_in_date)}
                          </ApplicantDetailsItem>
                        </ApplicantDetailsList>
                      )}
                    </ApplicantInfo>
                  </ApplicantCard>
                ))
              ) : (
                <NoApplicants>
                  <p>No pending applications yet!</p>
                </NoApplicants>
              )}
            </ApplicantList>
          )}
          
          {activeTab === 'accepted' && (
            <ApplicantList>
              {acceptedApplicants.length > 0 ? (
                acceptedApplicants.map(applicant => (
                  <ApplicantCard 
                    key={applicant.id} 
                    onClick={() => {
                      if (applicant.match_id) {
                        navigate(`/chat/${applicant.match_id}`);
                      } else {
                        console.error('No match found for this applicant');
                        // Fallback to chat list
                        navigate('/chats');
                      }
                    }}
                  >
                    <ApplicantAvatar 
                      style={{ backgroundImage: `url(${applicant.profiles.avatar_url || 'https://picsum.photos/60/60'})` }} 
                    />
                    <ApplicantInfo>
                      <ApplicantName>{applicant.profiles.full_name}</ApplicantName>
                      <ApplicantDetail>Accepted {new Date(applicant.created_at).toLocaleDateString()}</ApplicantDetail>
                      <ApplicantDetail>Click to chat</ApplicantDetail>
                    </ApplicantInfo>
                  </ApplicantCard>
                ))
              ) : (
                <NoApplicants>
                  <p>No accepted applications yet!</p>
                </NoApplicants>
              )}
            </ApplicantList>
          )}
          
          {showApplicantModal && selectedApplicant && (
            <ApplicantModal>
              <ApplicantModalContent>
                <CloseButton onClick={() => setShowApplicantModal(false)}>&times;</CloseButton>
                
                {/* Page 1: Profile and Rental Preferences */}
                {modalPage === 1 && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                      <ApplicantAvatar 
                        style={{ 
                          backgroundImage: `url(${selectedApplicant.profiles.avatar_url || 'https://picsum.photos/80/80'})`,
                          width: '80px',
                          height: '80px'
                        }} 
                      />
                      <div style={{ marginLeft: '20px' }}>
                        <h2 style={{ margin: '0 0 5px 0' }}>{selectedApplicant.profiles.full_name}</h2>
                        <p style={{ margin: '0', color: '#666' }}>
                          Applied on {new Date(selectedApplicant.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {applicantPreferences && (
                      <div>
                        <h3>Rental Preferences</h3>
                        <ApplicantDetailsList>
                          {applicantPreferences.budget_min && applicantPreferences.budget_max && (
                            <ApplicantDetailsItem>
                              Budget: ${applicantPreferences.budget_min}-${applicantPreferences.budget_max}
                            </ApplicantDetailsItem>
                          )}
                          {applicantPreferences.max_rent && (
                            <ApplicantDetailsItem>
                              Max Rent: ${applicantPreferences.max_rent}
                            </ApplicantDetailsItem>
                          )}
                          {applicantPreferences.move_in_date && (
                            <ApplicantDetailsItem>
                              Move in: {formatDate(applicantPreferences.move_in_date)}
                            </ApplicantDetailsItem>
                          )}
                          {applicantPreferences.lease_duration && (
                            <ApplicantDetailsItem>
                              Lease duration: {applicantPreferences.lease_duration} months
                            </ApplicantDetailsItem>
                          )}
                          {applicantPreferences.roommate_count > 0 && (
                            <ApplicantDetailsItem>
                              Prefers {applicantPreferences.roommate_count} roommate{applicantPreferences.roommate_count !== 1 ? 's' : ''}
                            </ApplicantDetailsItem>
                          )}
                          {applicantPreferences.location && (
                            <ApplicantDetailsItem>
                              Location: {applicantPreferences.location}
                            </ApplicantDetailsItem>
                          )}
                          {applicantPreferences.preferred_location && (
                            <ApplicantDetailsItem>
                              Preferred Location: {applicantPreferences.preferred_location}
                            </ApplicantDetailsItem>
                          )}
                        </ApplicantDetailsList>
                        
                        {applicantPreferences.description && (
                          <>
                            <h3>About {selectedApplicant.profiles.full_name}</h3>
                            <p>{applicantPreferences.description}</p>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
                
                {/* Page 2: Questionnaire Responses */}
                {modalPage === 2 && applicantResponses.length > 0 && (
                  <QuestionnaireSection style={{ marginTop: 0 }}>
                    <QuestionnaireTitle>Questionnaire Responses</QuestionnaireTitle>
                    <QuestionnaireSummary>
                      {applicantResponses.length} questions answered by {selectedApplicant.profiles.full_name}
                    </QuestionnaireSummary>
                    <QuestionGrid>
                      {applicantResponses.map((response, index) => (
                        <QuestionItem key={index}>
                          <QuestionText>{response.question}</QuestionText>
                          <AnswerIcon $isYes={response.isYes}>
                            {response.isYes ? '✓' : '✕'}
                          </AnswerIcon>
                        </QuestionItem>
                      ))}
                    </QuestionGrid>
                  </QuestionnaireSection>
                )}
                
                <ButtonRow>
                  <DeclineButton onClick={() => handleApplicationAction('declined')}>
                    Decline
                  </DeclineButton>
                  <AcceptButton onClick={() => handleApplicationAction('accepted')}>
                    Accept & Chat
                  </AcceptButton>
                </ButtonRow>
                
                {/* Pagination buttons at the bottom */}
                <PaginationContainer>
                  <PageButton 
                    $active={modalPage === 1}
                    onClick={() => setModalPage(1)}
                  >
                    1
                  </PageButton>
                  <PageButton 
                    $active={modalPage === 2}
                    onClick={() => setModalPage(2)}
                  >
                    2
                  </PageButton>
                </PaginationContainer>
              </ApplicantModalContent>
            </ApplicantModal>
          )}
        </ContentContainer>
      </SubletterContainer>
    );
  }
  
  // Render for renters (userType === 'rent')
  return (
    <Container>
      <Header>
        <Title>Dormi</Title>
        <HeaderRight>
          {unreadCount > 0 ? (
            <MessagesButton onClick={navigateToChatList}>
              Messages ({unreadCount})
            </MessagesButton>
          ) : (
            <div 
              style={{ cursor: 'pointer' }}
              onClick={navigateToChatList}
            >
              Messages
            </div>
          )}
          <SignOutButton onClick={() => supabase.auth.signOut()}>
            Sign out
          </SignOutButton>
        </HeaderRight>
      </Header>
      
      <CardContainer>
        {potentialMatches.length > 0 ? (
          potentialMatches.map((match) => (
            // map each potential match to a tinder card
            <TinderCard
              key={match.id}
              preventSwipe={['up', 'down']}
              onSwipe={(dir) => handleSwipe(dir, match)}
              className="swipe"
            >
              <Card 
                style={{ 
                  backgroundImage: `url(${match.images && match.images.length > 0 ? match.images[0] : match.image_url || 'https://picsum.photos/400/400'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <CardInfo>
                  <Name>{match.profiles.full_name}</Name>
                  <Bio>{match.description || 'No description provided'}</Bio>
                  <ExpandButton onClick={(e) => handleShowPropertyDetails(e, match)}>
                    View Details
                  </ExpandButton>
                  <Details>
                    <Detail>{match.location || 'Location not specified'}</Detail>
                    <Detail>${match.price}/month</Detail>
                    <Detail>Available: {formatDate(match.available_from)}</Detail>
                    <Detail>{match.room_type === 'private' ? 'Private' : 'Shared'} Room</Detail>
                    <Detail>{match.bathroom_type === 'private' ? 'Private' : 'Shared'} Bathroom</Detail>
                    {match.roommate_count > 0 && (
                      <Detail>{match.roommate_count} roommate{match.roommate_count !== 1 ? 's' : ''}</Detail>
                    )}
                  </Details>
                </CardInfo>
              </Card>
            </TinderCard>
          ))
        ) : (
          <NoMatches>
            <NoMatchesText>No More Properties</NoMatchesText>
            <p>We'll notify you when new properties are listed!</p>
          </NoMatches>
        )}
      </CardContainer>
      
      {/* Property Detail Modal */}
      {showPropertyModal && selectedProperty && (
        <PropertyModal onClick={handleClosePropertyModal}>
          <PropertyModalContent>
            <CloseButton onClick={() => setShowPropertyModal(false)}>×</CloseButton>
            
            {/* Page 1: Property Details and Images */}
            {propertyModalPage === 1 && (
              <>
                {/* Image Carousel */}
                <CarouselContainer>
                  {selectedProperty.images && selectedProperty.images.length > 0 ? (
                    selectedProperty.images.map((image, index) => (
                      <CarouselImage 
                        key={index}
                        style={{ 
                          backgroundImage: `url(${image})`, 
                          display: index === currentImageIndex ? 'block' : 'none'
                        }}
                      />
                    ))
                  ) : (
                    <CarouselImage 
                      style={{ 
                        backgroundImage: `url(${selectedProperty.image_url || 'https://picsum.photos/400/400'})`
                      }}
                    />
                  )}
                  {selectedProperty.images && selectedProperty.images.length > 1 && (
                    <>
                      <CarouselButton className="prev" onClick={() => handleCarouselNav('prev')}>
                        ‹
                      </CarouselButton>
                      <CarouselButton className="next" onClick={() => handleCarouselNav('next')}>
                        ›
                      </CarouselButton>
                    </>
                  )}
                </CarouselContainer>
                
                {/* Property Name */}
                <h2>{selectedProperty.profiles.full_name}</h2>
                
                {/* Full Description */}
                <PropertyDescription>
                  {selectedProperty.description || 'No description provided'}
                </PropertyDescription>
                
                {/* Property Details */}
                <PropertyDetails>
                  <PropertyDetail>{selectedProperty.location || 'Location not specified'}</PropertyDetail>
                  <PropertyDetail>${selectedProperty.price}/month</PropertyDetail>
                  <PropertyDetail>Available: {formatDate(selectedProperty.available_from)}</PropertyDetail>
                  <PropertyDetail>{selectedProperty.room_type === 'private' ? 'Private' : 'Shared'} Room</PropertyDetail>
                  <PropertyDetail>{selectedProperty.bathroom_type === 'private' ? 'Private' : 'Shared'} Bathroom</PropertyDetail>
                  {selectedProperty.roommate_count > 0 && (
                    <PropertyDetail>
                      {selectedProperty.roommate_count} roommate{selectedProperty.roommate_count !== 1 ? 's' : ''}
                    </PropertyDetail>
                  )}
                </PropertyDetails>
              </>
            )}
            
            {/* Page 2: Owner's Questionnaire Responses */}
            {propertyModalPage === 2 && (
              <QuestionnaireSection style={{ marginTop: 0 }}>
                <QuestionnaireTitle>Questionnaire Responses</QuestionnaireTitle>
                <QuestionnaireSummary>
                  See how {selectedProperty.profiles.full_name} answered the compatibility questions
                </QuestionnaireSummary>
                
                {ownerResponses.length > 0 ? (
                  <QuestionGrid>
                    {ownerResponses.map((response, index) => (
                      <QuestionItem key={index}>
                        <QuestionText>{response.question}</QuestionText>
                        <AnswerIcon $isYes={response.isYes}>
                          {response.isYes ? '✓' : '✕'}
                        </AnswerIcon>
                      </QuestionItem>
                    ))}
                  </QuestionGrid>
                ) : (
                  <p>No questionnaire responses available for this subletter.</p>
                )}
              </QuestionnaireSection>
            )}
            
            {/* Pagination buttons at the bottom */}
            <PaginationContainer>
              <PageButton 
                $active={propertyModalPage === 1}
                onClick={() => setPropertyModalPage(1)}
              >
                1
              </PageButton>
              <PageButton 
                $active={propertyModalPage === 2}
                onClick={() => setPropertyModalPage(2)}
              >
                2
              </PageButton>
            </PaginationContainer>
          </PropertyModalContent>
        </PropertyModal>
      )}
      
      {showButtons && potentialMatches.length > 0 && (
        <Instructions>
          <Instruction>
            <Circle $color="#ff3b5c">✕</Circle>
            <InstructionText>Not interested</InstructionText>
          </Instruction>
          <Instruction>
            <Circle $color="#26de81">✓</Circle>
            <InstructionText>Interested</InstructionText>
          </Instruction>
        </Instructions>
      )}
    </Container>
  );
};

export default Matches;
