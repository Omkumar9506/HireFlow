import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Reset your password
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter your registered email and we will send a password reset link
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {isSubmitted ? (
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Reset Link Sent</h3>
          <p className="mt-1 text-xs text-slate-500">
            If an account exists with <strong className="text-slate-800">{email}</strong>, check your inbox for instructions.
          </p>
          <div className="mt-6">
            <Link to="/login">
              <Button variant="outline" size="sm" className="w-full">
                Back to Sign in
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="name@company.com"
            required
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Send Reset Link
          </Button>

          <p className="mt-4 text-center text-xs text-slate-500">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
};
