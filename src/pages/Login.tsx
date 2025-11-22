import React, { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../hooks/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { AuthCard } from '../components/ui/AuthCard';
import { TextInput } from '../components/ui/TextInput';
import { PhoneInput } from '../components/ui/PhoneInput';
import { Button } from '../components/ui/Button';

const Login: React.FC = () => {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [error, setError] = useState<string | null>(null);
  const { setToken, setIsAdmin } = useAuth();
  const navigate = useNavigate();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload: any = { password: form.password };
      if (mode === 'email') {
        payload.email = form.identifier;
      } else {
        payload.phone = form.identifier.startsWith('+') ? form.identifier : `+91${form.identifier.replace(/[^\d]/g,'')}`;
      }
      const { data } = await api.post('/auth/login', payload);
      const receivedToken = data.accessToken || data.token || data.jwt || data.idToken;
      if (!receivedToken) return setError('No token returned');
      console.log('[login] raw response keyss:',receivedToken);
      
      setToken(receivedToken);
      const adminFlag = [data.isAdmin, data.admin, data.is_admin, data.role].some(v => {
        if (typeof v === 'string') return /admin/i.test(v) && !/false|0/i.test(v);
        if (typeof v === 'number') return v === 1;
        return v === true;
      });
      console.log("sssssssss",adminFlag);
      
      setIsAdmin(adminFlag);
      localStorage.setItem('isAdmin', adminFlag ? 'true' : 'false');
      setTimeout(() => {
        navigate(adminFlag ? '/admin-dashboard' : '/profile-manage');
      }, 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error');
    }
  };
  return (
    <AuthCard title="Login" subtitle="" backTo="/signup">
      <form onSubmit={submit}>
        {error && <div className="field-error" style={{ marginBottom:'0.75rem' }}>{error}</div>}
        <div className="seg-toggle" style={{ marginBottom:'0.75rem' }}>
          <button type="button" onClick={() => { setMode('email'); setForm(f=>({ ...f, identifier:'' })); }}
            className={`seg-option ${mode==='email' ? 'active' : ''}`}>Email</button>
          <button type="button" onClick={() => { setMode('phone'); setForm(f=>({ ...f, identifier:'+91' })); }}
            className={`seg-option ${mode==='phone' ? 'active' : ''}`}>Phone</button>
        </div>
        {mode === 'email' ? (
          <TextInput placeholder="Email" value={form.identifier} onChange={e => setForm({ ...form, identifier: e.target.value.toLowerCase().trim() })} />
        ) : (
          <PhoneInput value={form.identifier || '+91'} onChange={val => setForm({ ...form, identifier: val })} />
        )}
        <TextInput type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <Button type="submit" full>Login →</Button>
        <div className="form-alt"><Link to="/forgot-password">Forgot password?</Link></div>
        <div className="form-alt">No account? <Link to="/signup">Sign Up</Link></div>
      </form>
    </AuthCard>
  );
};
export default Login;
