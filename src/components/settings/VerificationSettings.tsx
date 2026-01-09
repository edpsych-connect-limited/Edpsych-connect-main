
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Shield, CheckCircle, AlertCircle, Loader2, Upload, FileCheck, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface VerificationData {
  dbs_certificate_number: string | null;
  dbs_issue_date: string | null;
  dbs_update_service: boolean;
  hcpc_registration_number: string | null;
  verification_status: string;
  dbs_verified: boolean;
  hcpc_verified: boolean;
}

export default function VerificationSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<VerificationData | null>(null);
  const [dbsNumber, setDbsNumber] = useState('');
  const [dbsDate, setDbsDate] = useState('');
  const [dbsUpdateService, setDbsUpdateService] = useState(false);
  const [hcpcNumber, setHcpcNumber] = useState('');

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch('/api/professional/verification');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const v = result.data || {};
          setData(v);
          setDbsNumber(v.dbs_certificate_number || '');
          setDbsDate(v.dbs_issue_date ? new Date(v.dbs_issue_date).toISOString().split('T')[0] : '');
          setDbsUpdateService(v.dbs_update_service || false);
          setHcpcNumber(v.hcpc_registration_number || '');
        }
      }
    } catch (error) {
      console.error('Failed to fetch verification status', error);
      // Fail silently or show toast
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/professional/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dbsNumber,
          dbsDate,
          dbsUpdateService,
          hcpcNumber
        })
      });

      if (response.ok) {
        toast.success('Verification details submitted successfully');
        fetchVerificationStatus(); // Refresh
      } else {
        toast.error('Failed to save details');
      }
    } catch (error) {
      toast.error('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </CardContent>
      </Card>
    );
  }

  const isVerified = data?.verification_status === 'verified';
  const isPending = data?.verification_status === 'pending';

  return (
    <div className="space-y-6">
      <Card className="border-indigo-100 dark:border-indigo-900 shadow-sm">
        <CardHeader className="bg-indigo-50/50 dark:bg-indigo-900/20 rounded-t-xl border-b border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
              <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle>Professional Verification</CardTitle>
              <CardDescription>
                Provide your DBS and HCPC details to become a verified professional.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Status Indicator */}
          <div className={`p-4 rounded-lg flex items-start gap-3 ${
            isVerified 
              ? 'bg-green-50 border border-green-100 text-green-800' 
              : isPending 
                ? 'bg-yellow-50 border border-yellow-100 text-yellow-800'
                : 'bg-slate-50 border border-slate-100 text-slate-800'
          }`}>
            {isVerified ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : isPending ? (
              <Loader2 className="w-5 h-5 text-yellow-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-slate-600 mt-0.5" />
            )}
            <div>
              <h4 className="font-semibold">
                {isVerified ? 'Verified Professional' : isPending ? 'Verification Pending' : 'Not Verified'}
              </h4>
              <p className="text-sm mt-1 opacity-90">
                {isVerified 
                  ? 'Your professional credentials have been verified. You have full access to the platform.' 
                  : isPending 
                    ? 'Your details are currently being reviewed by our compliance team.' 
                    : 'Please submit your details below to start the verification process.'}
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* DBS Section */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                DBS Check Details
              </h3>
              <div className="space-y-2">
                <Label htmlFor="dbsNumber">DBS Certificate Number</Label>
                <Input 
                  id="dbsNumber" 
                  placeholder="e.g. 001234567890" 
                  value={dbsNumber}
                  onChange={(e) => setDbsNumber(e.target.value)}
                  disabled={isVerified}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dbsDate">Issue Date</Label>
                <Input 
                  id="dbsDate" 
                  type="date" 
                  value={dbsDate}
                  onChange={(e) => setDbsDate(e.target.value)}
                  disabled={isVerified}
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="dbsUpdate" 
                  checked={dbsUpdateService}
                  onCheckedChange={(c) => setDbsUpdateService(c === true)}
                  disabled={isVerified}
                />
                <Label htmlFor="dbsUpdate" className="text-sm font-normal text-slate-600 cursor-pointer">
                  I am on the DBS Update Service
                </Label>
              </div>
            </div>

            {/* HCPC Section */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                HCPC Registration
              </h3>
              <div className="space-y-2">
                <Label htmlFor="hcpcNumber">HCPC Registration Number</Label>
                <Input 
                  id="hcpcNumber" 
                  placeholder="e.g. PYL12345" 
                  value={hcpcNumber}
                  onChange={(e) => setHcpcNumber(e.target.value)}
                  disabled={isVerified}
                />
              </div>
              
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                <p>
                  We verify all HCPC registration numbers against the public register.
                  Please ensure your name on the platform matches your HCPC registration.
                </p>
              </div>
            </div>
          </div>

          {!isVerified && (
            <div className="pt-4 border-t border-slate-100">
               {/* Document Upload Placeholder */}
               <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="font-medium text-slate-900">Upload Supporting Documents</p>
                  <p className="text-sm text-slate-500 mb-2">Scan of DBS Certificate (optional if on Update Service)</p>
                  <Button variant="outline" size="sm" className="mt-2" disabled>
                    Choose Files (Coming Soon)
                  </Button>
               </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800 flex justify-end p-4 rounded-b-xl">
           <Button 
            onClick={handleSave} 
            disabled={saving || isVerified} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
             {saving ? (
               <>
                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                 Saving...
               </>
             ) : (
               'Submit for Verification'
             )}
           </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
