'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Key, Plus, Trash2, Save, Loader2, Shield, Zap } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Third-party LLM providers
const THIRD_PARTY_PROVIDERS = [
  {
    id: 'kilo_kiro',
    name: 'Kilo Kiro',
    description: 'Proxy service for multiple LLMs. Use your own API keys with unified access.',
    icon: '🚀',
    features: ['Multiple LLMs', 'Unified API', 'Auto-billing'],
    website: 'https://kilok.io',
    requiredFields: ['api_key']
  },
  {
    id: 'antigravity',
    name: 'Antigravity',
    description: 'Advanced AI platform with support for cutting-edge models.',
    icon: '🌌',
    features: ['Cutting-edge models', 'High throughput', 'Enterprise features'],
    website: 'https://antigravity.dev',
    requiredFields: ['api_key', 'api_secret']
  },
  {
    id: 'chatgpt_plus',
    name: 'ChatGPT Plus',
    description: 'Access GPT-4 and other OpenAI models through subscription.',
    icon: '🎯',
    features: ['GPT-4 access', 'Code interpreter', 'File analysis'],
    website: 'https://chat.openai.com',
    requiredFields: ['api_key']
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Aggregate LLM API with support for multiple providers in one place.',
    icon: '🔀',
    features: ['Multiple providers', 'Price comparison', 'Easy integration'],
    website: 'https://openrouter.ai',
    requiredFields: ['api_key']
  }
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    api_key: '',
    api_secret: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/llm/integrations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations || []);
      }
    } catch (error) {
      console.error('Load integrations error:', error);
    }
  };

  const handleAddIntegration = async () => {
    if (!selectedProvider || !formData.name) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/llm/integrate/${selectedProvider}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          apiKey: formData.api_key,
          apiSecret: formData.api_secret
        })
      });

      if (response.ok) {
        await loadIntegrations();
        setShowAddModal(false);
        setSelectedProvider('');
        setFormData({ name: '', api_key: '', api_secret: '' });
        alert('Integration added successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Add integration error:', error);
      alert('Failed to add integration');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteIntegration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this integration?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/llm/integrations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await loadIntegrations();
        alert('Integration deleted!');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete integration');
    }
  };

  const currentProvider = THIRD_PARTY_PROVIDERS.find(p => p.id === selectedProvider);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary-400" />
            <span className="text-lg font-bold">LLM Integrations</span>
          </Link>

          <Link
            href="/settings"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            Back to Settings
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Third-Party LLM Integrations</h1>
            <p className="text-slate-400">
              Connect your LLM accounts and start using advanced models
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 px-6 py-3 rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Integration</span>
          </button>
        </div>

        {/* Provider Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {THIRD_PARTY_PROVIDERS.map((provider) => (
            <div
              key={provider.id}
              className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 hover:border-primary-500/50 transition-all cursor-pointer"
              onClick={() => {
                setSelectedProvider(provider.id);
                setShowAddModal(true);
              }}
            >
              <div className="text-4xl mb-4">{provider.icon}</div>
              <h3 className="text-xl font-bold mb-2">{provider.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{provider.description}</p>

              <div className="space-y-2 mb-4">
                {provider.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-sm">
                    <Zap className="h-4 w-4 text-primary-400" />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              <a
                href={provider.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 text-sm"
              >
                Learn more →
              </a>
            </div>
          ))}
        </div>

        {/* Active Integrations */}
        <div>
          <h2 className="text-xl font-bold mb-4">Active Integrations</h2>

          {integrations.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-8 text-center border border-slate-700/50">
              <Key className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Integrations Yet</h3>
              <p className="text-slate-400 mb-4">
                Add your first LLM integration to get started
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
              >
                Add First Integration
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {integrations.map((integration) => (
                <div
                  key={integration.id}
                  className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary-500/20 p-3 rounded-lg">
                      <Key className="h-6 w-6 text-primary-400" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">
                        {integration.name}
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-400 text-sm">
                          {integration.provider}
                        </span>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                          Active
                        </span>
                        <span className="text-slate-500 text-xs">
                          Added {new Date(integration.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                      <Save className="h-5 w-5 text-slate-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteIntegration(integration.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Integration Modal */}
      {showAddModal && currentProvider && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-3xl">{currentProvider.icon}</span>
              <div>
                <h2 className="text-xl font-bold">Add {currentProvider.name}</h2>
                <p className="text-sm text-slate-400">{currentProvider.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Integration Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Kilo Kiro Account"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-slate-400 text-sm mt-1">
                  Give this integration a descriptive name
                </p>
              </div>

              {currentProvider.requiredFields.includes('api_key') && (
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={formData.api_key}
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                    placeholder="Enter your API key"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-slate-400 text-sm mt-1">
                    Keep your key secure. It will be encrypted and stored
                  </p>
                </div>
              )}

              {currentProvider.requiredFields.includes('api_secret') && (
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    API Secret
                  </label>
                  <input
                    type="password"
                    value={formData.api_secret}
                    onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
                    placeholder="Enter your API secret"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="font-medium text-blue-400 mb-2">
                  ℹ️ What happens next?
                </h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Your credentials will be encrypted</li>
                  <li>• You can start using the integration</li>
                  <li>• Usage will be tracked and billed</li>
                  <li>• You can delete anytime</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedProvider('');
                  }}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddIntegration}
                  disabled={saving || !formData.name || !formData.api_key}
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
                      Add Integration
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
