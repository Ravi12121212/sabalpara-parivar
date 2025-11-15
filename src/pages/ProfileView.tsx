import React from 'react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/AuthContext';
import { Link } from 'react-router-dom';

const ProfileView: React.FC = () => {
  const { token } = useAuth();
  const { data, loading, error } = useProfile(!!token);

  if (!token) return null;
  if (loading) return <p>Loading profile...</p>;
  if (error) return <div><p style={{color:'red'}}>{error}</p><Link to="/user-details">Create / Edit Profile</Link></div>;
  if (!data || !data.profile) return <div><p>No profile yet.</p><Link to="/user-details">Create Profile</Link></div>;

  const p = data.profile;
  return (
    <div style={{ maxWidth: 640 }}>
      <h2>User Profile</h2>
      <dl>
        <dt>Name</dt><dd>{p.name || '—'}</dd>
        <dt>Village</dt><dd>{p.village || '—'}</dd>
        <dt>Current Address</dt><dd>{p.currentAddress || '—'}</dd>
        <dt>Business Details</dt><dd>{p.businessDetails || '—'}</dd>
        <dt>Total Family Members</dt><dd>{p.totalFamilyMembers ?? '—'}</dd>
      </dl>
      <h3 style={{ marginTop: '1rem' }}>Family Members</h3>
      {data.familyMembers.length === 0 && <p>None listed.</p>}
      {data.familyMembers.map((m, i) => (
        <div key={i} style={{ border:'1px solid #ddd', padding:'0.5rem', marginBottom:'0.5rem' }}>
          <strong>{m.memberName}</strong><br />
          {m.age && <span>Age: {m.age} </span>}
          {m.std && <span>Std: {m.std} </span>}
          {m.percentage !== undefined && <span>Percentage: {m.percentage}% </span>}
          {m.resultImage && <div><img src={m.resultImage} alt={m.memberName} style={{ maxWidth:'120px', marginTop:'0.25rem' }} /></div>}
        </div>
      ))}
      <Link to="/user-details">Edit Profile</Link>
    </div>
  );
};
export default ProfileView;
