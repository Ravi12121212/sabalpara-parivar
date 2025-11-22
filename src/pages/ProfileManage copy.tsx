import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import { api } from '../api/client';
import { AuthCard } from '../components/ui/AuthCard';

interface Member { id?: string; memberName: string; age?: number | ''; std?: string; percentage?: number | ''; resultImage?: string; }
interface ProfileData { village?: string; name?: string; currentAddress?: string; businessDetails?: string; totalFamilyMembers?: number | ''; familyMembers: Member[]; }

const emptyMember: Member = { memberName: '', age: '', std: '', percentage: '', resultImage: '' };

const ProfileManage: React.FC = () => {
  const { token, profileData, profileLoading, setToken } = useAuth() as any;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileData>({ familyMembers: [emptyMember] });
  const [editing, setEditing] = useState(false);
console.log(token,"q");

  // Populate form from cached profileData when available
  useEffect(() => {
    if (!profileData?.profile) return;
    const { profile, familyMembers } = profileData;
    setForm({
      village: profile.village || '',
      name: profile.name || '',
      currentAddress: profile.currentAddress || '',
      businessDetails: profile.businessDetails || '',
      totalFamilyMembers: profile.totalFamilyMembers ?? '',
      familyMembers: (familyMembers || []).map((m:any) => ({
        id: m.id || m._id,
        memberName: m.memberName || '',
        age: m.age ?? '',
        std: m.std ?? '',
        percentage: m.percentage ?? '',
        resultImage: m.resultImage || ''
      }))
    });
  }, [profileData]);

  const updateMember = (idx: number, patch: Partial<Member>) => {
    setForm(f => ({ ...f, familyMembers: f.familyMembers.map((m,i) => i===idx ? { ...m, ...patch } : m) }));
  };
  const addMember = () => setForm(f => ({ ...f, familyMembers: [...f.familyMembers, emptyMember] }));
  const removeMember = (idx: number) => setForm(f => ({ ...f, familyMembers: f.familyMembers.filter((_,i)=>i!==idx) }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const payload = {
        village: form.village,
        name: form.name,
        currentAddress: form.currentAddress,
        businessDetails: form.businessDetails,
        totalFamilyMembers: form.totalFamilyMembers === '' ? undefined : form.totalFamilyMembers,
        familyMembers: form.familyMembers.filter(m => m.memberName.trim()).map(m => ({
          memberName: m.memberName,
          age: m.age === '' ? undefined : m.age,
          std: m.std,
          percentage: m.percentage === '' ? undefined : m.percentage,
          resultImage: m.resultImage
        }))
      };
      await api.post('/profile', payload);
      setEditing(false);
    } catch (err:any) {
      setError(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  // Hydrate token if missing but present in localStorage (direct navigation scenario)
  useEffect(() => {
    if (!token) {
      const stored = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;
      if (stored && stored !== token) setToken(stored);
    }
  }, [token, setToken]);

  // Show loading/hydration indicator instead of expired message while attempting hydration
  if (!token) {
    const stored = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;
    console.log(stored, "as");
    
    if (stored) return <p>Restoring session...</p>;
    return (
      <AuthCard title="Session" subtitle="Please login">
        <p>Your session has expired.</p>
        <Link to="/login" className="btn btn-primary">Go to Login</Link>
      </AuthCard>
    );
  }
  if (profileLoading && !profileData) return <p>Loading profile...</p>;

  return (
    <AuthCard title="My Profile" subtitle={editing ? 'Edit your details' : 'Overview'} backTo="/dashboard">
      {error && <div className="field-error" style={{ marginBottom:'0.75rem' }}>{error}</div>}
      {!editing && (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
          <div><strong>Name:</strong> {form.name || '—'}</div>
          <div><strong>Village:</strong> {form.village || '—'}</div>
          <div><strong>Current Address:</strong> {form.currentAddress || '—'}</div>
          <div><strong>Business Details:</strong> {form.businessDetails || '—'}</div>
          <div><strong>Total Family Members:</strong> {form.totalFamilyMembers || '—'}</div>
          <div>
            <strong>Family Members:</strong>
            <ul style={{ margin:0, paddingLeft:'1rem' }}>
              {form.familyMembers.map((fm,i)=>(
                <li key={i}>{fm.memberName || 'Member'}{fm.age ? `, Age: ${fm.age}` : ''}{fm.std ? `, Std: ${fm.std}`: ''}</li>
              ))}
            </ul>
          </div>
          <button className="btn btn-primary" type="button" onClick={()=>setEditing(true)}>Edit Profile</button>
        </div>
      )}
      {editing && (
        <form onSubmit={save} style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>
          <input className="input" placeholder="Name" value={form.name||''} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
          <input className="input" placeholder="Village" value={form.village||''} onChange={e=>setForm(f=>({...f,village:e.target.value}))} />
          <input className="input" placeholder="Current Address" value={form.currentAddress||''} onChange={e=>setForm(f=>({...f,currentAddress:e.target.value}))} />
          <input className="input" placeholder="Business Details" value={form.businessDetails||''} onChange={e=>setForm(f=>({...f,businessDetails:e.target.value}))} />
          <input className="input" placeholder="Total Family Members" type="number" value={form.totalFamilyMembers||''} onChange={e=>setForm(f=>({...f,totalFamilyMembers:e.target.value?Number(e.target.value):''}))} />
          <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
            <strong>Family Members</strong>
            {form.familyMembers.map((m,idx)=>(
              <div key={idx} style={{ border:'1px solid var(--color-border)', padding:'0.6rem', borderRadius:8, display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                <input className="input" placeholder="Member Name" value={m.memberName} onChange={e=>updateMember(idx,{memberName:e.target.value})} />
                <input className="input" placeholder="Age" type="number" value={m.age||''} onChange={e=>updateMember(idx,{age:e.target.value?Number(e.target.value):''})} />
                <input className="input" placeholder="Std" value={m.std||''} onChange={e=>updateMember(idx,{std:e.target.value})} />
                <input className="input" placeholder="Percentage" type="number" value={m.percentage||''} onChange={e=>updateMember(idx,{percentage:e.target.value?Number(e.target.value):''})} />
                {form.familyMembers.length>1 && <button type="button" className="btn btn-ghost" onClick={()=>removeMember(idx)}>Remove</button>}
              </div>
            ))}
            <button type="button" className="btn btn-primary" onClick={addMember}>Add Member</button>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.5rem' }}>
            <button disabled={saving} className="btn btn-primary" type="submit">{saving? 'Saving...' : 'Save'}</button>
            <button type="button" className="btn" onClick={()=>{ setEditing(false); }}>Cancel</button>
          </div>
        </form>
      )}
      <div className="form-footer" style={{ marginTop:'1rem' }}>
        Need advanced changes? <Link to="/user-details">Open full form</Link>
      </div>
    </AuthCard>
  );
};
export default ProfileManage;