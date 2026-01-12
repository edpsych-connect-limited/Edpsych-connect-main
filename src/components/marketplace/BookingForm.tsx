'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { submitBookingEnquiry } from '@/actions/marketplace-actions';
import { Loader2, CheckCircle } from 'lucide-react';

export default function BookingForm({ professionalId }: { professionalId: number }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError('');
    
    // Append the hidden ID since it's passed as prop
    formData.append('professionalId', professionalId.toString());

    try {
      const result = await submitBookingEnquiry(formData);
      if (result.success) {
        setIsSuccess(true);
      }
    } catch (e) {
      console.error(e);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold">Request Sent!</h3>
        <p className="text-muted-foreground">
          The professional has received your enquiry and will respond shortly via your <a href="/dashboard" className="underline text-blue-600">Dashboard</a>.
        </p>
        <a href="/marketplace">
          <Button className="mt-6">
            Return to Marketplace
          </Button>
        </a>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input 
          id="subject" 
          name="subject" 
          placeholder="Brief summary of requirements (e.g. EHCP Assessment)" 
          required 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="preferredDate">Preferred Date</Label>
          <Input 
            id="preferredDate" 
            name="preferredDate" 
            type="date" 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferredTime">Preferred Time</Label>
          <select 
            id="preferredTime"
            name="preferredTime"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
          >
            <option value="Morning">Morning (9am - 12pm)</option>
            <option value="Afternoon">Afternoon (1pm - 5pm)</option>
            <option value="Anytime">Anytime</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea 
          id="message" 
          name="message"
          placeholder="Please describe the context, age of the child/young person, and specific needs..." 
          className="min-h-[150px]"
          required
        />
      </div>

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
        <p>There is no charge for making this initial enquiry. Fees will be discussed once the scope of work is agreed.</p>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          'Send Request'
        )}
      </Button>
    </form>
  );
}
