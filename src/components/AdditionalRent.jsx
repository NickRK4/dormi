import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabaseClient';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f7fa;
`;

const FormCard = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 500px;
  max-width: 90%;
`;

const Title = styled.h1`
  text-align: center;
  color: #ff4458;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;
  min-height: 100px;
  resize: vertical;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 20px;
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
  color: red;
  margin-bottom: 20px;
`;

// This component is for users looking to rent
const AdditionalRent = () => {
  const [formData, setFormData] = useState({
    budget_min: '',
    budget_max: '',
    location: '',
    move_in_date: '',
    lease_duration: '12',
    roommate_count: '0',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUser, updateProfileStatus } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Create/update rental preferences
      const { error: rentalError } = await supabase
        .from('rental_preferences')
        .upsert({
          user_id: currentUser.id,
          budget_min: parseInt(formData.budget_min, 10),
          budget_max: parseInt(formData.budget_max, 10),
          location: formData.location,
          move_in_date: formData.move_in_date,
          lease_duration: parseInt(formData.lease_duration, 10),
          roommate_count: parseInt(formData.roommate_count, 10),
          description: formData.description
        });
      
      if (rentalError) throw rentalError;
      
      // Mark profile as complete using the updateProfileStatus function
      await updateProfileStatus({ profileCompleted: true });
      
      // Navigate to matches page
      navigate('/matches');
    } catch (err) {
      console.error('Error saving rental preferences:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <FormCard>
        <Title>Tell Us More About You</Title>
        
        {error && <ErrorText>{error}</ErrorText>}
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="location">Where are you looking to live?</Label>
            <Input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="City, neighborhood, etc."
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="budget_min">Minimum Budget (per month)</Label>
            <Input
              type="number"
              id="budget_min"
              name="budget_min"
              value={formData.budget_min}
              onChange={handleChange}
              required
              placeholder="$"
              min="0"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="budget_max">Maximum Budget (per month)</Label>
            <Input
              type="number"
              id="budget_max"
              name="budget_max"
              value={formData.budget_max}
              onChange={handleChange}
              required
              placeholder="$"
              min="0"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="move_in_date">When do you want to move in?</Label>
            <Input
              type="date"
              id="move_in_date"
              name="move_in_date"
              value={formData.move_in_date}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="lease_duration">Preferred Lease Duration (months)</Label>
            <Input
              type="number"
              id="lease_duration"
              name="lease_duration"
              value={formData.lease_duration}
              onChange={handleChange}
              required
              min="1"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="roommate_count">Preferred Number of Roommates</Label>
            <Input
              type="number"
              id="roommate_count"
              name="roommate_count"
              value={formData.roommate_count}
              onChange={handleChange}
              required
              min="0"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="description">Tell us about yourself</Label>
            <TextArea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Share your lifestyle, interests, and what you're looking for in a living situation."
              required
            />
          </FormGroup>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Find Properties'}
          </Button>
        </form>
      </FormCard>
    </Container>
  );
};

export default AdditionalRent;
