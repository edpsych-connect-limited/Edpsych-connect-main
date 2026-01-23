'use client'

/**
 * Blog Post Detail Page
 * Full post view with markdown rendering and comments
 */

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { EmptyState } from '@/components/ui/EmptyState';

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentData, setCommentData] = useState({
    author_name: '',
    author_email: '',
    content: '',
  });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/blog/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Post not found');
          } else {
            setError('Failed to load post');
          }
          return;
        }

        const data = await response.json();
        setPost(data.post);
        setRelatedPosts(data.relatedPosts || []);
      } catch (_err) {
        console.error('Failed to load post:', _err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadPost();
    }
  }, [slug]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentData.author_name || !commentData.author_email || !commentData.content) {
      alert('Please fill in all fields');
      return;
    }

    setSubmittingComment(true);

    try {
      const response = await fetch(`/api/blog/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }

      setCommentSubmitted(true);
      setCommentData({ author_name: '', author_email: '', content: '' });

      setTimeout(() => {
        setCommentSubmitted(false);
      }, 5000);
    } catch (_err) {
      console.error('Failed to submit comment:', _err);
      alert('Failed to submit comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">Note</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Post not found'}</h2>
          <p className="text-gray-600 mb-6">The blog post you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button
            onClick={() => router.push('/blog')}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            &lt; Back to Blog
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
              onClick={() => router.push('/blog')}
              className="hover:text-blue-600"
            >
              Blog
            </button>
            <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <button
              onClick={() => router.push(`/blog?category=${post.category.slug}`)}
              className="hover:text-blue-600"
            >
              {post.category.name}
            </button>
            <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-900 truncate">{post.title}</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-lg shadow-sm p-8 mb-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="px-3 py-1 text-sm font-medium rounded-full"
                // style={{ backgroundColor: post.category.color + '20', color: post.category.color }}
              >
                {post.category.name}
              </span>
              {post.is_featured && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                   Featured
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                  {post.author_name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{post.author_name}</p>
                  {post.author_bio && <p className="text-xs text-gray-500">{post.author_bio}</p>}
                </div>
              </div>
              <span>-</span>
              <span>{formatDate(post.published_at)}</span>
              {post.reading_time && (
                <>
                  <span>-</span>
                  <span>{post.reading_time} min read</span>
                </>
              )}
              <span>-</span>
              <span>Views {post.views} views</span>
            </div>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((postTag: any) => (
                  <button
                    key={postTag.tag.id}
                    onClick={() => router.push(`/blog?tag=${postTag.tag.slug}`)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200"
                  >
                    #{postTag.tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="relative w-full h-96 mb-8">
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg prose-blue max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h2 className="text-3xl font-bold text-gray-900 mt-8 mb-4">{children}</h2>,
                h2: ({ children }) => <h3 className="text-2xl font-bold text-gray-900 mt-6 mb-3">{children}</h3>,
                h3: ({ children }) => <h4 className="text-xl font-semibold text-gray-900 mt-4 mb-2">{children}</h4>,
                p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700 ml-4">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700 ml-4">{children}</ol>,
                strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                code: ({ children }) => <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-800">{children}</code>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-600 pl-4 italic text-gray-700 my-4">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Author Bio */}
          {(post.author_bio || post.author_email) && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl flex-shrink-0">
                  {post.author_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">About {post.author_name}</h3>
                  {post.author_bio && <p className="text-gray-600 mb-2">{post.author_bio}</p>}
                  {post.author_email && (
                    <a href={`mailto:${post.author_email}`} className="text-blue-600 hover:text-blue-700 text-sm">
                      Contact author
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </article>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments ({post.comments?.length || 0})</h2>

          {/* Existing Comments */}
          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-6 mb-8">
              {post.comments.map((comment: any) => (
                <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">{comment.author_name}</span>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No comments yet"
              description="Be the first to comment."
              className="mb-8"
            />
          )}

          {/* Comment Form */}
          {commentSubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <p className="text-green-800 font-medium mb-2">Thank you for your comment!</p>
              <p className="text-green-700 text-sm">Your comment has been submitted and is awaiting approval.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <h3 className="font-semibold text-gray-900">Leave a Comment</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={commentData.author_name}
                    onChange={(e) => setCommentData({ ...commentData, author_name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={commentData.author_email}
                    onChange={(e) => setCommentData({ ...commentData, author_email: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                  Comment *
                </label>
                <textarea
                  id="comment"
                  value={commentData.content}
                  onChange={(e) => setCommentData({ ...commentData, content: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share your thoughts..."
                />
              </div>

              <p className="text-xs text-gray-500">
                Your email address will not be published. All comments are moderated before appearing.
              </p>

              <button
                type="submit"
                disabled={submittingComment}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingComment ? 'Submitting...' : 'Submit Comment'}
              </button>
            </form>
          )}
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <button
                  key={relatedPost.id}
                  onClick={() => router.push(`/blog/${relatedPost.slug}`)}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden text-left"
                >
                  {relatedPost.featured_image && (
                    <div className="relative w-full h-48">
                      <Image
                        src={relatedPost.featured_image}
                        alt={relatedPost.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="px-2 py-1 text-xs font-medium rounded"
                        // style={{ backgroundColor: relatedPost.category.color + '20', color: relatedPost.category.color }}
                      >
                        {relatedPost.category.name}
                      </span>
                      {relatedPost.reading_time && (
                        <span className="text-xs text-gray-500">
                          {relatedPost.reading_time} min
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{relatedPost.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{relatedPost.excerpt}</p>
                    <div className="mt-4 text-sm text-blue-600">
                      Read more &gt;
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Back to Blog */}
      <div className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <button
            onClick={() => router.push('/blog')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-md hover:bg-gray-50 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blog
          </button>
        </div>
      </div>
    </div>
  );
}
