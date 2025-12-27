import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthCard } from '../components/ui/AuthCard';
import { business, BusinessUsersResponse } from '../api/business';

const BusinessUsers: React.FC = () => {
  const { name = '' } = useParams();
  const [data, setData] = useState<BusinessUsersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{
    if (!name) return;
    setLoading(true);
    business.users(name)
      .then(res => setData(res))
      .catch(err => setError(err.response?.data?.message || 'Failed to load users'))
      .finally(()=> setLoading(false));
  },[name]);

  return (
    <AuthCard title={decodeURIComponent(name)} subtitle="Users in this business" backTo="/businesses">
      {loading && <p style={{ fontSize:'0.85rem' }}>Loading...</p>}
      {error && <div className="field-error" style={{ marginBottom:'0.5rem' }}>{error}</div>}
      {!loading && !error && (
        <div style={{ maxHeight:'60vh', overflowY:'auto', borderRadius:12, background:'#fff', padding:'0.5rem', boxShadow:'var(--shadow-soft)' }}>
          {(data?.users || []).length === 0 && <p style={{ fontSize:'0.8rem' }}>No users.</p>}
          {(data?.users || []).map(u => (
            <div key={u.id} style={{ padding:'0.6rem 0.7rem', borderBottom:'1px solid var(--color-border)' }}>
              <div style={{ fontWeight:600 }}>{u.name || '—'}</div>
              <div style={{ fontSize:13, color:'#666' }}>{u.village || '—'}</div>
              <div style={{ fontSize:12, color:'#888' }}>{u.phone || u.email || ''}</div>
            </div>
          ))}
        </div>
      )}
    </AuthCard>
  );
};
export default BusinessUsers;
