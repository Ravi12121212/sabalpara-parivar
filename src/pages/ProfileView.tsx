import React from 'react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/AuthContext';
import { Link } from 'react-router-dom';

const ProfileView: React.FC = () => {
  const { token } = useAuth();
  const { data, loading, error } = useProfile(!!token);

  if (!token) return null;
  if (loading) return <p>પ્રોફાઇલ લોડ કરી રહ્યું છે...</p>;
  if (error) return <div><p style={{color:'red'}}>{error}</p><Link to="/user-details">પ્રોફાઇલ બનાવો / સંપાદિત કરો</Link></div>;
  if (!data || !data.profile) return <div><p>હજુ સુધી કોઈ પ્રોફાઇલ નથી.</p><Link to="/user-details">પ્રોફાઇલ બનાવો</Link></div>;

  const p = data.profile;
  return (
    <div style={{ maxWidth: 640 }}>
      <h2>વપરાશકર્તા પ્રોફાઇલ</h2>
      <dl>
        <dt>નામ</dt><dd>{p.name || '—'}</dd>
        <dt>ગામ</dt><dd>{p.village || '—'}</dd>
        <dt>હાલનું સરનામું</dt><dd>{p.currentAddress || '—'}</dd>
        <dt>વ્યવસાય વિગતો</dt><dd>{p.businessDetails || '—'}</dd>
        <dt>કુલ પરિવારના સભ્યો</dt><dd>{p.totalFamilyMembers ?? '—'}</dd>
      </dl>
      <h3 style={{ marginTop: '1rem' }}>પરિવારના સભ્યો</h3>
      {data.familyMembers.length === 0 && <p>સૂચિબદ્ધ નથી.</p>}
      {data.familyMembers.map((m, i) => (
        <div key={i} style={{ border:'1px solid #ddd', padding:'0.5rem', marginBottom:'0.5rem' }}>
          <strong>{m.memberName}</strong><br />
          {m.age && <span>ઉંમર: {m.age} </span>}
          {m.std && <span>ધોરણ: {m.std} </span>}
          
        </div>
      ))}
      <Link to="/user-details">પ્રોફાઇલ સંપાદિત કરો</Link>
    </div>
  );
};
export default ProfileView;
