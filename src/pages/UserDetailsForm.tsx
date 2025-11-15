import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../hooks/AuthContext';
import { useNavigate } from 'react-router-dom';

interface FamilyMemberForm {
  memberName: string;
  age?: number | '';
  std?: string;
  resultImage?: string;
  percentage?: number | '';
}

interface ProfileForm {
  village?: string;
  name?: string;
  totalFamilyMembers?: number | '';
  currentAddress?: string;
  businessDetails?: string;
  familyMembers: FamilyMemberForm[];
}

const emptyMember: FamilyMemberForm = { memberName: '', age: '', std: '', resultImage: '', percentage: '' };

const UserDetailsForm: React.FC = () => {
  const { token, setHasProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileForm>({ familyMembers: [emptyMember] });
  const [shouldShowForm, setShouldShowForm] = useState(false);
console.log('[UserDetailsForm] rendering, token present:', !!token);

  useEffect(() => {
    if (!token) return;
    console.log('[UserDetailsForm] fetching existing profile data11');
    
    setLoading(true);
    api.get('/profile', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => {
        const { profile, familyMembers } = r.data;
        if (profile) {
          // Profile already exists; redirect instead of showing form
          setHasProfile(true);
          navigate('/village-list');
          return; // skip setting form
        }
        // No profile -> show form with any family member data (if provided)
        setShouldShowForm(true);
        setHasProfile(false);
        setForm({
          village: '',
          name: '',
          totalFamilyMembers: '',
          currentAddress: '',
          businessDetails: '',
          familyMembers: (familyMembers && familyMembers.length ? familyMembers : [emptyMember]).map((m: any) => ({
            memberName: m.memberName || '',
            age: m.age ?? '',
            std: m.std ?? '',
            resultImage: m.resultImage ?? '',
            percentage: m.percentage ?? '',
          })),
        });
      })
      .catch(err => {
        const msg = err.response?.data?.message || err.message;
        console.warn('[UserDetailsForm] /profile error:', msg);
        setError(msg);
        // In error case still allow form creation (user can create new profile if authorized)
        setShouldShowForm(true);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const updateMember = (idx: number, patch: Partial<FamilyMemberForm>) => {
    setForm(f => ({ ...f, familyMembers: f.familyMembers.map((m,i) => i===idx ? { ...m, ...patch } : m) }));
  };
  const addMember = () => setForm(f => ({ ...f, familyMembers: [...f.familyMembers, emptyMember] }));
  const removeMember = (idx: number) => setForm(f => ({ ...f, familyMembers: f.familyMembers.filter((_,i)=>i!==idx) }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        ...form,
        totalFamilyMembers: form.totalFamilyMembers === '' ? undefined : form.totalFamilyMembers,
        familyMembers: form.familyMembers.filter(m => m.memberName.trim()).map(m => ({
          ...m,
            age: m.age === '' ? undefined : m.age,
            percentage: m.percentage === '' ? undefined : m.percentage,
        })),
      };
      await api.post('/profile', payload);
      setHasProfile(true); // mark profile as completed
      navigate('/village-list');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  if (!shouldShowForm) {
    return loading ? <p>Loading...</p> : null; // nothing while redirecting or waiting
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 640 }}>
      <h2>User Details</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <input placeholder="Village" value={form.village||''} onChange={e=>setForm(f=>({...f,village:e.target.value}))} />
        <input placeholder="Name" value={form.name||''} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
        <input placeholder="Total Family Members" type="number" value={form.totalFamilyMembers||''} onChange={e=>setForm(f=>({...f,totalFamilyMembers:e.target.value?Number(e.target.value):''}))} />
        <input placeholder="Current Address" value={form.currentAddress||''} onChange={e=>setForm(f=>({...f,currentAddress:e.target.value}))} />
        <textarea placeholder="Business Details" value={form.businessDetails||''} onChange={e=>setForm(f=>({...f,businessDetails:e.target.value}))} />
      </div>
      <h3 style={{ marginTop: '1rem' }}>Family Members</h3>
      {form.familyMembers.map((m, idx) => (
        <div key={idx} style={{ border: '1px solid #ddd', padding: '0.5rem', marginBottom: '0.5rem' }}>
          <input placeholder="Member Name" value={m.memberName} onChange={e=>updateMember(idx,{memberName:e.target.value})} />
          <input placeholder="Age" type="number" value={m.age||''} onChange={e=>updateMember(idx,{age:e.target.value?Number(e.target.value):''})} />
          <input placeholder="Std" value={m.std||''} onChange={e=>updateMember(idx,{std:e.target.value})} />
          <input placeholder="Result Image URL" value={m.resultImage||''} onChange={e=>updateMember(idx,{resultImage:e.target.value})} />
          <input placeholder="Percentage" type="number" value={m.percentage||''} onChange={e=>updateMember(idx,{percentage:e.target.value?Number(e.target.value):''})} />
          {form.familyMembers.length>1 && <button type="button" onClick={()=>removeMember(idx)}>Remove</button>}
        </div>
      ))}
      <button type="button" onClick={addMember}>Add Member</button>
      <div style={{ marginTop: '1rem' }}>
        <button disabled={loading} type="submit">{loading? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
};
export default UserDetailsForm;
