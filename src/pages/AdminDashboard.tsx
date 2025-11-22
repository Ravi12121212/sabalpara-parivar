import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../hooks/AuthContext';
import { AuthCard } from '../components/ui/AuthCard';
import { Navigate } from 'react-router-dom';

interface UserSummary { id: string; name?: string; email?: string; phone?: string; village?: string; }

let usersCache: UserSummary[] | null = null;
let lastTokenUsed: string | null = null;

const AdminDashboard: React.FC = () => {
  const { token, isAdmin, initialized } = useAuth();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  // Minimal dev hint without process.env to avoid type issues
  // console.log('[AdminDashboard] state', { initialized, token: !!token, isAdmin });

  useEffect(() => {
    if (!initialized) return; // wait until token/isAdmin hydrated
    if (!isAdmin || !token) return;

    // Serve from cache if same token and cache exists
    if (usersCache && lastTokenUsed === token) {
      setUsers(usersCache);
      return; // Skip network
    }

    setLoading(true);
    lastTokenUsed = token;
    api.get('/admin/users')
      .then(r => {
        const arr = Array.isArray(r.data) ? r.data : r.data.users || [];
        const mapped = arr.map((u: any) => ({
          id: String(u.id || u._id),
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          village: u.village || ''
        }));
        usersCache = mapped;
        setUsers(mapped);
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  }, [initialized, isAdmin, token]);

  const removeUser = async (id: string) => {
    if (!window.confirm('Delete this user?')) return;
    setDeleting(d => ({ ...d, [id]: true }));
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(list => {
        const updated = list.filter(u => u.id !== id);
        usersCache = updated; // keep cache consistent
        return updated;
      });
    } catch (err:any) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(d => ({ ...d, [id]: false }));
    }
  };
console.log(token, isAdmin, "token ane is admin nathi maltu");

  if (!initialized) return null; // avoid redirect before hydration
  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/profile-manage" replace />;

  return (
    <AuthCard title="Admin Dashboard" subtitle="Overview" backTo="/profile-manage">
      {error && <div className="field-error" style={{ marginBottom:'0.75rem' }}>{error}</div>}
      {loading ? <p>Loading users...</p> : (
        <>
          <div style={{ marginBottom:'1rem', fontWeight:600 }}>Total Users: {users.length}</div>
          <div style={{ display:'grid', gap:'0.6rem' }}>
            {users.map(u => (
              <div key={u.id} style={{ background:'#fff', padding:'0.75rem 0.9rem', border:'1px solid var(--color-border)', borderRadius:12, display:'flex', flexDirection:'column', gap:'0.35rem', position:'relative' }}>
                <div style={{ fontSize:'0.9rem', fontWeight:600 }}>{u.name || 'Unnamed User'}</div>
                <div style={{ fontSize:'0.7rem', color:'var(--color-text-muted)' }}>{u.email || u.phone}</div>
                {u.village && <div style={{ fontSize:'0.65rem' }}>Village: {u.village}</div>}
                <button disabled={deleting[u.id]} onClick={() => removeUser(u.id)} className="btn btn-primary" style={{ alignSelf:'flex-start', padding:'0.45rem 0.9rem', fontSize:'0.7rem' }}>{deleting[u.id] ? 'Deleting...' : 'Delete User'}</button>
              </div>
            ))}
            {!users.length && !loading && <div style={{ fontSize:'0.75rem', color:'var(--color-text-muted)' }}>No users found.</div>}
          </div>
        </>
      )}
    </AuthCard>
  );
};
export default AdminDashboard;
