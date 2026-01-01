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
  businessType?: string;
  age?: number | string;
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
          phone: u.profile?.phone || u.phone,
          village: u.profile?.village || u.village,
          totalFamilyMembers: u.profile?.totalFamilyMembers,
          currentAddress: u.profile?.currentAddress,
          businessDetails: u.profile?.businessDetails,
          businessType: u.profile?.businessType || u.businessType,
          age: u.profile?.age ?? u.age ?? undefined,
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
        <div className="profile-overview">
          <div className="profile-card">
            <div className="profile-avatar" aria-hidden>{data.name ? data.name.split(' ').map(s => s[0]).slice(0,2).join('') : '—'}</div>
            <div className="profile-name">{data.name}</div>
            <div className="profile-sub">{data.businessDetails || data.businessType || 'Member'}</div>

            <div className="profile-stats">
              <div className="stat-row"><div className="stat-label">Age</div><div className="stat-label">{data.age || '—'}</div></div>
              <div className="stat-row"><div className="stat-label">Village:</div><div className="stat-label">{data.village || '—'}</div></div>
              <div className="stat-row"><div className="stat-label">Current Address:</div><div className="stat-label">{data.currentAddress || '—'}</div></div>
              <div className="stat-row"><div className="stat-label">Phone:</div><div className="stat-label">{data.phone || '—'}</div></div>
              <div className="stat-row"><div className="stat-label">Email:</div><div className="stat-label">{data.email || '—'}</div></div>
              <div className="stat-row"><div className="stat-label">Business Type:</div><div className="stat-label">{data.businessType || '—'}</div></div>
            </div>
          </div>

          <div className="profile-details">
            <h4 style={{ marginTop: 0 }}>Family Members</h4>
            <div className="family-grid">
              {Array.isArray(data.familyMembers) && data.familyMembers.length ? data.familyMembers.map((m: any, i: number) => (
                <div key={i} className="family-card">
                  <div className="family-top">
                    <div className="family-avatar">{m.memberName ? (m.memberName.split(' ').map((s: string) => s[0]).slice(0,2).join('')) : '—'}</div>
                    <div className="family-info">
                      <div className="family-name">{m.memberName || 'Member'}</div>
                      <div className="family-meta">{m.relation || ''}{m.age ? ` · ${m.age} yrs` : ''}</div>
                    </div>
                  </div>
                  <div className="family-bio">
                    <div style={{ marginBottom: 6 }}>{m.businessDescription || m.std ? (m.businessDescription || m.std) : '—'}</div>
                    <div className="family-meta-row">
                      {m.memberPhone && <div className="meta-item">📞 {m.memberPhone}</div>} 
                      {m.businessName && <div className="meta-item">🏷️ {m.businessName}</div>}
                      {m.businessWorkType && <div className="meta-item">💼 {m.businessWorkType}</div>}
                      {m.relation && <div className="meta-item">🧭 {m.relation}</div>}
                      {m.age ? <div className="meta-item">🎂 {m.age} yrs</div> : null}
                    </div>
                  </div>
                </div>
              )) : <div>No family members added.</div>}
            </div>
          </div>
        </div>
      )}
    </AuthCard>
  );
};
export default UserDetail;