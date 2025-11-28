import { logger } from "@/lib/logger";
/**
 * Training Checkout Page
 * Stripe-integrated payment for CPD courses
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutPageProps {
  params: {
    productId: string;
  };
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm productId={params.productId} />
    </Elements>
  );
}

function CheckoutForm({ productId }: { productId: string }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const stripe = useStripe();
  const elements = useElements();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);

  const loadProduct = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/training/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
      }
    } catch (_error) {
      console.error('Failed to load product:', _error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const applyDiscountCode = async () => {
    try {
      const response = await fetch('/api/training/discount-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: discountCode,
          product_id: productId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAppliedDiscount(data.discount);
        setError(null);
      } else {
        setError('Invalid discount code');
        setAppliedDiscount(null);
      }
    } catch (error) {
      setError('Failed to apply discount code');
    }
  };

  const calculateFinalPrice = () => {
    if (!product) return 0;

    let price = product.price_gbp;

    if (appliedDiscount) {
      if (appliedDiscount.discount_type === 'percentage') {
        price = price - (price * appliedDiscount.discount_value) / 100;
      } else {
        price = price - appliedDiscount.discount_value;
      }
    }

    return Math.max(0, price);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment intent
      const response = await fetch('/api/training/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          discount_code: appliedDiscount?.code,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { client_secret, purchase_id } = await response.json();

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: user?.email,
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        // Payment successful, redirect to success page
        router.push(`/training/purchase-success/${purchase_id}`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setProcessing(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <button
            onClick={() => router.push('/training/marketplace')}
            className="text-blue-600 hover:underline"
          >
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const finalPrice = calculateFinalPrice();
  const priceDisplay = (finalPrice / 100).toFixed(2);
  const originalPriceDisplay = (product.price_gbp / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4">{product.description}</p>

              {product.cpd_hours && (
                <div className="flex items-center text-blue-600 mb-4">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                  </svg>
                  <span className="font-medium">{product.cpd_hours} CPD Hours</span>
                </div>
              )}

              {/* Pricing Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>£{originalPriceDisplay}</span>
                </div>

                {appliedDiscount && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Discount ({appliedDiscount.code})
                    </span>
                    <span>
                      -£{((product.price_gbp - finalPrice) / 100).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>£{priceDisplay}</span>
                </div>
              </div>

              {/* What You'll Get */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">What You'll Get:</h4>
                <ul className="space-y-2">
                  {[
                    'Instant access to course content',
                    'Interactive learning activities',
                    'Downloadable resources',
                    'CPD certificate upon completion',
                    'Lifetime access to course',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
              {/* Discount Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Code (Optional)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    className="flex-1 border border-gray-300 rounded-md px-4 py-2"
                    placeholder="ENTER CODE"
                  />
                  <button
                    type="button"
                    onClick={applyDiscountCode}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Apply
                  </button>
                </div>
                {appliedDiscount && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Discount applied: {appliedDiscount.name}
                  </p>
                )}
              </div>

              {/* Card Element */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Details
                </label>
                <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#424770',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                        },
                        invalid: {
                          color: '#9e2146',
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Pay £${priceDisplay}`
                )}
              </button>

              {/* Security Notice */}
              <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secure payment powered by Stripe
              </div>
            </form>

            {/* Money-Back Guarantee */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-semibold text-green-900 mb-1">30-Day Money-Back Guarantee</h4>
                  <p className="text-sm text-green-800">
                    Not satisfied? Get a full refund within 30 days of purchase, no questions asked.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
