import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

type ResultItem = {
  _id: string;
  year?: number | string;
  name?: string;
  standard?: string;
  percentage?: number | string;
  rank?: number | string;
  notes?: string;
  gamnuName?: string;
  currentResidenceCity?: string;
  fatherFullName?: string;
  studentFullName?: string;
  mobileNumber?: string;
  currentStudyYear_25_26?: string | number;
  currentStudyYear_24_25?: string | number;
  createdAt?: string;
  resultFileUrl?: string;
};
const BASE_URL = "https://api.sablapraparivar.in";

export function fileUrl(path?: string) {
  if (!path) return "";
  return `${BASE_URL}/${path.replace(/^\//, "")}`;
}

const PreviousYearResult: React.FC = () => {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Filters & sorting
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'percentage' | 'createdAt' | 'name'>('percentage');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
  const resp = await api.get('/previous-results');
  const payload = resp.data;
  // Accept either {results: []} or direct array
  const list = Array.isArray(payload) ? payload : (payload?.results || []);
        if (mounted) setResults(list);
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load results');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Derive years for filter (must be before any returns to keep hook order stable)
  const years = useMemo(() => {
    const ys = new Set<string>();
    results.forEach((r) => {
      const y = (r.currentStudyYear_24_25 ?? r.year)?.toString();
      if (y) ys.add(y);
    });
    return Array.from(ys).sort();
  }, [results]);

  const filtered = useMemo(() => {
    let data = [...results];
    const q = search.trim().toLowerCase();
    if (q) {
      data = data.filter((r) =>
        [r.studentFullName, r.fatherFullName, r.gamnuName]
          .map((x) => (x || '').toString().toLowerCase())
          .some((v) => v.includes(q))
      );
    }
    const c = city.trim().toLowerCase();
    if (c) {
      data = data.filter((r) => (r.currentResidenceCity || '').toString().toLowerCase().includes(c));
    }
    if (yearFilter) {
      data = data.filter((r) => ((r.currentStudyYear_24_25 ?? r.year)?.toString() || '') === yearFilter);
    }
    // Sort
    data.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      let av: any = a[sortBy];
      let bv: any = b[sortBy];
      if (sortBy === 'percentage') {
        av = Number(a.percentage ?? 0);
        bv = Number(b.percentage ?? 0);
      } else if (sortBy === 'createdAt') {
        av = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        bv = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      } else if (sortBy === 'name') {
        av = (a.studentFullName || '').toString().toLowerCase();
        bv = (b.studentFullName || '').toString().toLowerCase();
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return data;
  }, [results, search, city, yearFilter, sortBy, sortDir]);

  // Helpful debug in console
  console.debug('[PreviousYearResult] counts:', { total: results.length, shown: filtered.length });

  // Resolve absolute URL for static files served from backend /public
  const apiBase: string = (api.defaults.baseURL || '').toString();
  const backendOrigin = apiBase.replace(/\/?api\/?$/, '');
  // const fileUrl = (u?: string) => {
  //   if (!u) return '';
  //   if (/^https?:\/\//i.test(u)) return u;
  //   return `${backendOrigin}${u.startsWith('/') ? u : `/${u}`}`;
  // };
  
  console.log(fileUrl, "aa");
  
  // const fileUrl = 'https://api.sablapraparivar.in/api'
  // Only now perform conditional returns (after hooks are declared)
  if (loading) return <p>Loading previous year results...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
  <div className="container" style={{ padding: '1rem', maxWidth: 1200, margin: '0 auto', color: '#111' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Previous Year Results</h1>
      <p style={{ marginTop: 0, color: '#666' }}>Total records: {results.length} · Showing: {filtered.length}</p>
      {/* Controls */}
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'0.5rem', margin:'0.75rem 0 1rem'
      }}>
        <input
          type="text"
          placeholder="નામ / પિતા / ગામ શોધો"
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          style={{ padding:'0.6rem', border:'1px solid #ccc', borderRadius:8 }}
        />
        <input
          type="text"
          placeholder="Filter by city"
          value={city}
          onChange={(e)=>setCity(e.target.value)}
          style={{ padding:'0.6rem', border:'1px solid #ccc', borderRadius:8 }}
        />
        <select
          value={yearFilter}
          onChange={(e)=>setYearFilter(e.target.value)}
          style={{ padding:'0.6rem', border:'1px solid #ccc', borderRadius:8 }}
        >
          <option value="">All Years</option>
          {years.map((y)=> (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <select value={sortBy} onChange={(e)=>setSortBy(e.target.value as any)} style={{ padding:'0.6rem', border:'1px solid #ccc', borderRadius:8 }}>
            <option value="percentage">Sort: Percentage</option>
            <option value="createdAt">Sort: Created</option>
            <option value="name">Sort: Name</option>
          </select>
          <select value={sortDir} onChange={(e)=>setSortDir(e.target.value as any)} style={{ padding:'0.6rem', border:'1px solid #ccc', borderRadius:8 }}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
          <button
            type="button"
            onClick={() => { setSearch(''); setCity(''); setYearFilter(''); setSortBy('percentage'); setSortDir('desc'); }}
            style={{ padding:'0.6rem 0.8rem', border:'1px solid #ccc', borderRadius:8, background:'#fff', cursor:'pointer' }}
          >
            Reset Filters
          </button>
        </div>
      </div>
      {results.length === 0 ? (
        <div style={{ background:'rgba(0,0,0,0.03)', border:'1px dashed #ddd', borderRadius:8, padding:'0.75rem' }}>
          <p style={{ marginTop:0 }}>No results found. Try clearing filters (search/city/year). If the API returns an empty list, data may not be seeded yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'hidden' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', color:'#111', tableLayout:'fixed' }}>
            <thead>
              <tr style={{ position:'sticky', top:0, background:'var(--color-card, #fff)', boxShadow:'0 1px 0 rgba(0,0,0,0.06)' }}>
                <th style={{ textAlign: 'left', borderBottom:'1px solid #e5e5e5', padding:'0.5rem' }}>Gamnu Name</th>
                <th style={{ textAlign: 'left', borderBottom:'1px solid #e5e5e5', padding:'0.5rem' }}>Residence City</th>
                <th style={{ textAlign: 'left', borderBottom:'1px solid #e5e5e5', padding:'0.5rem' }}>Father Name</th>
                <th style={{ textAlign: 'left', borderBottom:'1px solid #e5e5e5', padding:'0.5rem' }}>Student Name</th>
                <th style={{ textAlign: 'left', borderBottom:'1px solid #e5e5e5', padding:'0.5rem' }}>Mobile</th>
                <th style={{ textAlign: 'left', borderBottom:'1px solid #e5e5e5', padding:'0.5rem' }}>Current Year 25-26</th>
                <th style={{ textAlign: 'left', borderBottom:'1px solid #e5e5e5', padding:'0.5rem' }}>Previous Year 24-25</th>
                <th style={{ textAlign: 'left', borderBottom:'1px solid #e5e5e5', padding:'0.5rem' }}>Percentage</th>
                <th style={{ textAlign: 'left', borderBottom:'1px solid #e5e5e5', padding:'0.5rem' }}>Created At</th>
                <th style={{ textAlign: 'left', borderBottom:'1px solid #e5e5e5', padding:'0.5rem' }}>Result Image</th>
                <th style={{ textAlign: 'left', borderBottom:'1px solid #e5e5e5', padding:'0.5rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding:'1rem', textAlign:'center', color:'#666', borderBottom:'1px solid #e5e5e5' }}>
                    No rows match current filters. Clear search/city/year to see all.
                  </td>
                </tr>
              ) : filtered.map((r) => (
                <tr key={r._id}>
                  <td style={{ borderBottom:'1px solid #f0f0f0', padding:'0.5rem', whiteSpace:'normal', wordBreak:'break-word' }}>{r.gamnuName ?? '-'}</td>
                  <td style={{ borderBottom:'1px solid #f0f0f0', padding:'0.5rem', whiteSpace:'normal', wordBreak:'break-word' }}>{r.currentResidenceCity ?? '-'}</td>
                  <td style={{ borderBottom:'1px solid #f0f0f0', padding:'0.5rem', whiteSpace:'normal', wordBreak:'break-word' }}>{r.fatherFullName ?? '-'}</td>
                  <td style={{ borderBottom:'1px solid #f0f0f0', padding:'0.5rem', whiteSpace:'normal', wordBreak:'break-word' }}>{r.studentFullName ?? '-'}</td>
                  <td style={{ borderBottom:'1px solid #f0f0f0', padding:'0.5rem', whiteSpace:'normal', wordBreak:'break-word' }}>{r.mobileNumber ?? '-'}</td>
                  <td style={{ borderBottom:'1px solid #f0f0f0', padding:'0.5rem' }}>{r.currentStudyYear_25_26 ?? '-'}</td>
                  <td style={{ borderBottom:'1px solid #f0f0f0', padding:'0.5rem' }}>{r.currentStudyYear_24_25 ?? '-'}</td>
                  <td style={{ borderBottom:'1px solid #f0f0f0', padding:'0.5rem' }}>{r.percentage ?? '-'}</td>
                  <td style={{ borderBottom:'1px solid #f0f0f0', padding:'0.5rem' }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</td>
                  <td style={{ borderBottom:'1px solid #f0f0f0', padding:'0.5rem' }}>
                    {r.resultFileUrl ? (
                      <a href={fileUrl(r.resultFileUrl)} target="_blank" rel="noreferrer" style={{ display:'inline-block' }}>
                        <img
                          src={fileUrl(r.resultFileUrl)}
                          alt="Result"
                          style={{ width:64, height:64, objectFit:'cover', borderRadius:6, border:'1px solid #eee' }}
                          onError={(e)=>{ (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </a>
                    ) : (
                      <div style={{ display:'flex', flexDirection:'column', gap:6, }}>
                        {(() => {
                          const inputId = `file-${r._id}`;
                          const onFileChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
                            const file = ev.target.files?.[0];
                            if (!file) return;
                            try {
                              const fd = new FormData();
                              fd.append('file', file);
                              const up = await api.post('/previous-result-upload', fd, {
                                headers: { 'Content-Type': 'multipart/form-data' },
                              });
                              const url = up.data?.url;
                              if (!url) throw new Error('Upload did not return URL');
                              await api.post(`/previous-results/image`, { url, id: r._id });
                              // refresh list
                              const resp = await api.get('/previous-results');
                              const payload = resp.data;
                              const list = Array.isArray(payload) ? payload : (payload?.results || []);
                              setResults(list);
                            } catch (e: any) {
                              alert(e?.response?.data?.message || e?.message || 'Upload failed');
                            } finally {
                              ev.target.value = '';
                            }
                          };
                          return (
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <input
                                id={inputId}
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={onFileChange}
                                style={{ position:'absolute', width:1, height:1, padding:0, margin:-1, overflow:'hidden', clip:'rect(0 0 0 0)', border:0 }}
                              />
                              <label
                                htmlFor={inputId}
                                style={{
                                  display:'inline-block',
                                  padding:'0.4rem 0.7rem',
                                  border:'1px solid blue',
                                  borderRadius:6,
                                  background:'#007bff', // sky blue
                                  color:'#ffffff',
                                  cursor:'pointer',
                                  fontSize:12,
                                  boxShadow:'0 1px 2px rgba(0,0,0,0.06)'
                                }}
                              >
                                Select image/pdf
                              </label>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </td>
                  <td style={{ borderBottom:'1px solid #f0f0f0', padding:'0.5rem' }}>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm('Are you sure you want to delete this result?')) return;
                        try {
                          setDeletingId(r._id);
                          await api.delete(`/previous-results/${r._id}`);
                          // Refresh list after delete
                          const resp = await api.get('/previous-results');
                          const payload = resp.data;
                          const list = Array.isArray(payload) ? payload : (payload?.results || []);
                          setResults(list);
                        } catch (e) {
                          console.error('Delete failed', e);
                          alert('Delete failed');
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                      disabled={deletingId === r._id}
                      style={{ padding:'0.35rem 0.6rem', border:'1px solid #e00', color:'#e00', background:'#fff', borderRadius:6, cursor:'pointer' }}
                    >
                      {deletingId === r._id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PreviousYearResult;
