/**
 * Help Center
 * Comprehensive self-service help with search, categories, articles, and FAQs
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function HelpCenterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialView = searchParams.get('view') || 'home';
  const initialQuery = searchParams.get('q') || '';

  const [view, setView] = useState(initialView);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [categories, setCategories] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [faqs, setFAQs] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadHelpContent();
  }, []);

  useEffect(() => {
    if (initialQuery) {
      handleSearch();
    }
  }, [initialQuery]);

  const loadHelpContent = async () => {
    setLoading(true);
    try {
      const [categoriesRes, faqsRes, featuredRes] = await Promise.all([
        fetch('/api/help?type=categories'),
        fetch('/api/help?type=faqs'),
        fetch('/api/help?type=featured'),
      ]);

      const categoriesData = await categoriesRes.json();
      const faqsData = await faqsRes.json();
      const featuredData = await featuredRes.json();

      setCategories(categoriesData.categories || []);
      setFAQs(faqsData.faqs || []);
      setFeatured(featuredData.featured || []);
    } catch (error) {
      console.error('Failed to load help content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/help?type=search&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setArticles(data.articles || []);
      setView('search');
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = async (slug: string) => {
    setSelectedCategory(slug);
    setLoading(true);
    try {
      const response = await fetch(`/api/help?type=articles&category=${slug}`);
      const data = await response.json();
      setArticles(data.articles || []);
      setView('category');
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = (slug: string) => {
    router.push(`/help/${slug}`);
  };

  if (loading && view === 'home') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading help center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
            <p className="text-blue-100 mb-8">
              Search our knowledge base or browse by category
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search for help articles..."
                  className="w-full px-6 py-4 pr-12 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-300"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-blue-100 text-sm">Popular:</span>
              {['Getting Started', 'ECCA Assessment', 'Report Generation', 'Troubleshooting'].map((topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setSearchQuery(topic);
                    setTimeout(handleSearch, 100);
                  }}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm transition-colors"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {view === 'home' && (
          <>
            {/* Featured Articles */}
            {featured.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {featured.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => handleArticleClick(article.slug)}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-left"
                    >
                      <div className="text-3xl mb-3">{article.category.icon}</div>
                      <h3 className="font-semibold text-gray-900 mb-2">{article.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
                      <div className="mt-4 text-sm text-blue-600 flex items-center">
                        Read more →
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.slug)}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-left"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{category.icon}</div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        {category._count.articles} articles
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.slice(0, 5).map((faq) => (
                  <details
                    key={faq.id}
                    className="bg-white rounded-lg shadow-sm p-6"
                  >
                    <summary className="font-semibold text-gray-900 cursor-pointer flex items-center justify-between">
                      {faq.question}
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="mt-4 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
              {faqs.length > 5 && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => setView('faqs')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all {faqs.length} FAQs →
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {view === 'search' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Search Results for "{searchQuery}"
              </h2>
              <button
                onClick={() => setView('home')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Help Center
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Searching...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">Try a different search term or browse by category</p>
                <button
                  onClick={() => setView('home')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Browse Categories
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => handleArticleClick(article.slug)}
                    className="w-full bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-left"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{article.title}</h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded ml-4 whitespace-nowrap">
                        {article.category.name}
                      </span>
                    </div>
                    <p className="text-gray-600">{article.excerpt}</p>
                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                      <span>👁️ {article.views} views</span>
                      <span>•</span>
                      <span className="text-blue-600">Read article →</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'category' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {categories.find((c) => c.slug === selectedCategory)?.name} Articles
              </h2>
              <button
                onClick={() => setView('home')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Help Center
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : (
              <div className="grid gap-6">
                {articles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => handleArticleClick(article.slug)}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-left"
                  >
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">{article.title}</h3>
                    <p className="text-gray-600 mb-4">{article.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>👁️ {article.views} views</span>
                      {article.is_featured && (
                        <>
                          <span>•</span>
                          <span className="text-yellow-600">⭐ Featured</span>
                        </>
                      )}
                      <span className="ml-auto text-blue-600">Read more →</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contact Support */}
      <div className="bg-blue-50 border-t border-blue-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Still need help?</h3>
          <p className="text-gray-600 mb-6">
            Our support team is here to help you succeed
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="mailto:support@edpsychconnect.world"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              📧 Email Support
            </a>
            <a
              href="/contact"
              className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 font-medium"
            >
              💬 Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HelpCenter() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HelpCenterContent />
    </Suspense>
  );
}
