import React from 'react';
import { useAuth } from '../hooks/AuthContext';
import { useProfile } from '../hooks/useProfile';
import UserDetailsForm from '../pages/UserDetailsForm';

interface Props { children: React.ReactNode }

const RequireProfile: React.FC<Props> = ({ children }) => {
  const { token } = useAuth();
  const { data, loading } = useProfile(!!token);

  if (!token) return null;
  if (loading) return <p>Loading...</p>;
  if (!data || !data.profile) return <UserDetailsForm />;
  return <>{children}</>;
};
export default RequireProfile;
