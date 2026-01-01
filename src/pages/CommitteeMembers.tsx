import React, { useEffect, useMemo, useState } from 'react';
import { committees, AddMemberInput, UpdateMemberInput, CommitteeDto } from '../api/committee';
import { api } from '../api/client';
import { useAuth } from '../hooks/AuthContext';
import RequireProfile from '../components/RequireProfile';

const BASE_URL = "https://api.sablapraparivar.in";
// const BASE_URL = "http://localhost:3000";


export function fileUrl(path?: string) {
  if (!path) return "";
  return `${BASE_URL}/${path.replace(/^\//, "")}`;
}

const CommitteeMembers: React.FC = () => {
  const { isAdmin, initialized } = useAuth() as any;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CommitteeDto[]>([]);
  const committee = useMemo(() => (items && items.length ? items[0] : null), [items]);

  // Add form
  const [memberName, setMemberName] = useState('');
  const [post, setPost] = useState('');
  const [memberContact, setMemberContact] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Inline edit state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editMemberName, setEditMemberName] = useState('');
  const [editPost, setEditPost] = useState('');
  const [editContactNumber, setEditContactNumber] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const list = await committees.list();
        setItems(list);
      } catch (e: any) {
        setError(e?.message || 'સમિતિ લોડ કરવામાં નિષ્ફળ');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const ensureCommittee = async () => {
    if (!committee && isAdmin) {
      try {
        const created = await committees.create({ name: '  Committee' });
        setItems([created]);
        return created;
      } catch (e) {
        const list = await committees.list();
        setItems(list);
        return list[0] || null;
      }
    }
    return committee;
  };

  const pickAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowed.includes(f.type)) { setError('Only JPG/PNG/WEBP images allowed'); return; }
    if (f.size > 5 * 1024 * 1024) { setError('Image too large (max 5MB)'); return; }
    setError(null);
    setFile(f);
  };

  const uploadAddImage = async (): Promise<string | undefined> => {
    if (!file) return undefined;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await api.post('/upload/committee-member-upload', fd);
        if (res.data.error) throw new Error(res.data.error);
        return res.data.url;
      } catch (e1: any) {
        if (e1?.response?.status === 404) {
          try {
            const res2 = await api.post('/committee-member-upload', fd);
            if (res2.data.error) throw new Error(res2.data.error);
            return res2.data.url;
          } catch (e2: any) {
            if (e2?.response?.status === 404) {
              const res3 = await api.post('/previous-result-upload', fd);
              if (res3.data.error) throw new Error(res3.data.error);
              return res3.data.url;
            }
            throw e2;
          }
        }
        throw e1;
      }
    } catch (e: any) {
      setError(e.message || 'Upload failed');
      return undefined;
    } finally { setUploading(false); }
  };

  const pickEditImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowed.includes(f.type)) { setError('Only JPG/PNG/WEBP images allowed'); return; }
    if (f.size > 5 * 1024 * 1024) { setError('Image too large (max 5MB)'); return; }
    setError(null);
    setEditFile(f);
  };

  const uploadEditImage = async (): Promise<string | undefined> => {
    if (!editFile) return editImageUrl || undefined;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', editFile);
      try {
        const res = await api.post('/upload/committee-member-upload', fd);
        if (res.data.error) throw new Error(res.data.error);
        return res.data.url;
      } catch (e1: any) {
        if (e1?.response?.status === 404) {
          try {
            const res2 = await api.post('/committee-member-upload', fd);
            if (res2.data.error) throw new Error(res2.data.error);
            return res2.data.url;
          } catch (e2: any) {
            if (e2?.response?.status === 404) {
              const res3 = await api.post('/previous-result-upload', fd);
              if (res3.data.error) throw new Error(res3.data.error);
              return res3.data.url;
            }
            throw e2;
          }
        }
        throw e1;
      }
    } catch (e: any) {
      setError(e.message || 'Upload failed');
      return undefined;
    } finally { setUploading(false); }
  };

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = committee || (await ensureCommittee());
    if (!target) return;
    if (!memberName.trim() || !post.trim()) return;
    setSaving(true);
    try {
      if (!file) { setError('કૃપા કરીને એક છબી પસંદ કરો'); return; }
      const url = await uploadAddImage();
      if (!url) { setError('છબી અપલોડ નિષ્ફળ થઈ'); return; }
      const payload: AddMemberInput = { memberName: memberName.trim(), post: post.trim(), imageUrl: url, contactNumber: memberContact.trim() || undefined };
      const updated = await committees.addMember((target as any).id || (target as any)._id, payload);
      setItems([updated]);
      setMemberName('');
      setPost('');
      setMemberContact('');
      setFile(null);
    } catch (e: any) {
      setError(e?.message || 'સભ્ય ઉમેરવામાં નિષ્ફળ થયાં');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (idx: number) => {
    if (!committee) return;
    setEditingIndex(idx);
    setEditMemberName(committee.members[idx].memberName);
    setEditPost(committee.members[idx].post);
    setEditImageUrl((committee.members as any)[idx]?.imageUrl || '');
    setEditContactNumber(((committee.members as any)[idx]?.contactNumber) || '');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditMemberName('');
    setEditPost('');
    setEditContactNumber('');
  };

  const onUpdate = async (idx: number) => {
    if (!committee || idx === null) return;
    if (!editMemberName.trim() || !editPost.trim()) return;
    setSaving(true);
    try {
      const url = await uploadEditImage();
      const payload: UpdateMemberInput = { memberName: editMemberName.trim(), post: editPost.trim(), imageUrl: (url || editImageUrl.trim() || undefined), contactNumber: (editContactNumber.trim() || undefined) };
      const updated = await committees.updateMember((committee as any).id || (committee as any)._id, idx, payload);
      setItems([updated]);
      cancelEdit();
    } catch (e: any) {
      setError(e?.message || 'સભ્ય ઉમેરવામાં નિષ્ફળ થયાં');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (idx: number) => {
    if (!committee) return;
    const ok = window.confirm('આ સભ્યને કાઢી નાખીએ??');
    if (!ok) return;
    setSaving(true);
    try {
      const updated = await committees.removeMember((committee as any).id || (committee as any)._id, idx);
      setItems([updated]);
      if (editingIndex === idx) cancelEdit();
    } catch (e: any) {
      setError(e?.message || 'સભ્યને કાઢી નાખવામાં નિષ્ફળ થયાં');
    } finally {
      setSaving(false);
    }
  };

  if (!initialized) return <div style={{ padding: '1rem' }}>Loading…</div>;
  if (loading) return <div style={{ padding: '1rem' }}>Loading committee…</div>;

  return (
    <RequireProfile>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: 26, fontWeight: 800, letterSpacing: 0.2 }}>સમિતિના સભ્યો</h2>
        {error && (
          <div style={{ background: '#fdecea', border: '1px solid #f5c2c0', color: '#b23b34', padding: '0.75rem', borderRadius: 8, marginBottom: '1rem' }}>{error}</div>
        )}

        {isAdmin && (
          <section style={{ background: '#fffef5', border: '1px solid #ffe08a', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderRadius: 14, padding: '1.25rem', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, marginBottom: '0.75rem', fontSize: 18, fontWeight: 600 }}>સભ્ય ઉમેરો</h3>
            <form onSubmit={onAdd} className="add-form-grid" style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1.1fr 0.9fr 0.9fr auto auto', alignItems: 'end' }}>
              <div>
                <label htmlFor="memberName" style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 4 }}>સભ્યનું નામ</label>
                <input id="memberName" value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="દા.ત. જોન ડો" required style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #c7c7c7', background: '#fff' }} />
              </div>
              <div>
                <label htmlFor="post" style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 4 }}>ભૂમિકા</label>
                <input id="post" value={post} onChange={(e) => setPost(e.target.value)} placeholder="દા.ત. રાષ્ટ્રપતિ" required style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #c7c7c7', background: '#fff' }} />
              </div>
              <div>
                <label htmlFor="contactNumber" style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 4 }}>સંપર્ક નંબર</label>
                <input id="contactNumber" type="number" value={memberContact} onChange={(e) => setMemberContact(e.target.value)} placeholder="દા.ત. +8801XXXXXXXXX" style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #c7c7c7', background: '#fff' }} />
              </div>
              <div>
                <label htmlFor="addImageFile" style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 4 }}>ફોટો</label>
                <input id="addImageFile" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={pickAddImage} style={{ display: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button type="button" onClick={() => document.getElementById('addImageFile')?.click()} style={{ height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #9e9e9e', background: '#f2f2f2', fontWeight: 600 }}>{uploading ? 'અપલોડ કરી રહ્યું છે...' : 'છબીઓ પસંદ કરો'}</button>
                  <span style={{ fontSize: 12, color: '#666' }}>{file?.name || 'જરૂરી'}</span>
                </div>
              </div>
              <button type="submit" disabled={saving || uploading} className="add-form-submit" style={{ height: 40, padding: '0 16px', borderRadius: 8, border: '1px solid #1976d2', background: saving ? '#90caf9' : '#2196f3', color: 'white', fontWeight: 700 }}>{saving ? 'ઉમેરી રહ્યા છીએ...' : 'સભ્ય ઉમેરો'}</button>
            </form>
          </section>
        )}

        <section className="committee-grid">
          {!committee || committee.members.length === 0 ? (
            <p style={{ color: '#666' }}>હજુ સુધી કોઈ સભ્ય નથી.</p>
          ) : (
            committee.members.map((m, idx) => (
              <div key={idx} className="member-card">
                {editingIndex === idx ? (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div className="edit-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label htmlFor={`editMember-${idx}`} style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 4 }}>સભ્યનું નામ</label>
                        <input id={`editMember-${idx}`} value={editMemberName} onChange={(e) => setEditMemberName(e.target.value)} style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid #c7c7c7' }} />
                      </div>
                      <div>
                        <label htmlFor={`editPost-${idx}`} style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 4 }}>ભૂમિકા</label>
                        <input id={`editPost-${idx}`} value={editPost} onChange={(e) => setEditPost(e.target.value)} style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid #c7c7c7' }} />
                      </div>
                      <div>
                        <label htmlFor={`editContact-${idx}`} style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 4 }}>સંપર્ક નંબર</label>
                        <input id={`editContact-${idx}`} value={editContactNumber} onChange={(e) => setEditContactNumber(e.target.value)} style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid #c7c7c7' }} />
                      </div>
                      <div>
                        <label htmlFor={`editImage-${idx}`} style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 4 }}>ફોટો</label>
                        <input id={`editImage-${idx}`} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={pickEditImage} style={{ display: 'none' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button type="button" onClick={() => document.getElementById(`editImage-${idx}`)?.click()} style={{ height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid #9e9e9e', background: '#f2f2f2', fontWeight: 600 }}>{uploading ? 'Uploading…' : 'Choose Image'}</button>
                          <span style={{ fontSize: 12, color: '#666' }}>{editFile?.name || (editImageUrl ? 'Existing' : 'Optional')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="edit-form-actions" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-start' }}>
                      {isAdmin && (
                        <>
                          <button onClick={() => onUpdate(idx)} disabled={saving || uploading} style={{ height: 38, padding: '0 14px', borderRadius: 8, border: '1px solid #2e7d32', background: saving || uploading ? '#a5d6a7' : '#4caf50', color: 'white', fontWeight: 700 }}>{uploading ? 'Uploading…' : 'Save'}</button>
                          <button onClick={() => onDelete(idx)} disabled={saving || uploading} style={{ height: 38, padding: '0 14px', borderRadius: 8, border: '1px solid #b00020', background: '#d32f2f', color: 'white', fontWeight: 700 }}>કાઢી નાખો</button>
                        </>
                      )}
                      <button onClick={cancelEdit} type="button" style={{ height: 38, padding: '0 14px', borderRadius: 8, border: '1px solid #9e9e9e', background: '#f5f5f5', color: '#333', fontWeight: 700 }}>રદ કરો</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {isAdmin && (
                      <div className="member-actions">
                        <button aria-label="Edit" title="Edit" onClick={() => startEdit(idx)} className="btn" style={{ height: 36, width: 36, padding: 0, borderRadius: 8, border: '1px solid #1976d2', background: 'transparent', color: '#1976d2' }}>✏️</button>
                        <button aria-label="Delete" title="Delete" onClick={() => onDelete(idx)} className="btn" style={{ height: 36, width: 36, padding: 0, borderRadius: 8, border: '1px solid #b00020', background: 'transparent', color: '#b00020' }}>🗑️</button>
                      </div>
                    )}
                    {(m as any).imageUrl && (
                      <img src={fileUrl((m as any).imageUrl)} alt={m.memberName} className="member-avatar" />
                    )}
                    <div className="member-name">{m.memberName}</div>
                    <div className="member-post">{m.post}</div>
                    <div className="member-contact">{m.contactNumber ? `+91 ${m.contactNumber}` : ''}</div>
                  </>
                )}
              </div>
            ))
          )}
        </section>
      </div>
    </RequireProfile>
  );
};

export default CommitteeMembers;
