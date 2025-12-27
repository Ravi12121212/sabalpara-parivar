import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { AuthCard } from '../components/ui/AuthCard';

interface UserDetailData {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  village?: string;
  totalFamilyMembers?: number;
  currentAddress?: string;
  businessDetails?: string;
  createdAt?: string;
  updatedAt?: string; // profile updatedAt
  familyMembers?: any[];
}

const UserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [data, setData] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    api.get(`/users/${encodeURIComponent(userId)}`)
      .then(r => {
        const u = r.data.user || r.data;
        const mapped: UserDetailData = {
          id: u.id || u._id || userId,
          name: u.profile?.name || u.fullName || 'Unnamed',
          email: u.email,
          phone: u.phone,
          village: u.profile?.village || u.village,
          totalFamilyMembers: u.profile?.totalFamilyMembers,
            currentAddress: u.profile?.currentAddress,
          businessDetails: u.profile?.businessDetails,
          createdAt: u.createdAt,
          updatedAt: u.profile?.updatedAt,
          familyMembers: u.familyMembers,
        };
        setData(mapped);
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load user'))
      .finally(()=> setLoading(false));
  }, [userId]);

  return (
    <AuthCard title={data ? data.name : 'User Detail'} subtitle="Profile" backTo={data?.village ? `/villages/${encodeURIComponent(data.village)}` : '/village-list'}>
      {loading && <p style={{ fontSize:'0.85rem' }}>Loading...</p>}
      {error && <div className="field-error" style={{ marginBottom:'0.5rem' }}>{error}</div>}
      {!loading && !error && data && (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
          <div><strong>ID:</strong> {data.id}</div>
          {data.email && <div><strong>Email:</strong> {data.email}</div>}
          {data.phone && <div><strong>Phone:</strong> {data.phone}</div>}
          {data.village && <div><strong>Village:</strong> {data.village}</div>}
          {data.totalFamilyMembers != null && <div><strong>Total Family Members:</strong> {data.totalFamilyMembers}</div>}
          {data.currentAddress && <div><strong>Current Address:</strong> {data.currentAddress}</div>}
          {data.businessDetails && <div><strong>Business Details:</strong> {data.businessDetails}</div>}
          
          {Array.isArray(data.familyMembers) && (
            <div>
              <strong>Family Members:</strong>
              <ul style={{ margin:0, paddingLeft:'1.1rem' }}>
                {data.familyMembers.map((fm: any, i: number) => (
                  <li key={i}>
                    {(fm.memberName ? `Name: ${fm.memberName}` : 'Member')}
                    {fm.age ? `, Age: ${fm.age}` : ''}
                    {fm.std ? `, Std: ${fm.std}` : ''}
                    {/* academic percentage and result image removed */}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </AuthCard>
  );
};
export default UserDetail;