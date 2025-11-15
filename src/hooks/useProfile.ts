import { useEffect, useState } from 'react';
import { api } from '../api/client';

export interface ProfileData {
  profile: {
    village?: string;
    name?: string;
    totalFamilyMembers?: number;
    currentAddress?: string;
    businessDetails?: string;
  } | null;
  familyMembers: Array<{
    memberName: string;
    age?: number;
    std?: string;
    resultImage?: string;
    percentage?: number;
  }>;
}

export function useProfile(enabled: boolean) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    console.log('[UserDetailsForm] fetching existing profile data1');
    api.get('/profile')
      .then(r => setData(r.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, [enabled]);

  return { data, loading, error, refetch: () => setData(null) };
}
