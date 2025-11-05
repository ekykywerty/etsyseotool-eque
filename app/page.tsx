'use client';

import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const savedKey = localStorage.getItem('etsy_seo_activation_key');
    const savedEmail = localStorage.getItem('etsy_seo_email');
    if (savedKey && savedEmail) {
      setActivationKey(savedKey);
      setEmail(savedEmail);
      setScreen('main');
    }
  }, []);

  const handleActivation = async () => {
    if (!activationKey.trim() || !email.trim()) {
      alert('Please enter activation key and email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/check-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          activationKey: activationKey,
          email: email
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        localStorage.setItem('etsy_seo_activation_key', activationKey);
        localStorage.setItem('etsy_seo_email', email);
        setScreen('main');
      } else {
        alert(data.error || 'Activation error');
      }
    } catch (error) {
      alert('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysis = async () => {
    if (!productTitle.trim()) {
      alert('Please enter product title');
      return;
    }

    setLoading(true);
    try {
      const currentKey = localStorage.getItem('etsy_seo_activation_key');
      const currentEmail = localStorage.getItem('etsy_seo_email');
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        alert(data.error || 'Analysis error');
      }
    } catch (error) {
      alert('Analysis error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('etsy_seo_activation_key');
    localStorage.removeItem('etsy_seo_email');
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
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-purple-500/20 p-8 space-y-8">
            {/* Logo & Title */}
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

            {/* Form */}
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                  Activation Key
                </label>
                <input
                  type="text"
                  value={activationKey}
                  onChange={(e) => setActivationKey(e.target.value)}
                  placeholder="Enter your key"
                  className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <button
                onClick={handleActivation}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Activating...
                  </span>
                ) : (
                  'Activate Account'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <p className="text-xs text-slate-400">Powered Listing Optimization</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Input Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 p-6 sm:p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-base font-semibold text-slate-200">
                Product Title
              </label>
              <textarea
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                placeholder="Enter your current product title..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-500 resize-none outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-base font-semibold text-slate-200">
                Product Description <span className="text-slate-500 font-normal text-sm">(optional)</span>
              </label>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Briefly describe your product for better optimization..."
                rows={4}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-500 resize-none outline-none transition-all"
              />
            </div>

            <button
              onClick={handleAnalysis}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                '✨ Optimize Listing'
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Optimized Title */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-500/30 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 px-6 py-4 border-b border-emerald-500/30">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Optimized Title
                  </h3>
                  <button
                    onClick={() => copyToClipboard(results.optimized_title, 'title')}
                    className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 backdrop-blur-sm rounded-lg text-emerald-400 font-medium text-sm transition-all border border-emerald-500/30"
                  >
                    {copied === 'title' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-200 text-base leading-relaxed">{results.optimized_title}</p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">
                    {results.character_count} characters
                  </span>
                  {results.character_count >= 60 && results.character_count <= 140 ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Optimal Length
                    </span>
                  ) : (
                    <span className="text-amber-400 font-semibold">⚠ Consider Adjusting</span>
                  )}
                </div>
                <p className="text-slate-400 text-sm">
                  💡 <strong className="text-slate-300">Tip:</strong> Etsy titles work best between 60-140 characters
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-cyan-500/30 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 px-6 py-4 border-b border-cyan-500/30">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    Recommended Tags
                  </h3>
                  <button
                    onClick={() => copyToClipboard(results.tags.join(', '), 'tags')}
                    className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 backdrop-blur-sm rounded-lg text-cyan-400 font-medium text-sm transition-all border border-cyan-500/30"
                  >
                    {copied === 'tags' ? '✓ Copied' : 'Copy All'}
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {results.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-lg text-sm font-medium border border-cyan-500/30 hover:bg-cyan-500/20 transition-all"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-slate-400 text-sm">
                  💡 <strong className="text-slate-300">Tip:</strong> Use all 13 tags for maximum visibility
                </p>
              </div>
            </div>

            {/* Description Tips */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 px-6 py-4 border-b border-purple-500/30">
                <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                  Description Improvements
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {results.description_improvements.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-slate-300 text-sm leading-relaxed flex-1">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Success Banner */}
            <div className="bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 rounded-2xl p-6 text-center border border-emerald-500/30 backdrop-blur-xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h3 className="text-xl font-bold text-emerald-400">Optimization Complete!</h3>
              </div>
              <p className="text-slate-300 text-sm">
                Copy the optimized content to your Etsy listing to boost visibility
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!results && (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl mb-6 border border-purple-500/30">
              <span className="text-5xl">🚀</span>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3">Ready to Optimize?</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Enter your product information above to get optimization recommendations
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
