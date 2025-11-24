import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center | EdPsych Connect',
  description: 'Find answers, tutorials, and support for EdPsych Connect.',
};

async function getHelpCategories() {
  // In a real server component, we would call the DB directly or an internal API
  // For now, we'll fetch from the API route if possible, or mock it if running on build time
  // Since we are in the same project, we should probably use Prisma directly if this is a server component
  // But to keep it simple and consistent with the API structure, let's try to fetch or mock.
  
  // Mock data for initial implementation
  return [
    {
      id: '1',
      name: 'Getting Started',
      slug: 'getting-started',
      description: 'New to EdPsych Connect? Start here.',
      icon: '🚀',
      articles: [
        { id: '101', title: 'Platform Overview', slug: 'platform-overview' },
        { id: '102', title: 'Setting up your account', slug: 'account-setup' },
        { id: '103', title: 'Your first assessment', slug: 'first-assessment' },
      ]
    },
    {
      id: '2',
      name: 'Assessments',
      slug: 'assessments',
      description: 'Guides for conducting and managing assessments.',
      icon: '📝',
      articles: [
        { id: '201', title: 'Using the ECCA Framework', slug: 'ecca-guide' },
        { id: '202', title: 'Generating Reports', slug: 'generating-reports' },
        { id: '203', title: 'Collaborative Input', slug: 'collaborative-input' },
      ]
    },
    {
      id: '3',
      name: 'Account & Billing',
      slug: 'account-billing',
      description: 'Manage your subscription and account settings.',
      icon: '💳',
      articles: [
        { id: '301', title: 'Subscription Plans', slug: 'subscription-plans' },
        { id: '302', title: 'Updating Payment Method', slug: 'payment-method' },
      ]
    },
    {
      id: '4',
      name: 'Troubleshooting',
      slug: 'troubleshooting',
      description: 'Solutions to common issues.',
      icon: '🔧',
      articles: [
        { id: '401', title: 'Login Issues', slug: 'login-issues' },
        { id: '402', title: 'Browser Compatibility', slug: 'browser-compatibility' },
      ]
    },
  ];
}

export default async function HelpCenterPage() {
  const categories = await getHelpCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">How can we help you today?</h1>
          <p className="text-xl text-blue-100 mb-8">
            Search our knowledge base or browse categories below.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              placeholder="Search for articles, guides, and more..."
              className="w-full px-6 py-4 rounded-full text-gray-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button 
              className="absolute right-2 top-2 bg-blue-700 hover:bg-blue-800 text-white p-2 rounded-full transition-colors"
              aria-label="Search"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
              <div className="text-4xl mb-4">{category.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                <Link href={`/help/category/${category.slug}`} className="hover:text-blue-600">
                  {category.name}
                </Link>
              </h3>
              <p className="text-gray-600 mb-4">{category.description}</p>
              <ul className="space-y-2">
                {category.articles.slice(0, 3).map((article) => (
                  <li key={article.id}>
                    <Link 
                      href={`/help/${article.slug}`}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
              {category.articles.length > 3 && (
                <Link 
                  href={`/help/category/${category.slug}`}
                  className="inline-block mt-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  View all {category.articles.length} articles &rarr;
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support Section */}
      <div className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still need help?</h2>
          <p className="text-gray-600 mb-8">Our support team is available Monday to Friday, 9am - 5pm.</p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/contact"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
            >
              Contact Support
            </Link>
            <Link 
              href="/community"
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
            >
              Ask the Community
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
