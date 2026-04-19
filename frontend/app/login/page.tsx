'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Github, Twitter, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Google tidak ada di lucide-react — pakai SVG inline official Google icon
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const [loading, setLoading] = useState('');
  const [tab, setTab]         = useState<'oauth' | 'email'>('oauth');
  const [form, setForm]       = useState({ email: '', password: '', isRegister: false });
  const [error, setError]     = useState('');

  const handleOAuthLogin = (provider: string) => {
    setLoading(provider);
    window.location.href = `${API_URL}/auth/oauth/${provider}`;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('email');
    setError('');
    try {
      const endpoint = form.isRegister ? '/auth/register' : '/auth/login';
      const res  = await fetch(`${API_URL}${endpoint}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal');
      localStorage.setItem('token', data.token);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-xl mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CPA System</h1>
          <p className="text-slate-400">Manage your LLM billing</p>
        </div>

        {/* Tab toggle */}
        <div className="flex gap-1 p-1 bg-slate-800 rounded-xl mb-6">
          {(['oauth', 'email'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
              {t === 'oauth' ? '🔐 OAuth' : '📧 Email'}
            </button>
          ))}
        </div>

        {tab === 'oauth' ? (
          <div className="space-y-3">
            {/* Google */}
            <button onClick={() => handleOAuthLogin('google')} disabled={loading !== ''}
              className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 hover:bg-slate-100 transition-all p-4 rounded-xl font-medium disabled:opacity-60">
              {loading === 'google'
                ? <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                : <><GoogleIcon className="h-5 w-5" /><span>Continue with Google</span></>}
            </button>

            {/* GitHub */}
            <button onClick={() => handleOAuthLogin('github')} disabled={loading !== ''}
              className="w-full flex items-center justify-center gap-3 bg-slate-800 text-white hover:bg-slate-700 transition-all p-4 rounded-xl font-medium border border-slate-600 disabled:opacity-60">
              {loading === 'github'
                ? <Loader2 className="h-5 w-5 animate-spin" />
                : <><Github className="h-5 w-5" /><span>Continue with GitHub</span></>}
            </button>

            {/* Twitter / X */}
            <button onClick={() => handleOAuthLogin('twitter')} disabled={loading !== ''}
              className="w-full flex items-center justify-center gap-3 bg-black text-white hover:bg-slate-900 transition-all p-4 rounded-xl font-medium disabled:opacity-60">
              {loading === 'twitter'
                ? <Loader2 className="h-5 w-5 animate-spin" />
                : (
                  <>
                    {/* X logo (Twitter renamed) - SVG inline */}
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>Continue with X (Twitter)</span>
                  </>
                )}
            </button>

            <p className="text-xs text-slate-500 text-center pt-2">
              OAuth login memerlukan konfigurasi CLIENT_ID di backend
            </p>
          </div>
        ) : (
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"/>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Password</label>
              <input type="password" required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"/>
            </div>
            <button type="submit" disabled={loading === 'email'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading === 'email' && <Loader2 className="h-4 w-4 animate-spin"/>}
              {form.isRegister ? 'Daftar' : 'Masuk'}
            </button>
            <button type="button" onClick={() => setForm(f => ({ ...f, isRegister: !f.isRegister }))}
              className="w-full text-sm text-slate-400 hover:text-white transition-colors">
              {form.isRegister ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
            </button>
          </form>
        )}

        {/* Info */}
        <div className="mt-6 bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <h3 className="font-medium text-white mb-2 text-sm">✅ Supported Integrations</h3>
          <div className="grid grid-cols-2 gap-1 text-xs text-slate-400">
            {['ChatGPT Plus','Kilo Kiro','Antigravity','OpenRouter','OpenAI','Anthropic','DeepSeek','Gemini'].map(s => (
              <span key={s}>✓ {s}</span>
            ))}
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
