import React, { useState } from 'react';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { AuthCard } from '../components/ui/AuthCard';
import { TextInput } from '../components/ui/TextInput';
import { Button } from '../components/ui/Button';

const ResetPassword: React.FC = () => {
  const [form, setForm] = useState({ token: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/auth/reset-password', form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  return (
    <AuthCard title="Reset Password" subtitle="Enter token & new password" backTo="/login">
      <form onSubmit={submit}>
        {error && <div className="field-error" style={{ marginBottom:'0.75rem' }}>{error}</div>}
        {success && <div style={{ color:'var(--color-success)', fontSize:'0.8rem', marginBottom:'0.75rem' }}>Updated. Redirecting...</div>}
        <TextInput placeholder="Token" value={form.token} onChange={e => setForm({ ...form, token: e.target.value })} />
        <TextInput type="password" placeholder="New Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <Button type="submit" full>Reset →</Button>
      </form>
    </AuthCard>
  );
};
export default ResetPassword;
