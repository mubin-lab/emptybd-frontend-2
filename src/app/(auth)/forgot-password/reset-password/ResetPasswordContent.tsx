/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SpinnerCustom } from '@/components/loading/Spinner';

export default function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
 
  useEffect(() => {
    const emailFromQuery = searchParams.get('email');

    if (emailFromQuery) {
      setEmail(decodeURIComponent(emailFromQuery));
    } else {
      setError('No email provided. Please request OTP again.');
      setTimeout(() => {
        router.replace('/forgot-password');
      }, 2000);
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!email || !otp || !newPassword) {
      setError('All fields are required');
      return;
    }

    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/auth/reset-password`,
        {
          email,
          otp,
          newPassword,
        }
      );

      setMessage(
        res.data.message ||
          'Password reset successful! Redirecting to login...'
      );

      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-lg p-8 rounded-xl shadow-2xl w-full max-w-md  ">
      <h2 className="text-2xl lg:text-3xl font-medium text-center mb-8 text-white">
        Reset Password
      </h2>

      {message && (
        <div className="bg-green-900/40 border border-green-500/50 text-green-300 p-4 rounded-lg mb-6 text-center">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-900/40 border border-red-500/50 text-red-300 p-4 rounded-lg mb-6 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-300 mb-2 font-medium">Email</label>
          <Input
            type="email"
            value={email}
            disabled
            className="w-full bg-gray-800/60 border-gray-700 text-gray-300 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2 font-medium">
            OTP (check your email)
          </label>
          <Input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.trim())}
            placeholder="Enter 4-digit OTP"
            maxLength={4}
            required
            className="w-full bg-gray-900/60 border-gray-700 text-white placeholder-gray-500"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2 font-medium">New Password</label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full bg-gray-900/60 border-gray-700 text-white placeholder-gray-500"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2 font-medium">Confirm Password</label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full bg-gray-900/60 border-gray-700 text-white placeholder-gray-500"
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !email || !otp || !newPassword || !confirmPassword}
          className={`w-full py-3 px-4 text-white font-semibold rounded-lg transition-all duration-300 shadow-md ${
            loading || !email || !otp || !newPassword || !confirmPassword
              ? 'bg-gray-600 cursor-not-allowed'
              : ' '
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Resetting <SpinnerCustom />
            </span>
          ) : (
            'Reset Password'
          )}
        </Button>
      </form>

      <p className="text-center mt-6 text-gray-400">
        Need a new OTP?{' '}
        <button
          onClick={() => router.push('/forgot-password')}
          className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
        >
          Resend OTP
        </button>
      </p>
    </div>
  );
}