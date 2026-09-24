import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing password reset token.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Create new password
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter your new account password below
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {isSuccess ? (
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Password Reset Successful!</h3>
          <p className="mt-1 text-xs text-slate-500">
            Redirecting you to login in a moment...
          </p>
          <div className="mt-6">
            <Link to="/login">
              <Button variant="primary" size="sm" className="w-full">
                Go to Sign in
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New password"
            type="password"
            placeholder="••••••••"
            required
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            label="Confirm new password"
            type="password"
            placeholder="••••••••"
            required
            icon={Lock}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Reset Password
          </Button>
        </form>
      )}
    </div>
  );
};

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying, success, error

  React.useEffect(() => {
    const runVerification = async () => {
      if (!token) {
        setStatus('error');
        return;
      }
      try {
        await api.post('/auth/verify-email', { token });
        setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    };
    runVerification();
  }, [token]);

  return (
    <div className="text-center py-6">
      {status === 'verifying' && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <h3 className="text-sm font-semibold text-slate-900">Verifying your email address...</h3>
        </div>
      )}

      {status === 'success' && (
        <div>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Email Verified Successfully</h3>
          <p className="mt-1 text-xs text-slate-500">
            Your HireFlow account is now fully verified.
          </p>
          <div className="mt-6">
            <Link to="/login">
              <Button variant="primary" size="sm">
                Sign in to your account
              </Button>
            </Link>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Verification Link Invalid</h3>
          <p className="mt-1 text-xs text-slate-500">
            The verification token may have expired or was already used.
          </p>
          <div className="mt-6">
            <Link to="/login">
              <Button variant="outline" size="sm">
                Return to Login
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
