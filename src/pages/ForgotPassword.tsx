import React, { useState } from 'react';
import { api } from '../api/client';
import { AuthCard } from '../components/ui/AuthCard';
import { TextInput } from '../components/ui/TextInput';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [sentToken, setSentToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { data } = await api.post('/auth/forgot-password', { identifier });
      setSentToken(data.resetToken);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  return (
    <AuthCard title="Forgot Password" subtitle="We will send a reset token" backTo="/login">
      <form onSubmit={submit}>
        {error && <div className="field-error" style={{ marginBottom:'0.75rem' }}>{error}</div>}
        <TextInput placeholder="Email or Phone" value={identifier} onChange={e => setIdentifier(e.target.value)} />
        <Button type="submit" full>Send Token →</Button>
        {sentToken && <div className="form-alt" style={{ fontSize: '0.65rem' }}>Dev token: {sentToken}</div>}
        <div className="form-alt"><Link to="/reset-password">Already have token?</Link></div>
      </form>
    </AuthCard>
  );
};
export default ForgotPassword;
