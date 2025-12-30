import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../api/client';
import { AuthCard } from '../components/ui/AuthCard';
import { TextInput } from '../components/ui/TextInput';
import { Link } from 'react-router-dom';

interface Village { id: string | number; name: string; population?: number; district?: string; }

const VillageList: React.FC = () => {
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
      api.get('/profile/villages')
        .then(r => {
          let raw = Array.isArray(r.data) ? r.data : r.data.villages || [];
          // If raw array is of strings, map to object form
          if (raw.length && typeof raw[0] === 'string') {
            raw = raw.map((name: string, idx: number) => ({ id: idx, name }));
          }
          setVillages(raw);
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load villages'))
      .finally(()=> setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return villages;
    return villages.filter(v => v.name.toLowerCase().includes(term) || String(v.id).includes(term));
  }, [filter, villages]);

  return (
    <AuthCard title="Villages" subtitle="Browse the list" backTo="/profile-manage">
      <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        <TextInput placeholder="Search villages..." value={filter} onChange={e=>setFilter(e.target.value)} />
        {loading && <p style={{ fontSize:'0.85rem' }}>Loading...</p>}
        {error && <div className="field-error" style={{ marginBottom:'0.5rem' }}>{error}</div>}
        {!loading && !error && filtered.length === 0 && <p style={{ fontSize:'0.8rem' }}>No villages match.</p>}
        <div style={{ maxHeight: '60vh', overflowY:'auto' }}>
          <div className="village-grid" style={{ borderRadius:12, background:'#fff', padding:'0.5rem', boxShadow:'var(--shadow-soft)' }}>
            {filtered.map(v => (
              <div key={v.id} className="village-card">
                <Link to={`/villages/${encodeURIComponent(v.name)}`} className="village-link">
                  <div className="village-name">{v.name}</div>
                  <div className="village-meta">{v.population ? `Population: ${v.population}` : ''}{v.district ? (v.population ? ' · ' : '') + v.district : ''}</div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthCard>
  );
};
export default VillageList;
