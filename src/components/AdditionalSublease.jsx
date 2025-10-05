import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
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

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;
  background-color: white;
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
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const UploadContainer = styled.div`
  border: 2px dashed #ddd;
  border-radius: 6px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #ff4458;
    background-color: #fff2f3;
  }
`;

const UploadIcon = styled(CloudUploadIcon)`
  font-size: 48px !important;
  color: #ff4458;
  margin-bottom: 10px;
`;

const UploadText = styled.p`
  margin: 0;
  color: #666;
`;

const ImagesPreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
`;

const ImagePreview = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 4px;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  position: relative;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #ff4458;
  color: white;
  border: none;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ErrorText = styled.p`
  color: #ff4458;
  text-align: center;
  margin: 10px 0;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

// This component is for users looking to sublease their apartment
const AdditionalSublease = () => {
  const [formData, setFormData] = useState({
    location: '',
    price: '',
    available_from: '',
    available_until: '',
    room_type: 'private',
    bathroom_type: 'private',
    roommate_count: '0',
    description: ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = React.useRef();
  const navigate = useNavigate();
  const { currentUser, updateProfileStatus } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 0) {
      // Limit to 5 images total
      const totalImages = images.length + files.length;
      if (totalImages > 5) {
        setError('Maximum 5 images allowed');
        return;
      }
      
      const newImages = files.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      
      setImages([...images, ...newImages]);
      setError('');
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newImages[index].preview);
    
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const uploadImageToStorage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `dorms/${currentUser.id}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
      
    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (images.length === 0) {
      setError('Please upload at least one image of your property');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Create sublease offer in database
      const { data: subleaseData, error: subleaseError } = await supabase
        .from('sublease_offers')
        .insert({
          user_id: currentUser.id,
          location: formData.location,
          price: parseFloat(formData.price),
          available_from: formData.available_from,
          available_until: formData.available_until,
          room_type: formData.room_type,
          bathroom_type: formData.bathroom_type,
          roommate_count: parseInt(formData.roommate_count, 10),
          description: formData.description
        })
        .select()
        .single();
      
      if (subleaseError) throw subleaseError;
      
      const subleaseId = subleaseData.id;
      
      // Upload images
      const uploadPromises = images.map(image => uploadImageToStorage(image.file));
      const imageUrls = await Promise.all(uploadPromises);
      
      // Add image URLs to database
      const imageInserts = imageUrls.map(url => ({
        sublease_id: subleaseId,
        image_url: url
      }));
      
      const { error: imageError } = await supabase
        .from('property_images')
        .insert(imageInserts);
      
      if (imageError) throw imageError;
      
      // Mark profile as complete using the updateProfileStatus function
      await updateProfileStatus({ profileCompleted: true });
      
      // Navigate directly to the matches page, which will show the dashboard for subletters
      navigate('/matches');
    } catch (err) {
      console.error('Error creating sublease offer:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Container>
      <FormCard>
        <Title>List Your Apartment</Title>
        {error && <ErrorText>{error}</ErrorText>}
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="location">Location</Label>
            <Input
              type="text"
              id="location"
              name="location"
              placeholder="e.g., Upper East Side, Manhattan"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="price">Monthly Price ($)</Label>
            <Input
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="available_from">Available From</Label>
            <Input
              type="date"
              id="available_from"
              name="available_from"
              value={formData.available_from}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="available_until">Available Until</Label>
            <Input
              type="date"
              id="available_until"
              name="available_until"
              value={formData.available_until}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="room_type">Room Type</Label>
            <Select
              id="room_type"
              name="room_type"
              value={formData.room_type}
              onChange={handleChange}
              required
            >
              <option value="private">Private Room</option>
              <option value="shared">Shared Room</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="bathroom_type">Bathroom Type</Label>
            <Select
              id="bathroom_type"
              name="bathroom_type"
              value={formData.bathroom_type}
              onChange={handleChange}
              required
            >
              <option value="private">Private Bathroom</option>
              <option value="shared">Shared Bathroom</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="roommate_count">Number of Roommates</Label>
            <Input
              type="number"
              id="roommate_count"
              name="roommate_count"
              min="0"
              value={formData.roommate_count}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="description">Apartment Description</Label>
            <TextArea
              id="description"
              name="description"
              placeholder="Describe your apartment, amenities, neighborhood, etc."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Upload Apartment Photos (Max 5)</Label>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
            <UploadContainer onClick={() => fileInputRef.current.click()}>
              <UploadIcon />
              <UploadText>Click to upload photos (Max 5)</UploadText>
            </UploadContainer>
            
            {images.length > 0 && (
              <ImagesPreview>
                {images.map((image, index) => (
                  <ImagePreview key={index} src={image.preview}>
                    <RemoveButton onClick={() => handleRemoveImage(index)}>×</RemoveButton>
                  </ImagePreview>
                ))}
              </ImagesPreview>
            )}
          </FormGroup>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Find My Roommates'}
          </Button>
        </form>
        
        {loading && (
          <LoadingOverlay>
            <h3>Saving your listing...</h3>
          </LoadingOverlay>
        )}
      </FormCard>
    </Container>
  );
};

export default AdditionalSublease;
