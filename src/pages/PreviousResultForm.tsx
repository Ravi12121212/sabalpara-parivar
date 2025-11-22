import React, { useState } from 'react';
import { api } from '../api/client';
import { AuthCard } from '../components/ui/AuthCard';
import { useNavigate } from 'react-router-dom';

interface FormState {
  gamnuName: string;
  currentResidenceCity: string;
  fatherFullName: string;
  studentFullName: string;
  mobileNumber: string;
  currentStudyYear_25_26: string;
  currentStudyYear_24_25: string;
  percentage: string;
  resultFileUrl?: string;
}

const empty: FormState = {
  gamnuName: '',
  currentResidenceCity: '',
  fatherFullName: '',
  studentFullName: '',
  mobileNumber: '',
  currentStudyYear_25_26: '',
  currentStudyYear_24_25: '',
  percentage: '',
};

const PreviousResultForm: React.FC = () => {
  const [form, setForm] = useState<FormState>(empty);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowed = ['application/pdf','image/jpeg','image/png','image/jpg'];
    if (!allowed.includes(f.type)) { setError('Only PDF or JPG/PNG images allowed'); return; }
    if (f.size > 5*1024*1024) { setError('File too large (max 5MB)'); return; }
    setError(null);
    setFile(f);
  };

  const uploadFile = async (): Promise<string | undefined> => {
    if (!file) return undefined;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/previous-result-upload', fd);
      if (res.data.error) throw new Error(res.data.error);
      return res.data.url;
    } catch (e:any) {
      setError(e.message || 'Upload failed');
      return undefined;
    } finally { setUploading(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const missing: string[] = [];
    if (!form.gamnuName.trim()) missing.push('gamnu name');
    if (!form.currentResidenceCity.trim()) missing.push('current residence city');
    if (!form.fatherFullName.trim()) missing.push('father full name');
    if (!form.studentFullName.trim()) missing.push('student full name');
    if (!form.mobileNumber.trim()) missing.push('mobile number');
    if (!form.currentStudyYear_25_26.trim()) missing.push('current study year 25/26');
    if (!form.currentStudyYear_24_25.trim()) missing.push('current study year 24/25');
    if (form.percentage === '' || isNaN(Number(form.percentage))) missing.push('percentage');
    if (missing.length) { setError('Please fill: ' + missing.join(', ')); return; }
    setSaving(true);
    try {
      let url = await uploadFile();
      const payload = {
        gamnuName: form.gamnuName,
        currentResidenceCity: form.currentResidenceCity,
        fatherFullName: form.fatherFullName,
        studentFullName: form.studentFullName,
        mobileNumber: form.mobileNumber,
        currentStudyYear_25_26: form.currentStudyYear_25_26,
        currentStudyYear_24_25: form.currentStudyYear_24_25,
        percentage: Number(form.percentage),
        resultFileUrl: url,
      };
      await api.post('/previous-results', payload);
      navigate('/');
    } catch (e:any) {
      setError(e.response?.data?.message || e.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <AuthCard title="ગત વર્ષનું પરિણામ" subtitle="તમારી અભ્યાસ વિગતો સબમિટ કરો" backTo="/">
      <form onSubmit={submit} className="member-editor">
        {error && <div className="field-error" style={{ marginBottom:'0.75rem' }}>{error}</div>}
        <input className="input" placeholder="ગામનુ નામ" value={form.gamnuName} onChange={e=>setForm(f=>({...f,gamnuName:e.target.value}))} />
        <input className="input" placeholder="વર્તમાન રહેઠાણ શહેર" value={form.currentResidenceCity} onChange={e=>setForm(f=>({...f,currentResidenceCity:e.target.value}))} />
        <input className="input" placeholder="પિતાનું પૂરું નામ" value={form.fatherFullName} onChange={e=>setForm(f=>({...f,fatherFullName:e.target.value}))} />
        <input className="input" placeholder="વિદ્યાર્થીનું પૂરું નામ" value={form.studentFullName} onChange={e=>setForm(f=>({...f,studentFullName:e.target.value}))} />
        <input className="input" placeholder="મોબાઈલ નંબર" value={form.mobileNumber} onChange={e=>setForm(f=>({...f,mobileNumber:e.target.value}))} />
        <input className="input" placeholder="વર્તમાન અભ્યાસ વર્ષ (૨૫/૨૬)" value={form.currentStudyYear_25_26} onChange={e=>setForm(f=>({...f,currentStudyYear_25_26:e.target.value}))} />
        <input className="input" placeholder="ગત અભ્યાસ વર્ષ (૨૪/૨૫)" value={form.currentStudyYear_24_25} onChange={e=>setForm(f=>({...f,currentStudyYear_24_25:e.target.value}))} />
        <input className="input" placeholder="ટકાવારી" type="number" value={form.percentage} onChange={e=>setForm(f=>({...f,percentage:e.target.value}))} />
        <div style={{ background:'#fffbe6', border:'1px solid #f5d36c', color:'#5a4a00', padding:'0.75rem 0.9rem', borderRadius:8, fontSize:'0.75rem', lineHeight:1.4, display:'flex', flexDirection:'column', gap:'0.4rem', marginTop:'0.5rem' }}>
          <strong style={{ fontSize:'0.78rem' }}>નોંધ:</strong>
          <span>પરિણામ ફોટો or PDF ફોર્મેટ માં દાખલ કરી શકાશે.</span>
          <span>પરિણામ માં બાળક નું નામ, ટકાવારી, ધોરણ, શાળા નુ નામ સ્પષ્ટ દેખાય એવી રીતે દાખલ કરવું.</span>
          <span>વધુ માર્ગદર્શન માટે સંપર્ક કરો:</span>
          <span style={{ fontWeight:600 }}>પંકજભાઈ - 99255 59824</span>
        </div>
        <div className="file-picker" style={{ marginTop:'0.5rem' }}>
          <button type="button" className="file-picker-button" onClick={() => document.getElementById('prev-result-file')?.click()}>{file ? 'ફાઇલ બદલો' : 'ફાઇલ અપલોડ કરો (PDF/Image)'}{uploading && ' ...અપલોડ કરી રહ્યું છે'}</button>
          <span className="file-name">{file?.name || 'કોઈ ફાઇલ પસંદ કરી નથી'}</span>
          <input id="prev-result-file" className="file-hidden" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={pickFile} disabled={uploading} />
        </div>
        <div className="profile-actions" style={{ marginTop:'1rem' }}>
          <button disabled={saving || uploading} className="btn btn-primary" type="submit">{saving ? 'સાચવી રહ્યું છે...' : 'સાચવો'}</button>
        </div>
      </form>
    </AuthCard>
  );
};
export default PreviousResultForm;
