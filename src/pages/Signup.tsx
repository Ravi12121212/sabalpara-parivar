import React, { useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../hooks/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { AuthCard } from "../components/ui/AuthCard";
import { TextInput } from "../components/ui/TextInput";
import { PhoneInput } from "../components/ui/PhoneInput";
import { Button } from "../components/ui/Button";

const Signup: React.FC = () => {
  const [form, setForm] = useState({ email: "", phone: "+91", password: "" });
  const [error, setError] = useState<string | null>(null);
  const { setToken, setHasProfile } = useAuth();
  const navigate = useNavigate();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { data } = await api.post("/auth/signup", form);
      const receivedToken = data.accessToken || data.token || data.jwt || data.idToken;
      console.debug('[signup] raw response keys:', Object.keys(data));
      if (!receivedToken) {
        console.warn('[signup] No token field found in response');
      }
      if (receivedToken) {
        setToken(receivedToken);
        setHasProfile(false); // new user, definitely no profile yet
        navigate('/user-details');
      } else {
        setError('No token returned');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error");
    }
  };
  return (
    <AuthCard title="Sign Up" subtitle="Create an account" backTo="/login">
      <form onSubmit={submit}>
        {error && (
          <div className="field-error" style={{ marginBottom: "0.75rem" }}>
            {error}
          </div>
        )}
        <TextInput
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <PhoneInput
          value={form.phone}
          onChange={(val) => setForm({ ...form, phone: val })}
        />
        <TextInput
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button type="submit" full>
          Sign Up →
        </Button>
        <div className="form-alt">
          Have an account? <Link to="/login">Login</Link>
        </div>
      </form>
    </AuthCard>
  );
};
export default Signup;
