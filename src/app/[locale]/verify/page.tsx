'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle, XCircle, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface VerificationResult {
  valid: boolean;
  certificate?: {
    holderName: string;
    courseName: string;
    issueDate: string;
    expiryDate?: string;
    cpdHours: number;
  };
  error?: string;
}

export default function VerifyPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/training/certificates/verify?code=${encodeURIComponent(code.trim().toUpperCase())}`);
      const data = await response.json();

      if (response.ok && data.valid && data.certificate) {
        setResult({
          valid: true,
          certificate: {
            holderName: data.certificate.holderName,
            courseName: data.certificate.courseName,
            issueDate: data.certificate.issueDate,
            expiryDate: data.certificate.expiryDate,
            cpdHours: data.certificate.cpdHours,
          },
        });
      } else {
        setResult({
          valid: false,
          error: data.error ?? 'Certificate not found. Please check the verification code and try again.',
        });
      }
    } catch {
      setResult({
        valid: false,
        error: 'Verification service unavailable. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/training" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Training
        </Link>
        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-blue-900">Decision Support</p>
              <p className="text-sm text-blue-800">
                Verify certificates before sharing them externally. If the code fails, confirm the
                exact EPSC prefix and request a reissue from the training team.
              </p>
            </div>
            <div className="text-xs text-blue-700">
              Focus: verify, confirm prefix, reissue if needed.
            </div>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Certificate Verification</CardTitle>
            <CardDescription>
              Enter the verification code from a certificate to confirm its authenticity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <Input
                placeholder="Enter verification code (e.g., EPSC-XXXX-XXXX-XXXX)"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="font-mono text-lg"
                maxLength={19}
              />
              <Button onClick={handleVerify} disabled={loading || !code.trim()}>
                {loading ? (
                  <span className="animate-spin">Pending</span>
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>

            {result && (
              <div className={`p-4 rounded-lg ${result.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-start gap-3">
                  {result.valid ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className={`font-semibold ${result.valid ? 'text-green-900' : 'text-red-900'}`}>
                      {result.valid ? 'Certificate Verified' : 'Verification Failed'}
                    </h3>
                    {result.valid && result.certificate ? (
                      <dl className="mt-3 space-y-2 text-sm">
                        <div>
                          <dt className="text-gray-500">Holder Name</dt>
                          <dd className="font-medium text-gray-900">{result.certificate.holderName}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Course</dt>
                          <dd className="font-medium text-gray-900">{result.certificate.courseName}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Issue Date</dt>
                          <dd className="font-medium text-gray-900">{result.certificate.issueDate}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">CPD Hours</dt>
                          <dd className="font-medium text-gray-900">{result.certificate.cpdHours} hours</dd>
                        </div>
                      </dl>
                    ) : (
                      <p className="mt-1 text-sm text-red-700">{result.error}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-medium text-slate-900 mb-2">Where to find the verification code?</h4>
              <p className="text-sm text-slate-600">
                The verification code is located at the bottom of your certificate, starting with &quot;EPSC-&quot; 
                followed by 12 characters (e.g., EPSC-XXXX-XXXX-XXXX).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
