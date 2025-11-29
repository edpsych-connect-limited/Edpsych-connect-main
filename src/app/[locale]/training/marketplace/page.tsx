'use client'

import { logger } from "@/lib/logger";
/**
 * Training Marketplace
 * Browse and purchase CPD training courses
 *
 * Pricing Strategy (Based on UK market research):
 * - Short courses (2-4 hours): £49-79
 * - Standard courses (8-12 hours): £99-149
 * - Comprehensive courses (20+ hours): £199-299
 * - Course bundles: 20-25% discount
 * - Annual unlimited: £599
 */

// Force dynamic rendering for auth-required pages
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';

interface TrainingProduct {
  id: string;
  type: string;
  name: string;
  description: string;
  slug: string;
  price_gbp: number; // in pence
  original_price_gbp?: number;
  cpd_hours?: number;
  course_id?: string;
  included_course_ids?: string[];
  is_featured: boolean;
  promotional_text?: string;
  benefits?: string[];
  target_audience?: string[];
}

export default function TrainingMarketplace() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [products, setProducts] = useState<TrainingProduct[]>([]);
  const [filter, setFilter] = useState<string>('all'); // all, featured, bundles
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/training/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Show loading during authentication check
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const filteredProducts = products.filter((product) => {
    if (filter === 'featured') return product.is_featured;
    if (filter === 'bundles') return product.type === 'course_bundle';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold mb-4">Evidence-Based CPD Training</h1>
          <p className="text-xl text-blue-100 mb-8">
            Interactive, self-service professional development for Educational Psychologists
          </p>
          <div className="grid grid-cols-4 gap-6 max-w-4xl">
            {[
              { icon: '🎓', text: 'BPS Quality Mark' },
              { icon: '✅', text: 'CPD Hours Accredited' },
              { icon: '🎯', text: 'Evidence-Based Content' },
              { icon: '🎮', text: 'Interactive Learning' },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-2">{feature.icon}</div>
                <div className="text-sm">{feature.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Courses
            </button>
            <button
              onClick={() => setFilter('featured')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'featured'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Featured
            </button>
            <button
              onClick={() => setFilter('bundles')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'bundles'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Course Bundles
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No courses found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Annual Unlimited Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Unlimited Access</h2>
            <p className="text-xl text-purple-100 mb-6">
              Get access to ALL training courses for one annual fee
            </p>
            <div className="text-5xl font-bold mb-6">£599/year</div>
            <p className="text-purple-100 mb-8">
              That's less than £50/month for unlimited CPD training!
            </p>
            <button
              onClick={() => router.push('/training/checkout/annual-unlimited')}
              className="px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 text-lg"
            >
              Get Unlimited Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PRODUCT CARD COMPONENT
// ============================================================================

function ProductCard({ product }: { product: TrainingProduct }) {
  const router = useRouter();

  const priceDisplay = (product.price_gbp / 100).toFixed(2);
  const originalPriceDisplay = product.original_price_gbp
    ? (product.original_price_gbp / 100).toFixed(2)
    : null;
  const discountPercentage = originalPriceDisplay
    ? Math.round(
        ((product.original_price_gbp! - product.price_gbp) / product.original_price_gbp!) * 100
      )
    : null;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden flex flex-col">
      {/* Badge */}
      {product.is_featured && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 text-sm font-semibold">
          ⭐ Featured Course
        </div>
      )}

      {discountPercentage && (
        <div className="bg-green-500 text-white px-4 py-2 text-sm font-semibold">
          Save {discountPercentage}%!
        </div>
      )}

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-4 flex-1">{product.description}</p>

        {/* CPD Hours */}
        {product.cpd_hours && (
          <div className="flex items-center text-blue-600 mb-4">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
            </svg>
            <span className="font-medium">{product.cpd_hours} CPD Hours</span>
          </div>
        )}

        {/* Benefits */}
        {product.benefits && product.benefits.length > 0 && (
          <ul className="space-y-2 mb-4">
            {product.benefits.slice(0, 3).map((benefit, index) => (
              <li key={index} className="flex items-start text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {benefit}
              </li>
            ))}
          </ul>
        )}

        {/* Pricing */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex items-end justify-between mb-4">
            <div>
              {originalPriceDisplay && (
                <div className="text-gray-500 line-through text-sm">£{originalPriceDisplay}</div>
              )}
              <div className="text-3xl font-bold text-gray-900">£{priceDisplay}</div>
            </div>
            {product.type === 'course_bundle' && (
              <div className="text-sm text-gray-600">
                {product.included_course_ids?.length} courses
              </div>
            )}
          </div>

          <button
            onClick={() => router.push(`/training/checkout/${product.id}`)}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Purchase Course
          </button>

          <button
            onClick={() => router.push(`/training/courses/${product.slug}`)}
            className="w-full mt-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
