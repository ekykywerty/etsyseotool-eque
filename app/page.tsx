'use client';

import { useState, useEffect } from "react";

interface SEOAnalysis {
  optimized_title: string;
  character_count: number;
  tags: string[];
  description_improvements: string[];
}

export default function Home() {
  const [screen, setScreen] = useState<'activation' | 'main'>('activation');
  const [activationKey, setActivationKey] = useState('');
  const [email, setEmail] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [results, setResults] = useState<SEOAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [isActivated, setIsActivated] = useState(false);
  const [error, setError] = useState('');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  // Проверка подписки при загрузке
  useEffect(() => {
    const checkSubscription = () => {
      const exp = localStorage.getItem("expiresAt");
      if (!exp) return false;
      return new Date(exp) > new Date();
    };

    const savedKey = localStorage.getItem("etsy_seo_activation_key");
    const savedEmail = localStorage.getItem("etsy_seo_email");

    if (savedKey && savedEmail && checkSubscription()) {
      setActivationKey(savedKey);
      setEmail(savedEmail);
      setScreen("main");
    } else {
      setScreen("activation");
      localStorage.removeItem("etsy_seo_activation_key");
      localStorage.removeItem("etsy_seo_email");
      localStorage.removeItem("expiresAt");
    }
  }, []);

  const handleActivation = async () => {
    setError("");
    if (!activationKey.trim() || !email.trim()) {
      setError("Введите ключ и email");
      return;
    }

    try {
      const res = await fetch("/api/check-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activationKey, email }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setError(data.error || "Ошибка активации");
        setIsActivated(false);
        return;
      }

      localStorage.setItem("etsy_seo_activation_key", activationKey);
      localStorage.setItem("etsy_seo_email", email);
      if (data.expires_at) localStorage.setItem("expiresAt", data.expires_at);

      setIsActivated(true);
      setExpiresAt(data.expires_at || null);
      setScreen("main");
    } catch (err) {
      console.error("Ошибка при активации:", err);
      setError("Ошибка сервера");
    }
  };

  const handleAnalysis = async () => {
    if (!productTitle.trim()) {
      alert('Введите название товара');
      return;
    }

    setLoading(true);
    try {
      const currentKey = localStorage.getItem('etsy_seo_activation_key');
      const currentEmail = localStorage.getItem('etsy_seo_email');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productTitle,
          productDescription,
          activationKey: currentKey,
          email: currentEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
      } else {
        alert(data.error || 'Ошибка анализа');
      }
    } catch (error) {
      alert('Ошибка анализа. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('etsy_seo_activation_key');
    localStorage.removeItem('etsy_seo_email');
    localStorage.removeItem('expiresAt');
    setScreen('activation');
    setActivationKey('');
    setEmail('');
    setProductTitle('');
    setProductDescription('');
    setResults(null);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (screen === 'activation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Анимированные blur круги */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-purple-500/20 p-8 space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg shadow-purple-500/50 animate-pulse">
                <span className="text-4xl">🛍️</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  Etsy SEO Assistant
                </h1>
                <p className="text-slate-400 text-lg">
                  Optimize Your Listings
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Activation Key</label>
                <input
                  type="text"
                  value={activationKey}
                  onChange={(e) => setActivationKey(e.target.value)}
                  placeholder="Enter your key"
                  className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                onClick={handleActivation}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all"
              >
                {loading ? 'Activating...' : 'Activate Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Основной экран после активации
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-2xl border-b border-slate-800 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-lg shadow-lg shadow-purple-500/30">
                <span className="text-2xl">🛍️</span>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Etsy SEO Assistant</h1>
                <p className="text-xs text-slate-400">Seo Listing Optimization</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Input Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-base font-semibold text-slate-200">Product Title</label>
            <textarea
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              placeholder="Enter your current product title..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 text-white placeholder-slate-500 resize-none outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-base font-semibold text-slate-200">Product Description <span className="text-slate-500 font-normal text-sm">(optional)</span></label>
            <textarea
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Briefly describe your product for better optimization..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 text-white placeholder-slate-500 resize-none outline-none transition-all"
            />
          </div>
          <button
            onClick={handleAnalysis}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all"
          >
            {loading ? 'Analyzing...' : '✨ Optimize Listing'}
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Optimized Title */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-500/30 overflow-hidden animate-fadeIn">
              <div className="bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 px-6 py-4 border-b border-emerald-500/30 flex justify-between items-center">
                <h3 className="text-lg font-bold text-emerald-400">Optimized Title</h3>
                <button
                  onClick={() => copyToClipboard(results.optimized_title, 'title')}
                  className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 font-medium text-sm transition-all border border-emerald-500/30"
                >
                  {copied === 'title' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div className="p-6">
                <p className="text-slate-200">{results.optimized_title}</p>
                <p className="text-slate-400 text-sm mt-2">{results.character_count} characters</p>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-cyan-500/30 overflow-hidden animate-fadeIn delay-200">
              <div className="bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 px-6 py-4 border-b border-cyan-500/30 flex justify-between items-center">
                <h3 className="text-lg font-bold text-cyan-400">Recommended Tags</h3>
                <button
                  onClick={() => copyToClipboard(results.tags.join(', '), 'tags')}
                  className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-400 font-medium text-sm transition-all border border-cyan-500/30"
                >
                  {copied === 'tags' ? '✓ Copied' : 'Copy All'}
                </button>
              </div>
              <div className="p-6 flex flex-wrap gap-2">
                {results.tags.map((tag, index) => (
                  <span key={index} className="px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-lg text-sm font-medium border border-cyan-500/30">{tag}</span>
                ))}
              </div>
            </div>

            {/* Description Tips */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden animate-fadeIn delay-400">
              <div className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 px-6 py-4 border-b border-purple-500/30">
                <h3 className="text-lg font-bold text-purple-400">Description Improvements</h3>
              </div>
              <div className="p-6 space-y-3">
                {results.description_improvements.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold">{idx+1}</div>
                    <span className="text-slate-300 text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
