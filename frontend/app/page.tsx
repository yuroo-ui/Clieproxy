'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Wallet, Key, History, Calculator, Menu, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface WalletData {
  id: string;
  balance: number;
  currency: string;
  status: string;
}

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setWallet(null);
        return;
      }

      const response = await fetch(`${API_URL}/cpa/wallet`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWallet(data.wallet);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    }
  };

  const handleDeposit = async () => {
    const amount = prompt('Enter deposit amount (USD):');
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/cpa/wallet/deposit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: parseFloat(amount), currency: 'USD' }),
      });

      if (response.ok) {
        const data = await response.json();
        setWallet(data.wallet);
        alert('Deposit successful!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Deposit failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Wallet className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold">CPA System</span>
            </Link>

            {/* Desktop Menu */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/dashboard" className="hover:text-primary-400 transition-colors">
                Dashboard
              </Link>
              <Link href="/usage" className="hover:text-primary-400 transition-colors">
                Usage History
              </Link>
              <Link href="/calculator" className="hover:text-primary-400 transition-colors">
                Cost Calculator
              </Link>
              <Link href="/settings" className="hover:text-primary-400 transition-colors">
                Settings
              </Link>
            </nav>

            {/* User Info */}
            <div className="hidden md:flex items-center space-x-4">
              {wallet ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-300">Balance:</span>
                  <span className="text-lg font-bold text-primary-400">
                    ${wallet.balance.toFixed(2)}
                  </span>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-800/90 backdrop-blur-lg border-b border-slate-700">
            <nav className="px-4 py-4 space-y-4">
              <Link
                href="/dashboard"
                className="block hover:text-primary-400 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/usage"
                className="block hover:text-primary-400 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Usage History
              </Link>
              <Link
                href="/calculator"
                className="block hover:text-primary-400 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Cost Calculator
              </Link>
              <Link
                href="/settings"
                className="block hover:text-primary-400 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Settings
              </Link>
              {wallet ? (
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <span className="text-sm text-slate-300">Balance:</span>
                  <span className="text-lg font-bold text-primary-400">
                    ${wallet.balance.toFixed(2)}
                  </span>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="block px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Universal LLM Billing System
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Track & monetize LLM usage with 25+ supported models. Real-time cost calculation,
            wallet management, and usage analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/calculator"
              className="px-8 py-4 bg-primary-500 hover:bg-primary-600 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <Calculator className="h-5 w-5" />
              <span>Start Using</span>
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <Wallet className="h-5 w-5" />
              <span>View Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 hover:border-primary-500/50 transition-all">
            <Wallet className="h-12 w-12 text-primary-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">User Wallets</h3>
            <p className="text-slate-300">
              Track balance, deposit funds, and view transaction history all in one place.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 hover:border-primary-500/50 transition-all">
            <Key className="h-12 w-12 text-primary-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">25+ LLM Models</h3>
            <p className="text-slate-300">
              Support for Grok, Claude, Qwen, DeepSeek, Llama, GPT, Gemini, and more.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 hover:border-primary-500/50 transition-all">
            <History className="h-12 w-12 text-primary-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Usage Tracking</h3>
            <p className="text-slate-300">
              Real-time token tracking, cost calculation, and usage analytics.
            </p>
          </div>
        </div>

        {/* Pricing Preview */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">Popular LLM Pricing</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 text-center">
              <h3 className="text-lg font-bold mb-2">Grok-4</h3>
              <div className="text-primary-400 mb-2">$0.50 / 1K</div>
              <div className="text-slate-400 text-sm">Input</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 text-center">
              <h3 className="text-lg font-bold mb-2">Claude-3.5</h3>
              <div className="text-primary-400 mb-2">$3.00 / 1K</div>
              <div className="text-slate-400 text-sm">Input</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 text-center">
              <h3 className="text-lg font-bold mb-2">Qwen-35B</h3>
              <div className="text-primary-400 mb-2">$0.30 / 1K</div>
              <div className="text-slate-400 text-sm">Input</div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 text-center">
              <h3 className="text-lg font-bold mb-2">DeepSeek</h3>
              <div className="text-primary-400 mb-2">$0.14 / 1K</div>
              <div className="text-slate-400 text-sm">Input</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 border-t border-slate-700/50 pt-8">
          <div className="text-center text-slate-400">
            <p>CPA System - Cost Per Action for All LLMs</p>
            <p className="mt-2">© 2026 CPA System. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
