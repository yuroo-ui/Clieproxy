'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function OAuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const userStr = searchParams.get('user');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage('Login failed. Please try again.');
        return;
      }

      if (!token || !userStr) {
        setStatus('error');
        setMessage('Invalid callback. Please try logging in again.');
        return;
      }

      try {
        // Store token and user data
        localStorage.setItem('token', token);
        const user = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem('user', JSON.stringify(user));

        setStatus('success');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } catch (error) {
        console.error('Callback error:', error);
        setStatus('error');
        setMessage('An error occurred during login.');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Signing you in...</h2>
          <p className="text-slate-400">Please wait while we complete your login</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Login Successful!</h2>
          <p className="text-slate-400 mb-4">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Login Failed</h2>
        <p className="text-slate-400 mb-4">{message}</p>
        <a
          href="/login"
          className="px-6 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-white"
        >
          Try Again
        </a>
      </div>
    </div>
  );
}
