'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { submitRecommendation } from '@/actions/recommendation-actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface WriteRecommendationFormProps {
  receiverId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function WriteRecommendationForm({ receiverId, onSuccess, onCancel }: WriteRecommendationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      formData.append('receiver_id', receiverId.toString());
      await submitRecommendation(formData);
      
      toast({
        title: 'Recommendation Submitted',
        description: 'Thank you for your feedback!',
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit recommendation',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="relationship">Relationship</Label>
        <Input 
          id="relationship" 
          name="relationship" 
          placeholder="e.g. Worked together on EHCP cases" 
          required 
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground">How do you know this professional?</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Your Recommendation</Label>
        <Textarea 
          id="comment" 
          name="comment" 
          placeholder="Share your experience working with this professional..." 
          className="min-h-[150px]"
          required 
          disabled={isSubmitting}
        />
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Recommendation
        </Button>
      </div>
    </form>
  );
}
