'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calculator, TrendingUp, Info } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const MODELS = [
  { id: 'grok-4.20-0309-reasoning', name: 'Grok-4', priceIn: 0.50, priceOut: 1.00 },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', priceIn: 3.00, priceOut: 15.00 },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', priceIn: 0.80, priceOut: 4.00 },
  { id: 'akash/Qwen/Qwen3.5-35B-A3B', name: 'Qwen 3.5 35B', priceIn: 0.30, priceOut: 0.60 },
  { id: 'akash/Qwen/Qwen2.5-Coder-32B-Instruct', name: 'Qwen 2.5 Coder', priceIn: 0.25, priceOut: 0.50 },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', priceIn: 0.14, priceOut: 0.28 },
  { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B', priceIn: 0.40, priceOut: 0.80 },
  { id: 'gpt-4o', name: 'GPT-4o', priceIn: 2.50, priceOut: 10.00 },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', priceIn: 1.25, priceOut: 5.00 },
];

export default function CalculatorPage() {
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [tokensIn, setTokensIn] = useState('1000');
  const [tokensOut, setTokensOut] = useState('500');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [loading, setLoading] = useState(false);

  const currentModel = MODELS.find(m => m.id === selectedModel) || MODELS[0];

  useEffect(() => {
    calculateCost();
  }, [selectedModel, tokensIn, tokensOut]);

  const calculateCost = async () => {
    const inTokens = parseInt(tokensIn) || 0;
    const outTokens = parseInt(tokensOut) || 0;

    // Calculate manually
    const cost = ((inTokens * currentModel.priceIn) + 
                  (outTokens * currentModel.priceOut)) / 1000;

    setEstimatedCost(parseFloat(cost.toFixed(6)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Calculator className="h-6 w-6 text-primary-400" />
            <span className="text-lg font-bold">Cost Calculator</span>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">LLM Cost Calculator</h1>
          <p className="text-slate-300">
            Estimate the cost before making LLM calls
          </p>
        </div>

        {/* Calculator Card */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-8 border border-slate-700/50">
          {/* Model Selection */}
          <div className="mb-6">
            <label className="block text-sm text-slate-300 mb-2">
              Select Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          {/* Model Pricing Info */}
          <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <TrendingUp className="h-5 w-5 text-primary-400 mt-0.5" />
              <div>
                <h3 className="font-bold mb-1">{currentModel.name}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-400">Input:</span>{' '}
                    <span className="text-primary-400 font-mono">
                      ${currentModel.priceIn.toFixed(3)} / 1K tokens
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Output:</span>{' '}
                    <span className="text-primary-400 font-mono">
                      ${currentModel.priceOut.toFixed(3)} / 1K tokens
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Token Inputs */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Input Tokens
              </label>
              <input
                type="number"
                value={tokensIn}
                onChange={(e) => setTokensIn(e.target.value)}
                placeholder="1000"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {[100, 500, 1000, 2000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTokensIn(amount.toString())}
                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs transition-colors"
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Output Tokens
              </label>
              <input
                type="number"
                value={tokensOut}
                onChange={(e) => setTokensOut(e.target.value)}
                placeholder="500"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {[100, 250, 500, 1000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTokensOut(amount.toString())}
                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs transition-colors"
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-primary-100">Estimated Cost</span>
              <Calculator className="h-5 w-5 text-primary-100" />
            </div>
            <div className="text-5xl font-bold mb-2">
              ${estimatedCost.toFixed(6)}
            </div>
            <div className="text-primary-100 text-sm">
              {parseInt(tokensIn) || 0} input × ${currentModel.priceIn.toFixed(3)} +{' '}
              {parseInt(tokensOut) || 0} output × ${currentModel.priceOut.toFixed(3)}
            </div>
          </div>

          {/* Quick Examples */}
          <div className="mt-6">
            <h3 className="font-bold mb-3 flex items-center">
              <Info className="h-5 w-5 mr-2 text-slate-400" />
              Quick Examples
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedModel('grok-4.20-0309-reasoning');
                  setTokensIn('1000');
                  setTokensOut('500');
                }}
                className="w-full text-left px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm"
              >
                <div className="font-medium">Simple Question</div>
                <div className="text-slate-400 text-xs">1K in, 500 out = ${((1000 * 0.50 + 500 * 1.00) / 1000).toFixed(2)}</div>
              </button>

              <button
                onClick={() => {
                  setSelectedModel('claude-3-5-sonnet-20241022');
                  setTokensIn('4000');
                  setTokensOut('800');
                }}
                className="w-full text-left px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm"
              >
                <div className="font-medium">Document Analysis</div>
                <div className="text-slate-400 text-xs">4K in, 800 out = ${((4000 * 3.00 + 800 * 15.00) / 1000).toFixed(2)}</div>
              </button>

              <button
                onClick={() => {
                  setSelectedModel('akash/Qwen/Qwen3.5-35B-A3B');
                  setTokensIn('2000');
                  setTokensOut('400');
                }}
                className="w-full text-left px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm"
              >
                <div className="font-medium">Manga Page Analysis</div>
                <div className="text-slate-400 text-xs">2K in, 400 out = ${((2000 * 0.30 + 400 * 0.60) / 1000).toFixed(2)}</div>
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div className="text-sm text-yellow-200">
              <strong>Note:</strong> This is an estimate. Actual costs may vary based on token counting method used by the LLM provider.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
