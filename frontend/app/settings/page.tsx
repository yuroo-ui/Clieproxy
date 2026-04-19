'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Key, Plus, Trash2, Save, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface APIKey {
  id: string;
  provider: string;
  key: string;
  status: string;
  createdAt: string;
}

export default function Settings() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [provider, setProvider] = useState('');
  const [keyValue, setKeyValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = async () => {
    // This would normally call an API endpoint
    // For demo, showing dummy data
    const dummyKeys: APIKey[] = [
      { id: '1', provider: 'Grok', key: 'xai_******************', status: 'Active', createdAt: '2026-04-17' },
      { id: '2', provider: 'OpenAI', key: 'sk-******************', status: 'Active', createdAt: '2026-04-17' },
    ];
    setKeys(dummyKeys);
  };

  const handleAddKey = async () => {
    if (!provider || !keyValue) return;

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/settings/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider, key: keyValue }),
      });

      if (response.ok) {
        await loadAPIKeys();
        setShowAddModal(false);
        setProvider('');
        setKeyValue('');
        alert('API Key added successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Add key error:', error);
      alert('Failed to add API key');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    try {
      const response = await fetch(`${API_URL}/settings/api-keys/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadAPIKeys();
        alert('API key deleted!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Delete key error:', error);
      alert('Failed to delete API key');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Key className="h-6 w-6 text-primary-400" />
            <span className="text-lg font-bold">Settings</span>
          </Link>

          <Link
            href="/dashboard"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">API Keys & Settings</h1>

        {/* Add API Key Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 px-6 py-3 rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add API Key</span>
          </button>
        </div>

        {/* API Keys List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Configured API Keys</h2>

          {keys.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-8 text-center border border-slate-700/50">
              <Key className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No API Keys Configured</h3>
              <p className="text-slate-400 mb-4">
                Add your LLM API keys to start using the CPA System
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
              >
                Add First Key
              </button>
            </div>
          ) : (
            keys.map((key) => (
              <div
                key={key.id}
                className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-500/20 p-3 rounded-lg">
                    <Key className="h-6 w-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{key.provider}</h3>
                    <p className="text-slate-400 text-sm font-mono">
                      {key.key}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                      {key.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                    <Save className="h-5 w-5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteKey(key.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5 text-red-400" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pricing Plans Info */}
        <div className="mt-12 bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-bold mb-4">Current Pricing</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Grok-4</h3>
              <div className="text-primary-400">$0.50 / 1K tokens</div>
              <div className="text-slate-400 text-sm">Input</div>
            </div>

            <div className="bg-slate-700/50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Claude-3.5</h3>
              <div className="text-primary-400">$3.00 / 1K tokens</div>
              <div className="text-slate-400 text-sm">Input</div>
            </div>

            <div className="bg-slate-700/50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Qwen-35B</h3>
              <div className="text-primary-400">$0.30 / 1K tokens</div>
              <div className="text-slate-400 text-sm">Input</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add API Key Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add API Key</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Provider</option>
                  <option value="Grok">Grok</option>
                  <option value="OpenAI">OpenAI</option>
                  <option value="Anthropic">Anthropic</option>
                  <option value="Akash">Akash</option>
                  <option value="DeepSeek">DeepSeek</option>
                  <option value="Google">Google</option>
                  <option value="Mistral">Mistral</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={keyValue}
                  onChange={(e) => setKeyValue(e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-slate-400 text-sm mt-1">
                  Keep your key secure. It will be stored encrypted.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddKey}
                  disabled={saving || !provider || !keyValue}
                  className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Key
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
