import { logger } from "@/lib/logger";
/**
 * Blog Main Page
 * Browse posts, filter by category/tag, search
 */

'use client';

import Image from 'next/image';
import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function BlogPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || null;
  const initialTag = searchParams.get('tag') || null;
  const initialQuery = searchParams.get('q') || '';

  const [view, setView] = useState(initialQuery ? 'search' : 'all');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [posts, setPosts] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadBlogContent = useCallback(async () => {
    setLoading(true);
    try {
      const [postsRes, featuredRes, categoriesRes, tagsRes] = await Promise.all([
        fetch('/api/blog?page=1&limit=12'),
        fetch('/api/blog?type=featured'),
        fetch('/api/blog?type=categories'),
        fetch('/api/blog?type=tags'),
      ]);

      const postsData = await postsRes.json();
      const featuredData = await featuredRes.json();
      const categoriesData = await categoriesRes.json();
      const tagsData = await tagsRes.json();

      setPosts(postsData.posts || []);
      setPagination(postsData.pagination);
      setFeatured(featuredData.featured || []);
      setCategories(categoriesData.categories || []);
      setTags(tagsData.tags || []);
    } catch (error) {
      console.error('Failed to load blog content:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setView('search');
    setSelectedCategory(null);
    setSelectedTag(null);

    try {
      const response = await fetch(`/api/blog?type=search&q=${encodeURIComponent(searchQuery)}&page=${currentPage}`);
      const data = await response.json();
      setPosts(data.posts || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage]);

  const handleCategoryFilter = useCallback(async (slug: string) => {
    setLoading(true);
    setSelectedCategory(slug);
    setSelectedTag(null);
    setSearchQuery('');
    setView('category');

    try {
      const response = await fetch(`/api/blog?category=${slug}&page=${currentPage}`);
      const data = await response.json();
      setPosts(data.posts || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to filter by category:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const handleTagFilter = useCallback(async (slug: string) => {
    setLoading(true);
    setSelectedTag(slug);
    setSelectedCategory(null);
    setSearchQuery('');
    setView('tag');

    try {
      const response = await fetch(`/api/blog?tag=${slug}&page=${currentPage}`);
      const data = await response.json();
      setPosts(data.posts || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to filter by tag:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadBlogContent();
  }, [loadBlogContent]);

  useEffect(() => {
    if (initialQuery) {
      handleSearch();
    } else if (initialCategory) {
      handleCategoryFilter(initialCategory);
    } else if (initialTag) {
      handleTagFilter(initialTag);
    }
  }, [initialQuery, initialCategory, initialTag, handleSearch, handleCategoryFilter, handleTagFilter]);

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
    setSearchQuery('');
    setView('all');
    setCurrentPage(1);
    loadBlogContent();
  };

  const handlePostClick = (slug: string) => {
    router.push(`/blog/${slug}`);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading && view === 'all' && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading blog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">EdPsych Connect Blog</h1>
            <p className="text-xl text-blue-100 mb-8">
              Evidence-based insights, research, and best practices for educational psychologists
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search articles..."
                  className="w-full px-6 py-4 pr-12 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-300"
                />
                <button
                  onClick={handleSearch}
                  aria-label="Search"
                  className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryFilter(category.slug)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedCategory === category.slug
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {category._count.posts}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagFilter(tag.slug)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTag === tag.slug
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedCategory || selectedTag || searchQuery) && (
              <div className="mt-6">
                <button
                  onClick={handleClearFilters}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Featured Posts (only on "all" view) */}
            {view === 'all' && featured.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Posts</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {featured.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => handlePostClick(post.slug)}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden text-left"
                    >
                      {post.featured_image && (
                        <div className="relative w-full h-48">
                          <Image
                            src={post.featured_image}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className="px-2 py-1 text-xs font-medium rounded"
                            // style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
                          >
                            {post.category.name}
                          </span>
                          {post.reading_time && (
                            <span className="text-xs text-gray-500">
                              {post.reading_time} min read
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-3">{post.excerpt}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Current Filter/Search Info */}
            {view !== 'all' && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {view === 'search' && `Search Results for "${searchQuery}"`}
                  {view === 'category' && categories.find((c) => c.slug === selectedCategory)?.name}
                  {view === 'tag' && `Posts tagged with "${tags.find((t) => t.slug === selectedTag)?.name}"`}
                </h2>
                <p className="text-gray-600 mt-2">
                  {pagination?.total || 0} {pagination?.total === 1 ? 'post' : 'posts'} found
                </p>
              </div>
            )}

            {/* All Posts */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600 mb-6">Try a different search term or browse by category</p>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  View All Posts
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    onClick={() => handlePostClick(post.slug)}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
                  >
                    <div className="flex items-start gap-6">
                      {post.featured_image && (
                        <div className="relative w-48 h-32 flex-shrink-0">
                          <Image
                            src={post.featured_image}
                            alt={post.title}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className="px-3 py-1 text-sm font-medium rounded-full"
                            // style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
                          >
                            {post.category.name}
                          </span>
                          {post.is_featured && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                              ⭐ Featured
                            </span>
                          )}
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2 hover:text-blue-600">
                          {post.title}
                        </h2>

                        <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>By {post.author_name}</span>
                          <span>•</span>
                          <span>{formatDate(post.published_at)}</span>
                          {post.reading_time && (
                            <>
                              <span>•</span>
                              <span>{post.reading_time} min read</span>
                            </>
                          )}
                          <span>•</span>
                          <span>👁️ {post.views} views</span>
                        </div>

                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {post.tags.map((postTag: any) => (
                              <span
                                key={postTag.tag.id}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                              >
                                #{postTag.tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={currentPage === pagination.pages}
                  className="px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Newsletter CTA */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
          <p className="text-blue-100 mb-6">
            Get the latest articles and insights delivered to your inbox
          </p>
          <div className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button className="px-6 py-3 bg-white text-blue-600 rounded-md hover:bg-blue-50 font-medium">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BlogPageContent />
    </Suspense>
  );
}