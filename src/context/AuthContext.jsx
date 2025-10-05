import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'rent' or 'sublease'
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setCurrentUser(session?.user || null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          // Reset states if user logs out
          setUserType(null);
          setProfileCompleted(false);
          setQuestionnaireCompleted(false);
          setLoading(false);
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setCurrentUser(session?.user || null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Fetch user profile data
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type, profile_completed, questionnaire_completed')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setUserType(data.user_type);
        setProfileCompleted(data.profile_completed || false);
        setQuestionnaireCompleted(data.questionnaire_completed || false);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Login with email/password
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Sign up with email/password
  const signUp = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentUser(null);
      setUserType(null);
      setProfileCompleted(false);
      setQuestionnaireCompleted(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Update user type (rent or sublease)
  const setType = async (type) => {
    try {
      if (!currentUser) return;

      setUserType(type);
      
      // Update user profile in the database
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: type })
        .eq('id', currentUser.id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating user type:', error);
    }
  };

  // Update profile completion status
  const updateProfileStatus = async (updates) => {
    try {
      if (!currentUser) return;

      if (updates.profileCompleted !== undefined) {
        setProfileCompleted(updates.profileCompleted);
      }
      
      if (updates.questionnaireCompleted !== undefined) {
        setQuestionnaireCompleted(updates.questionnaireCompleted);
      }
      
      // Update user profile in the database
      const dbUpdates = {};
      if (updates.profileCompleted !== undefined) {
        dbUpdates.profile_completed = updates.profileCompleted;
      }
      if (updates.questionnaireCompleted !== undefined) {
        dbUpdates.questionnaire_completed = updates.questionnaireCompleted;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', currentUser.id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating profile status:', error);
    }
  };

  const value = {
    currentUser,
    userType,
    profileCompleted,
    questionnaireCompleted,
    login,
    signUp,
    logout,
    setType,
    updateProfileStatus,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
