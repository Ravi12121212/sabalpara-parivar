import React, { useEffect, useState, useRef } from 'react';
import { api } from '../api/client';
import { useAuth } from '../hooks/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AuthCard } from '../components/ui/AuthCard';

interface FamilyMemberForm {
  memberName: string;
  age?: number | '';
  std?: string;
  resultImage?: string;
  percentage?: number | '';
  activityType?: string; // study | business | none
  businessWorkType?: string; // personal | job | none
  businessName?: string;
  businessDescription?: string;
  memberPhone?: string;
  relation?: string;
  noneCategory?: string; // house_wife | retired | child
}

interface ProfileForm {
  village?: string;
  name?: string;
  age?: number | '';
  currentAddress?: string;
  businessDetails?: string;
  phoneNumber?: string;
  cityName?: string;
  businessType?: string; // personal | job | none
  familyMembers: FamilyMemberForm[];
}

const emptyMember: FamilyMemberForm = { memberName: '', age: '', std: '', resultImage: '', percentage: '', activityType: 'study', businessWorkType: '', businessName: '', businessDescription: '', memberPhone: '', relation: '', noneCategory: '' };

const UserDetailsForm: React.FC = () => {
  const { token, setHasProfile, hasProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileForm>({ familyMembers: [emptyMember] });
  const [uploading, setUploading] = useState<Record<number, boolean>>({}); // used during submit now
  const [uploadError, setUploadError] = useState<Record<number, string | null>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<number, File>>({});
  const [shouldShowForm, setShouldShowForm] = useState(false);
  // Autocomplete state for village
  const [villageQuery, setVillageQuery] = useState('');
  const [villageSuggestions, setVillageSuggestions] = useState<string[]>([]);
  const [villageLoading, setVillageLoading] = useState(false);
  const [showVillageSuggestions, setShowVillageSuggestions] = useState(false);
  const villageDebounceRef = useRef<number | null>(null);
  // Suppress dropdown re-open immediately after selecting a suggestion
  const suppressSuggestionsRef = useRef(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api.get('/profile', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => {
        const { profile, familyMembers } = r.data;
        if (profile) {
          setShouldShowForm(true);
          setHasProfile(true);
          setForm({
            village: profile.village || '',
            name: profile.name || '',
            age: profile.age ?? '',
            currentAddress: profile.currentAddress || '',
            businessDetails: profile.businessDetails || '',
            phoneNumber: profile.phoneNumber || '',
            cityName: profile.cityName || '',
            businessType: profile.businessType || '',
            familyMembers: (familyMembers && familyMembers.length ? familyMembers : [emptyMember]).map((m: any) => ({
              memberName: m.memberName || '',
              age: m.age ?? '',
              std: m.std ?? '',
              resultImage: m.resultImage ?? '',
              percentage: m.percentage ?? '',
              activityType: m.activityType || 'study',
              businessWorkType: m.businessWorkType || '',
              businessName: m.businessName || '',
              businessDescription: m.businessDescription || '',
              memberPhone: m.memberPhone || '',
              relation: m.relation || '',
              noneCategory: m.noneCategory || '',
            })),
          });
          setVillageQuery(profile.village || '');
          return;
        }
        setShouldShowForm(true);
        setHasProfile(false);
        setForm({
          village: '',
          name: '',
          age: '',
          currentAddress: '',
          businessDetails: '',
          phoneNumber: '',
          cityName: '',
          businessType: '',
          familyMembers: (familyMembers && familyMembers.length ? familyMembers : [emptyMember]).map((m: any) => ({
            memberName: m.memberName || '',
            age: m.age ?? '',
            std: m.std ?? '',
            resultImage: m.resultImage ?? '',
            percentage: m.percentage ?? '',
            activityType: m.activityType || 'study',
            businessWorkType: m.businessWorkType || '',
            businessName: m.businessName || '',
            businessDescription: m.businessDescription || '',
            memberPhone: m.memberPhone || '',
            relation: m.relation || '',
            noneCategory: m.noneCategory || '',
          })),
        });
        setVillageQuery('');
      })
      .catch(err => {
        const msg = err.response?.data?.message || err.message;
        setError(msg);
        setShouldShowForm(true);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const fetchVillages = async (term: string) => {
    try {
      setVillageLoading(true);
      const res = await api.get('/profile/villages');
      let raw = Array.isArray(res.data) ? res.data : res.data.villages || [];
      if (raw.length && typeof raw[0] === 'string') {
        raw = raw.map((name: string) => name);
      } else if (raw.length && typeof raw[0] === 'object') {
        raw = raw.map((v: any) => v.name);
      }
      const lower = term.toLowerCase();
      const filtered = lower ? raw.filter((n: string) => n.toLowerCase().includes(lower)) : raw.slice(0, 10);
      setVillageSuggestions(filtered.slice(0, 10));
    } catch (e) {
      setVillageSuggestions([]);
    } finally {
      setVillageLoading(false);
    }
  };

  useEffect(() => {
    if (!shouldShowForm) return;
    if (villageDebounceRef.current) window.clearTimeout(villageDebounceRef.current);
    villageDebounceRef.current = window.setTimeout(() => {
      if (suppressSuggestionsRef.current) {
        suppressSuggestionsRef.current = false;
        return;
      }
      if (villageQuery.trim()) {
        fetchVillages(villageQuery.trim());
        setShowVillageSuggestions(true);
      } else {
        setVillageSuggestions([]);
        setShowVillageSuggestions(false);
      }
    }, 250);
    return () => {
      if (villageDebounceRef.current) window.clearTimeout(villageDebounceRef.current);
    };
  }, [villageQuery, shouldShowForm]);

  const villageWrapperRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!villageWrapperRef.current) return;
      if (!villageWrapperRef.current.contains(e.target as Node)) {
        setShowVillageSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectVillage = (name: string) => {
    suppressSuggestionsRef.current = true;
    setForm(f => ({ ...f, village: name }));
    setVillageQuery(name);
    setShowVillageSuggestions(false);
  };

  const updateMember = (idx: number, patch: Partial<FamilyMemberForm>) => {
    setForm(f => ({ ...f, familyMembers: f.familyMembers.map((m,i) => i===idx ? { ...m, ...patch } : m) }));
  };
  const addMember = () => setForm(f => ({ ...f, familyMembers: [...f.familyMembers, emptyMember] }));
  const removeMember = (idx: number) => {
    setForm(f => ({ ...f, familyMembers: f.familyMembers.filter((_,i)=>i!==idx) }));
    setSelectedFiles(files => {
      const next: Record<number, File> = {};
      let ni = 0;
      Object.keys(files).sort((a,b)=>Number(a)-Number(b)).forEach(k => {
        const i = Number(k);
        if (i === idx) return;
        next[ni++] = files[i];
      });
      return next;
    });
    setUploadError(errs => {
      const next: Record<number,string|null> = {};
      let ni = 0;
      Object.keys(errs).sort((a,b)=>Number(a)-Number(b)).forEach(k => {
        const i = Number(k);
        if (i === idx) return;
        next[ni++] = errs[i];
      });
      return next;
    });
    setUploading(up => {
      const next: Record<number,boolean> = {};
      let ni = 0;
      Object.keys(up).sort((a,b)=>Number(a)-Number(b)).forEach(k => {
        const i = Number(k);
        if (i === idx) return;
        next[ni++] = up[i];
      });
      return next;
    });
  };

  const handleFileChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg','image/png','image/jpg'];
    if (!allowed.includes(file.type)) {
      setUploadError(errs => ({ ...errs, [idx]: 'Only JPG, JPEG or PNG allowed' }));
      return;
    }
    const maxSize = 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      setUploadError(errs => ({ ...errs, [idx]: 'File too large (max 1MB)' }));
      return;
    }
    setUploadError(errs => ({ ...errs, [idx]: null }));
    setSelectedFiles(f => ({ ...f, [idx]: file }));
    // Show local preview only; real upload will occur on form submit
    const previewUrl = URL.createObjectURL(file);
    updateMember(idx, { resultImage: previewUrl });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Front-end validation: all fields mandatory (except image now optional)
    const errs: string[] = [];
    if (!form.village?.trim()) errs.push('village');
    if (!form.name?.trim()) errs.push('name');
    if (form.age === '' || form.age == null) errs.push('age');
    if (!form.cityName?.trim()) errs.push('cityName');
    if (!form.currentAddress?.trim()) errs.push('currentAddress');
    if (!form.businessDetails?.trim()) errs.push('businessDetails');
    if (!form.familyMembers.length) errs.push('at least one family member');
    form.familyMembers.forEach((m, i) => {
      if (!m.memberName.trim()) errs.push(`member ${i+1} name`);
      const type = m.activityType || 'study';
      if (type === 'study') {
        if (m.age === '' || m.age == null) errs.push(`member ${i+1} age`);
        if (!m.std?.trim()) errs.push(`member ${i+1} std`);
        if (m.percentage === '' || m.percentage == null) errs.push(`member ${i+1} percentage`);
      } else if (type === 'business') {
        if (m.age === '' || m.age == null) errs.push(`member ${i+1} age`);
        if (!m.businessWorkType?.trim()) errs.push(`member ${i+1} work type`);
        if (!m.businessName?.trim()) errs.push(`member ${i+1} business name`);
        if (!m.businessDescription?.trim()) errs.push(`member ${i+1} business description`);
      } else if (type === 'none') {
        if (m.age === '' || m.age == null) errs.push(`member ${i+1} age`);
        if (!m.noneCategory?.trim()) errs.push(`member ${i+1} none category`);
      }
    });
    if (errs.length) {
      setLoading(false);
      setError('Please complete required fields: ' + errs.join(', '));
      return;
    }
    try {
      // Upload all files first and replace preview URLs with real URLs
      const uploadedMembers = await Promise.all(form.familyMembers.map(async (m, i) => {
        const file = selectedFiles[i];
        if (!file) {
          // No new file chosen; keep existing URL (may be preview/blob - ideally server accepts or ignore)
          return { ...m };
        }
        setUploading(up => ({ ...up, [i]: true }));
        try {
          const fd = new FormData();
          fd.append('file', file);
          const res = await api.post('/upload', fd);
          const realUrl = res.data.url;
          return { ...m, resultImage: realUrl };
        } catch (err: any) {
          throw new Error(err.response?.data?.message || `Upload failed for member ${i+1}`);
        } finally {
          setUploading(up => ({ ...up, [i]: false }));
        }
      }));
      const payload = {
        village: form.village,
        name: form.name,
        age: form.age === '' ? undefined : form.age,
        currentAddress: form.currentAddress,
        businessDetails: form.businessDetails,
        phoneNumber: form.phoneNumber,
        cityName: form.cityName,
        businessType: form.businessType || undefined,
        familyMembers: uploadedMembers.map(m => ({
          memberName: m.memberName,
          age: m.age === '' ? undefined : m.age,
          activityType: m.activityType || 'study',
          std: (m.activityType||'study') === 'study' ? m.std : undefined,
          percentage: (m.activityType||'study') === 'study' ? (m.percentage === '' ? undefined : m.percentage) : undefined,
          resultImage: (m.activityType||'study') === 'study' ? m.resultImage : undefined,
          businessWorkType: m.activityType === 'business' ? m.businessWorkType : undefined,
          businessName: m.activityType === 'business' ? m.businessName : undefined,
          businessDescription: m.activityType === 'business' ? m.businessDescription : undefined,
          memberPhone: m.memberPhone?.trim() ? m.memberPhone : undefined,
          relation: m.relation?.trim() ? m.relation : undefined,
          noneCategory: m.activityType === 'none' ? m.noneCategory || undefined : undefined,
        })),
      };
      await api.post('/profile', payload);
      setHasProfile(true); // mark profile as completed
      // After successful save, logout user and redirect to login
      logout();
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  if (!shouldShowForm) {
    return loading ? <p>Loading...</p> : null;
  }

  return (
    <AuthCard title="Create Profile" subtitle="Enter your details" backTo="/">
      {hasProfile && <div className="info-text" style={{marginBottom:'0.75rem'}}>Profile already exists. You can update details and save again.</div>}
      <form onSubmit={submit} className="member-editor">
        {error && <div className="field-error" style={{ marginBottom:'0.75rem' }}>{error}</div>}
        <div className="logo-wrapper" style={{ textAlign:'center', marginBottom:'1rem' }}>
          <img src="/logo.svg" alt="Logo" style={{ height:'70px', width:'auto' }} />
        </div>
        <div className="autocomplete-wrapper" ref={villageWrapperRef} style={{ position:'relative' }}>
          <input
            className="input"
            placeholder="Village"
            value={villageQuery || form.village || ''}
            onChange={e => {
              const v = e.target.value;
              setVillageQuery(v);
              setForm(f => ({ ...f, village: v }));
            }}
            onFocus={() => { if (villageSuggestions.length) setShowVillageSuggestions(true); }}
            onBlur={() => {
              const exact = villageSuggestions.find(s => s.toLowerCase() === (villageQuery||'').toLowerCase());
              if (exact) selectVillage(exact); else setShowVillageSuggestions(false);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const exact = villageSuggestions.find(s => s.toLowerCase() === (villageQuery||'').toLowerCase());
                if (exact) { e.preventDefault(); selectVillage(exact); }
              }
            }}
            autoComplete="off"
          />
          {showVillageSuggestions && (villageLoading || villageSuggestions.length > 0) && (
            <ul className="autocomplete-list" style={{ position:'absolute', top:'100%', left:0, right:0, zIndex:20, listStyle:'none', margin:0, padding:0, background:'#fff', border:'1px solid var(--color-border)', borderRadius:8, boxShadow:'var(--shadow-soft)', maxHeight:200, overflowY:'auto' }}>
              {villageLoading && <li className="autocomplete-item" style={{ padding:'0.5rem 0.75rem', fontSize:'0.8rem', color:'var(--color-text-soft)' }}>Searching...</li>}
              {!villageLoading && villageSuggestions.length === 0 && <li className="autocomplete-item" style={{ padding:'0.5rem 0.75rem', fontSize:'0.8rem', color:'var(--color-text-soft)' }}>No matches</li>}
              {!villageLoading && villageSuggestions.map(name => (
                <li
                  key={name}
                  className="autocomplete-item"
                  style={{ padding:'0.5rem 0.75rem', cursor:'pointer' }}
                  onMouseDown={e => { e.preventDefault(); selectVillage(name); }}
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <input className="input" placeholder="Name" value={form.name||''} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
          <input className="input" placeholder="Current Address" value={form.currentAddress||''} onChange={e=>setForm(f=>({...f,currentAddress:e.target.value}))} />
        <input className="input" placeholder="City Name" value={form.cityName||''} onChange={e=>setForm(f=>({...f,cityName:e.target.value}))} />
        <input className="input" placeholder="Age" type="number" value={form.age||''} onChange={e=>setForm(f=>({...f,age:e.target.value?Number(e.target.value):''}))} />
        <select className="input" value={form.businessType||''} onChange={e=>setForm(f=>({...f,businessType:e.target.value}))}>
          <option value="">Business Type</option>
          <option value="personal">Personal</option>
          <option value="job">Job</option>
          <option value="none">None</option>
        </select>
        <textarea className="input" placeholder="Business Details" value={form.businessDetails||''} onChange={e=>setForm(f=>({...f,businessDetails:e.target.value}))} />
        <div className="member-grid" style={{ marginTop:'0.5rem' }}>
          <strong style={{ gridColumn:'1 / -1' }}>Family Members</strong>
          {form.familyMembers.map((m, idx) => (
            <div key={idx} className="member-card">
              <h4>Member {idx+1}</h4>
              <input className="input" placeholder="Member Name" value={m.memberName} onChange={e=>updateMember(idx,{memberName:e.target.value})} />
              <select className="input" value={m.activityType||'study'} onChange={e=>updateMember(idx,{activityType:e.target.value})}>
                <option value="study">Study</option>
                <option value="business">Business</option>
                <option value="none">None / Home</option>
              </select>
              <div className="inline-actions">
                <input className="input" placeholder="Age" type="number" value={m.age||''} onChange={e=>updateMember(idx,{age:e.target.value?Number(e.target.value):''})} />
                { (m.activityType||'study') === 'study' && (
                  <input className="input" placeholder="Std" value={m.std||''} onChange={e=>updateMember(idx,{std:e.target.value})} />
                )}
                { m.activityType === 'business' && (
                  <select className="input" value={m.businessWorkType||''} onChange={e=>updateMember(idx,{businessWorkType:e.target.value})}>
                    <option value="">Work Type</option>
                    <option value="personal">Personal</option>
                    <option value="job">Job</option>
                    <option value="none">None</option>
                  </select>
                )}
              </div>
              { (m.activityType||'study') === 'study' && m.resultImage && <img src={m.resultImage} alt={m.memberName} className="member-img" />}
              { (m.activityType||'study') === 'study' && (
                <div className="file-picker">
                  <button type="button" className="file-picker-button" onClick={() => {
                    const input = document.getElementById(`member-file-${idx}`) as HTMLInputElement | null;
                    input?.click();
                  }}>{selectedFiles[idx] || m.resultImage ? 'Change Result' : 'Choose Result'}</button>
                  <span className="file-name">{selectedFiles[idx]?.name || (m.resultImage ? 'Selected' : 'No file chosen')}</span>
                  <input
                    id={`member-file-${idx}`}
                    className="file-hidden"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={e => handleFileChange(idx, e)}
                    disabled={uploading[idx]}
                  />
                </div>
              )}
              { (m.activityType||'study') === 'study' && (
                <>
                  {uploading[idx] && <span className="uploading-flag">Uploading...</span>}
                  {uploadError[idx] && <div className="error-text">{uploadError[idx]}</div>}
                  <input className="input" placeholder="Percentage" type="number" value={m.percentage||''} onChange={e=>updateMember(idx,{percentage:e.target.value?Number(e.target.value):''})} />
                </>
              )}
              { m.activityType === 'business' && (
                <>
                  <input className="input" placeholder="Business / Employer Name" value={m.businessName||''} onChange={e=>updateMember(idx,{businessName:e.target.value})} />
                  <input className="input" placeholder="Business Description / Role" value={m.businessDescription||''} onChange={e=>updateMember(idx,{businessDescription:e.target.value})} />
                </>
              )}
              { m.activityType === 'none' && (
                <>
                  <select className="input" value={m.noneCategory||''} onChange={e=>updateMember(idx,{noneCategory:e.target.value})}>
                    <option value="">Select Category</option>
                    <option value="house_wife">House Wife</option>
                    <option value="retired">Retired</option>
                    <option value="child">Child</option>
                  </select>
                </>
              )}
              <input className="input" placeholder="Member Phone (optional)" value={m.memberPhone||''} onChange={e=>updateMember(idx,{memberPhone:e.target.value})} />
              <select className="input" value={m.relation||''} onChange={e=>updateMember(idx,{relation:e.target.value})}>
                <option value="">Relation</option>
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="wife">Wife</option>
                <option value="son">Son</option>
                <option value="daughter">Daughter</option>
                <option value="brother">Brother</option>
                <option value="other">Other</option>
              </select>
              {form.familyMembers.length>1 && <button type="button" className="member-remove" onClick={()=>removeMember(idx)}>×</button>}
            </div>
          ))}
          <button type="button" className="btn btn-primary" style={{ gridColumn:'1 / -1' }} onClick={addMember}>Add Member</button>
        </div>
        <div className="profile-actions">
          <button disabled={loading} className="btn btn-primary" type="submit">{loading? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </AuthCard>
  );
};
export default UserDetailsForm;
