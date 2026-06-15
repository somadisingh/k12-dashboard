import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AcademicCapIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../hooks/useAuth.js';
import Button from '../components/common/Button.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = () => {
    setEmail('admin@lincoln.edu');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <AcademicCapIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Lincoln K-12 Academy</h1>
          <p className="text-sm text-slate-500">Staff Performance Evaluation Platform</p>
        </div>

        <div className="card p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Sign in</h2>
          <p className="text-sm text-slate-500 mb-6">Welcome back. Please enter your details.</p>

          {error && (
            <div className="mb-4">
              <ErrorBanner message={error} />
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lincoln.edu"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>

          <button
            onClick={demoLogin}
            type="button"
            className="mt-3 w-full text-sm text-primary hover:text-primary-dark font-medium"
          >
            Use demo admin credentials
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Demo: admin@lincoln.edu / password123
        </p>
      </div>
    </div>
  );
}
