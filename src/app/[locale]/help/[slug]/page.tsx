/**
 * Help Article Detail Page
 * Full article view with markdown rendering and feedback
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

export default function HelpArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [article, setArticle] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  useEffect(() => {
    if (slug) {
      loadArticle();
    }
  }, [slug]);

  const loadArticle = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/help/${slug}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Article not found');
        } else {
          setError('Failed to load article');
        }
        return;
      }

      const data = await response.json();
      setArticle(data.article);
      setRelated(data.relatedArticles || []);
    } catch (err) {
      console.error('Failed to load article:', err);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (helpful: boolean) => {
    try {
      await fetch(`/api/help/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helpful }),
      });

      setFeedbackGiven(true);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">📄</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Article not found'}</h2>
          <p className="text-gray-600 mb-6">The article you’re looking for doesn’t exist or has been removed.</p>
          <button
            onClick={() => router.push('/help')}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            ← Back to Help Center
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-gray-600">
            <button
              onClick={() => router.push('/help')}
              className="hover:text-blue-600"
            >
              Help Center
            </button>
            <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <button
              onClick={() => router.push(`/help?category=${article.category.slug}`)}
              className="hover:text-blue-600"
            >
              {article.category.name}
            </button>
            <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-900">{article.title}</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-lg shadow-sm p-8 mb-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {article.category.icon} {article.category.name}
              </span>
              {article.is_featured && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                  ⭐ Featured
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              {article.author && <span>By {article.author}</span>}
              <span>•</span>
              <span>👁️ {article.views} views</span>
              <span>•</span>
              <span>Updated {new Date(article.updated_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-blue max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h2 className="text-3xl font-bold text-gray-900 mt-8 mb-4">{children}</h2>,
                h2: ({ children }) => <h3 className="text-2xl font-bold text-gray-900 mt-6 mb-3">{children}</h3>,
                h3: ({ children }) => <h4 className="text-xl font-semibold text-gray-900 mt-4 mb-2">{children}</h4>,
                p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">{children}</ol>,
                strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                code: ({ children }) => <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-800">{children}</code>,
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>

          {/* Feedback */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            {feedbackGiven ? (
              <div className="text-center py-6 bg-green-50 rounded-lg">
                <p className="text-green-800 font-medium">Thank you for your feedback!</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-700 font-medium mb-4">Was this article helpful?</p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => handleFeedback(true)}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                  >
                    👍 Yes
                  </button>
                  <button
                    onClick={() => handleFeedback(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
                  >
                    👎 No
                  </button>
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Related Articles */}
        {related.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((relatedArticle) => (
                <button
                  key={relatedArticle.id}
                  onClick={() => router.push(`/help/${relatedArticle.slug}`)}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-left"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{relatedArticle.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{relatedArticle.excerpt}</p>
                  <div className="mt-4 text-sm text-blue-600">
                    Read more →
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
