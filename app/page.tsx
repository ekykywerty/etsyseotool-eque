'use client';

import { useState, useEffect } from 'react';
import { SpeedInsights } from "@vercel/speed-insights/next"

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
      alert('Пожалуйста, введите ключ активации и email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Пожалуйста, введите корректный email');
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
        alert(data.error || 'Ошибка активации');
      }
    } catch (error) {
      alert('Ошибка подключения. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysis = async () => {
    if (!productTitle.trim()) {
      alert('Пожалуйста, введите название товара');
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8">
            {/* Logo & Title */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <span className="text-4xl">🛍️</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Etsy SEO Assistant
                </h1>
                <p className="text-gray-600">
                  Оптимизируйте листинги с помощью AI
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Ключ активации
                </label>
                <input
                  type="text"
                  value={activationKey}
                  onChange={(e) => setActivationKey(e.target.value)}
                  placeholder="Введите ваш ключ"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 outline-none"
                />
              </div>

              <button
                onClick={handleActivation}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Активация...
                  </span>
                ) : (
                  'Активировать'
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Нет ключа? <a href="/get-key" className="text-indigo-600 font-semibold hover:text-indigo-700">Получить бесплатно</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <span className="text-2xl">🛍️</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Etsy SEO Assistant</h1>
                <p className="text-xs text-gray-600">AI-оптимизация листингов</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium text-sm transition-colors"
            >
              Выход
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Input Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-base font-semibold text-gray-900">
                Название товара
              </label>
              <textarea
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                placeholder="Введите текущее название вашего товара..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 resize-none outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-base font-semibold text-gray-900">
                Описание товара <span className="text-gray-500 font-normal text-sm">(опционально)</span>
              </label>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Кратко опишите ваш товар для лучшей оптимизации..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 resize-none outline-none"
              />
            </div>

            <button
              onClick={handleAnalysis}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Анализируем...
                </span>
              ) : (
                '✨ Оптимизировать листинг'
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Optimized Title */}
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Оптимизированное название
                  </h3>
                  <button
                    onClick={() => copyToClipboard(results.optimized_title, 'title')}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white font-medium text-sm transition-colors"
                  >
                    {copied === 'title' ? '✓ Скопировано' : 'Копировать'}
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                  <p className="text-gray-900 text-base leading-relaxed">{results.optimized_title}</p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-medium">
                    {results.character_count} символов
                  </span>
                  {results.character_count >= 60 && results.character_count <= 140 ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Оптимальная длина
                    </span>
                  ) : (
                    <span className="text-amber-600 font-semibold">⚠ Рекомендуем скорректировать</span>
                  )}
                </div>
                <p className="text-gray-600 text-sm">
                  💡 <strong>Совет:</strong> Названия на Etsy лучше всего работают в диапазоне 60-140 символов
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    Рекомендованные теги
                  </h3>
                  <button
                    onClick={() => copyToClipboard(results.tags.join(', '), 'tags')}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white font-medium text-sm transition-colors"
                  >
                    {copied === 'tags' ? '✓ Скопировано' : 'Копировать все'}
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {results.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 text-sm">
                  💡 <strong>Совет:</strong> Используйте все 13 тегов для максимальной видимости
                </p>
              </div>
            </div>

            {/* Description Tips */}
            <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                  Улучшения для описания
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {results.description_improvements.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 bg-purple-50 rounded-lg p-4 border border-purple-100">
                      <div className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 text-sm leading-relaxed flex-1">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Success Banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-center shadow-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h3 className="text-xl font-bold text-white">Оптимизация завершена!</h3>
              </div>
              <p className="text-white/90 text-sm">
                Скопируйте оптимизированный контент в ваш листинг Etsy для увеличения видимости
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!results && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-6">
              <span className="text-5xl">🚀</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Готовы оптимизировать?</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Введите информацию о вашем товаре выше, чтобы получить AI-рекомендации по оптимизации
            </p>
          </div>
        )}
      </main>
    </div>
  );
}