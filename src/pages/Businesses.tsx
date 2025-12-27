import React, { useEffect, useMemo, useState } from 'react';
import { AuthCard } from '../components/ui/AuthCard';
import { TextInput } from '../components/ui/TextInput';
import { Link } from 'react-router-dom';
import { business } from '../api/business';

const Businesses: React.FC = () => {
  const [items, setItems] = useState<{ name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [filter, setFilter] = useState('');

  useEffect(()=>{
    setLoading(true);
    business.list()
      .then(list => setItems(list))
      .catch(err => setError(err.response?.data?.message || 'Failed to load businesses'))
      .finally(()=> setLoading(false));
  },[]);

  const filtered = useMemo(()=>{
    const t = filter.trim().toLowerCase();
    if (!t) return items;
    return items.filter(i => i.name.toLowerCase().includes(t));
  },[filter, items]);

  return (
    <AuthCard title="Businesses" subtitle="Browse all businesses" backTo="/profile-manage">
      <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        <TextInput placeholder="Search businesses..." value={filter} onChange={e=>setFilter(e.target.value)} />
        {loading && <p style={{ fontSize:'0.85rem' }}>Loading...</p>}
        {error && <div className="field-error" style={{ marginBottom:'0.5rem' }}>{error}</div>}
        {!loading && !error && filtered.length === 0 && <p style={{ fontSize:'0.8rem' }}>No businesses found.</p>}
        <div style={{ maxHeight:'60vh', overflowY:'auto', borderRadius:12, background:'#fff', padding:'0.5rem', boxShadow:'var(--shadow-soft)' }}>
          {filtered.map(b => (
            <div key={b.name} style={{ padding:'0.6rem 0.7rem', borderBottom:'1px solid var(--color-border)' }}>
              <Link to={`/businesses/${encodeURIComponent(b.name)}`} style={{ fontWeight:600, textDecoration:'none', color:'var(--color-text)' }}>
                {b.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </AuthCard>
  );
};
export default Businesses;
