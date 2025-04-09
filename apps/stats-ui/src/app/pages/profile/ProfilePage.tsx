import { useAuth0 } from '@auth0/auth0-react';
import styled from 'styled-components';
import { ProtectedRoute } from '../../auth/ProtectedRoute';

const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-right: 2rem;
  object-fit: cover;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h1`
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
`;

const ProfileEmail = styled.p`
  margin: 0;
  color: #666;
  font-size: 1.1rem;
`;

const ProfileSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: #333;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const InfoItem = styled.div`
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
`;

const InfoLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.3rem;
`;

const InfoValue = styled.div`
  font-size: 1.1rem;
  color: #333;
  font-weight: 500;
`;

export function ProfilePage() {
  const { user, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <ProtectedRoute>
      <ProfileContainer>
        <ProfileHeader>
          <ProfileImage src={user.picture || ''} alt={user.name || 'Profile'} />
          <ProfileInfo>
            <ProfileName>{user.name}</ProfileName>
            <ProfileEmail>{user.email}</ProfileEmail>
          </ProfileInfo>
        </ProfileHeader>

        <ProfileSection>
          <SectionTitle>Account Information</SectionTitle>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>Email</InfoLabel>
              <InfoValue>{user.email}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Email Verified</InfoLabel>
              <InfoValue>{user.email_verified ? 'Yes' : 'No'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Account Created</InfoLabel>
              <InfoValue>
                {user.updated_at
                  ? new Date(user.updated_at).toLocaleDateString()
                  : 'N/A'}
              </InfoValue>
            </InfoItem>
          </InfoGrid>
        </ProfileSection>

        <ProfileSection>
          <SectionTitle>Auth0 Details</SectionTitle>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>User ID</InfoLabel>
              <InfoValue>{user.sub}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Auth Provider</InfoLabel>
              <InfoValue>
                {user.identities?.[0]?.provider || 'Unknown'}
              </InfoValue>
            </InfoItem>
          </InfoGrid>
        </ProfileSection>
      </ProfileContainer>
    </ProtectedRoute>
  );
}
