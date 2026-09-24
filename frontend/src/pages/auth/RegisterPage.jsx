import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ROLES } from '../../constants';
import {
  Mail,
  Lock,
  User,
  Briefcase,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  RotateCw,
} from 'lucide-react';

export const RegisterPage = () => {
  const { register, sendOtp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRole = searchParams.get('role') === 'RECRUITER' ? ROLES.RECRUITER : ROLES.CANDIDATE;

  // Step 1: Details, Step 2: OTP Verification
  const [step, setStep] = useState(1);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialRole);
  const [otp, setOtp] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [timer, setTimer] = useState(60);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Step 1: Send OTP to user email
  const handleInitiateRegistration = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (name.trim().length < 2) {
      setError('Please enter your full name (minimum 2 characters).');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      await sendOtp(email.trim(), name.trim(), 'REGISTRATION');
      setStep(2);
      setTimer(60);
      setSuccessMsg(`We sent a 6-digit verification code to ${email}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (timer > 0 || isResending) return;
    setError('');
    setIsResending(true);

    try {
      await sendOtp(email.trim(), name.trim(), 'REGISTRATION');
      setTimer(60);
      setSuccessMsg(`A fresh verification code was sent to ${email}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Step 2: Verify OTP & finalize account registration
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setIsLoading(true);

    try {
      const user = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        otp: cleanOtp,
      });

      if (user.role === ROLES.RECRUITER) {
        navigate('/recruiter/company');
      } else {
        navigate('/candidate/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check your code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          {step === 1 ? 'Create your HireFlow account' : 'Verify your email address'}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {step === 1
            ? 'Start hiring top talent or applying for high-impact roles'
            : `Enter the 6-digit code sent to ${email}`}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${step === 1 ? 'text-blue-600' : 'text-slate-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-blue-600 text-white font-bold' : 'bg-slate-200 text-slate-600'}`}>
            1
          </span>
          <span>Details</span>
        </div>
        <div className="w-8 h-px bg-slate-200" />
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${step === 2 ? 'text-blue-600' : 'text-slate-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-blue-600 text-white font-bold' : 'bg-slate-200 text-slate-600'}`}>
            2
          </span>
          <span>OTP Verification</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {step === 1 ? (
        /* STEP 1: Registration Form */
        <div>
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

          <form onSubmit={handleInitiateRegistration} className="space-y-4">
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

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
              icon={ArrowRight}
            >
              Continue with Email Verification
            </Button>
          </form>
        </div>
      ) : (
        /* STEP 2: Email OTP Verification Form */
        <div>
          <div className="mb-5 p-3 rounded-lg bg-blue-50/70 border border-blue-200/80 flex items-center justify-between text-xs text-blue-900">
            <div className="truncate mr-2">
              <span className="text-[11px] text-blue-600 block">Sent to:</span>
              <strong className="truncate block">{email}</strong>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp('');
                setError('');
                setSuccessMsg('');
              }}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline shrink-0"
            >
              Change
            </button>
          </div>

          <form onSubmit={handleVerifyAndRegister} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoFocus
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] text-xl font-mono font-bold py-3 px-4 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 text-center">
                Code expires in 10 minutes
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
              disabled={otp.length !== 6}
            >
              Verify & Create Account
            </Button>

            {/* Resend OTP cooldown timer */}
            <div className="pt-2 text-center text-xs">
              {timer > 0 ? (
                <span className="text-slate-400">
                  Resend code in <strong className="text-slate-600 font-mono">0:{timer < 10 ? `0${timer}` : timer}</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1.5"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  {isResending ? 'Sending...' : 'Resend verification code'}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError('');
                setSuccessMsg('');
              }}
              className="w-full text-xs text-slate-500 hover:text-slate-700 font-medium py-1.5 flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to details
            </button>
          </form>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
          Sign in
        </Link>
      </p>
    </div>
  );
};

