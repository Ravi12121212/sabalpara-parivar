import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { AuthCard } from '../components/ui/AuthCard';
import { TextInput } from '../components/ui/TextInput';

interface User { id: string | number; name: string; email?: string; phone?: string; village?: string; }

const VillagePeople: React.FC = () => {
  const { villageName } = useParams<{ villageName: string }>();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!villageName) return;
    setLoading(true);
    api.get(`/users/by-village/${encodeURIComponent(villageName)}`)
      .then(r => {
        let raw = Array.isArray(r.data) ? r.data : r.data.users || [];
        // Try mapping minimal structure
        raw = raw.map((u: any, idx: number) => ({
          id: u.id || u._id || idx,
          name: u.profile?.name || u.fullName || 'Unnamed',
          email: u.email,
          phone: u.phone,
          village: u.village || villageName,
        }));
        setUsers(raw);
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load users'))
      .finally(()=> setLoading(false));
  }, [villageName]);

  const filtered = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return users;
    return users.filter(u => u.name.toLowerCase().includes(term) || String(u.id).includes(term));
  }, [filter, users]);

  return (
    <AuthCard title={`People in ${villageName}`} subtitle="Select a user" backTo="/village-list">
      <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        <TextInput placeholder="Search people..." value={filter} onChange={e=>setFilter(e.target.value)} />
        {loading && <p style={{ fontSize:'0.85rem' }}>Loading...</p>}
        {error && <div className="field-error" style={{ marginBottom:'0.5rem' }}>{error}</div>}
        {!loading && !error && filtered.length === 0 && <p style={{ fontSize:'0.8rem' }}>No people match.</p>}
        <div style={{ maxHeight:320, overflowY:'auto', borderRadius:12, background:'#fff', padding:'0.5rem', boxShadow:'var(--shadow-soft)' }}>
          {filtered.map(u => (
            <div key={u.id} style={{ padding:'0.6rem 0.7rem', borderBottom:'1px solid var(--color-border)' }}>
              <Link to={`/users/${encodeURIComponent(String(u.id))}`} style={{ fontWeight:600, textDecoration:'none', color:'var(--color-text)' }}>
                {u.name}
              </Link>
              <div style={{ fontSize:'0.65rem', opacity:0.7 }}>{u.email || u.phone}</div>
            </div>
          ))}
        </div>
      </div>
    </AuthCard>
  );
};
export default VillagePeople;