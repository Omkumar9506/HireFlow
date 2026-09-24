import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ROLES } from '../../constants';
import { Mail, Lock, User, Briefcase, UserCheck, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRole = searchParams.get('role') === 'RECRUITER' ? ROLES.RECRUITER : ROLES.CANDIDATE;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const user = await register({ name, email, password, role });
      if (user.role === ROLES.RECRUITER) {
        navigate('/recruiter/company'); // Encourage creating company profile first
      } else {
        navigate('/candidate/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Create your account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Start hiring talent or tracking your job applications
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Role Selector Tabs */}
      <div className="mb-5 grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
        <button
          type="button"
          onClick={() => setRole(ROLES.CANDIDATE)}
          className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all ${
            role === ROLES.CANDIDATE
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          I&apos;m a Candidate
        </button>
        <button
          type="button"
          onClick={() => setRole(ROLES.RECRUITER)}
          className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all ${
            role === ROLES.RECRUITER
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          I&apos;m an Employer
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          type="text"
          placeholder="e.g. Jordan Hayes"
          required
          icon={User}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Work or personal email"
          type="email"
          placeholder="name@example.com"
          required
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password (min. 6 characters)"
          type="password"
          placeholder="••••••••"
          required
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
          Create {role === ROLES.RECRUITER ? 'Recruiter' : 'Candidate'} Account
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
          Sign in
        </Link>
      </p>
    </div>
  );
};
