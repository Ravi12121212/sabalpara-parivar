import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

const Dashboard: React.FC = () => {
  const [me, setMe] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    api.get('/auth/me')
      .then(r => mounted && setMe(r.data))
      .catch(err => mounted && setError(err.response?.data?.message || 'Unauthorized'));
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      {error && (
        <div style={{ color:'var(--color-error)', fontSize:'0.85rem', marginBottom:'1rem' }}>
          {error}
        </div>
      )}
      {me ? <pre>{JSON.stringify(me, null, 2)}</pre> : !error ? <p>Loading...</p> : null}
    </div>
  );
};
export default Dashboard;
