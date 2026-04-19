'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Wallet, Key, History, Plus, ArrowRight, TrendingUp } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface WalletData {
  id: string;
  balance: number;
  currency: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  currency: string;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Load wallet
      const walletResponse = await fetch(`${API_URL}/cpa/wallet`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        setWallet(walletData.wallet);
      }

      // Load history
      const historyResponse = await fetch(`${API_URL}/cpa/wallet/history`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setTransactions(historyData.transactions.deposits || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;

    try {
      const token = localStorage.getItem('token');
      setDepositing(true);

      const response = await fetch(`${API_URL}/cpa/wallet/deposit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(depositAmount),
          currency: 'USD',
          paymentMethod: 'demo',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setWallet(data.wallet);
        setShowDepositModal(false);
        setDepositAmount('');
        alert('Deposit successful!');
        loadData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Deposit failed');
    } finally {
      setDepositing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Wallet className="h-6 w-6 text-primary-400" />
            <span className="text-lg font-bold">CPA System</span>
          </Link>

          <div className="flex items-center space-x-4">
            {wallet && (
              <div className="hidden md:flex items-center space-x-2 bg-slate-700/50 px-4 py-2 rounded-lg">
                <span className="text-sm text-slate-300">Balance:</span>
                <span className="text-lg font-bold text-primary-400">
                  ${wallet.balance.toFixed(2)}
                </span>
              </div>
            )}
            <Link
              href="/settings"
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Key className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl p-6 mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome to CPA System!</h1>
          <p className="text-primary-100">
            Your universal LLM billing platform. Track usage, manage wallets, and monitor costs.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Balance Card */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-300 font-medium">Balance</h3>
              <Wallet className="h-5 w-5 text-primary-400" />
            </div>
            <div className="text-3xl font-bold mb-2">
              ${wallet?.balance.toFixed(2) || '0.00'}
            </div>
            <button
              onClick={() => setShowDepositModal(true)}
              className="flex items-center text-sm text-primary-400 hover:text-primary-300"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span>Add Funds</span>
            </button>
          </div>

          {/* API Keys Card */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-300 font-medium">API Keys</h3>
              <Key className="h-5 w-5 text-primary-400" />
            </div>
            <Link
              href="/settings"
              className="flex items-center text-sm text-primary-400 hover:text-primary-300"
            >
              <span>Manage Keys</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {/* Usage History Card */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-300 font-medium">History</h3>
              <History className="h-5 w-5 text-primary-400" />
            </div>
            <Link
              href="/usage"
              className="flex items-center text-sm text-primary-400 hover:text-primary-300"
            >
              <span>View History</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {/* Calculator Card */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-300 font-medium">Calculator</h3>
              <TrendingUp className="h-5 w-5 text-primary-400" />
            </div>
            <Link
              href="/calculator"
              className="flex items-center text-sm text-primary-400 hover:text-primary-300"
            >
              <span>Estimate Cost</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700/50">
          <div className="p-6 border-b border-slate-700/50">
            <h2 className="text-xl font-bold">Recent Transactions</h2>
          </div>

          <div className="divide-y divide-slate-700/50">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No transactions yet. Add funds to get started!
              </div>
            ) : (
              transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-lg ${
                        tx.type === 'DEPOSIT'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {tx.type === 'DEPOSIT' ? (
                        <Plus className="h-5 w-5" />
                      ) : (
                        <History className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {tx.type === 'DEPOSIT' ? 'Deposit' : 'LLM Usage'}
                      </div>
                      <div className="text-sm text-slate-400">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-bold ${
                        tx.type === 'DEPOSIT' ? 'text-green-400' : 'text-slate-300'
                      }`}
                    >
                      {tx.type === 'DEPOSIT' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </div>
                    <div className="text-sm text-slate-500">{tx.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {transactions.length > 5 && (
            <div className="p-4 text-center border-t border-slate-700/50">
              <Link
                href="/usage"
                className="text-primary-400 hover:text-primary-300 text-sm"
              >
                View all transactions →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add Funds</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="10.00"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Quick Add</h3>
                <div className="flex flex-wrap gap-2">
                  {[10, 25, 50, 100].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setDepositAmount(amount.toString())}
                      className="px-3 py-1 bg-primary-500/20 hover:bg-primary-500/30 rounded-lg text-sm transition-colors"
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={depositing || !depositAmount}
                  className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {depositing ? 'Processing...' : 'Add Funds'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
