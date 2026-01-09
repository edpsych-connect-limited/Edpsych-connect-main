'use client';

import { useState } from 'react';
import { toggleEndorsement } from '@/actions/skill-actions';
import { ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface EndorseSkillButtonProps {
  skillId: string;
  initialCount: number;
  initialIsEndorsed: boolean;
  isOwnProfile: boolean;
  isLoggedIn: boolean;
}

export function EndorseSkillButton({ 
  skillId, 
  initialCount, 
  initialIsEndorsed, 
  isOwnProfile,
  isLoggedIn
}: EndorseSkillButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [isEndorsed, setIsEndorsed] = useState(initialIsEndorsed);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  async function handleToggle() {
    if (!isLoggedIn) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to verify skills.',
        variant: 'default',
      });
      return;
    }

    if (isOwnProfile) return;
    
    setIsLoading(true);
    
    // Optimistic update
    const previousIsEndorsed = isEndorsed;
    const previousCount = count;
    
    const newIsEndorsed = !isEndorsed;
    setIsEndorsed(newIsEndorsed);
    setCount(prev => newIsEndorsed ? prev + 1 : prev - 1);

    try {
      await toggleEndorsement(skillId);
    } catch (error) {
      // Revert on error
      setIsEndorsed(previousIsEndorsed);
      setCount(previousCount);
      toast({
        title: 'Error',
        description: 'Failed to update endorsement',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={isOwnProfile || isLoading}
      className={cn(
        "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium transition-colors border",
        isEndorsed 
          ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" 
          : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground",
        isOwnProfile && "cursor-default hover:bg-secondary/50 opacity-80"
      )}
      title={
        !isLoggedIn ? "Sign in to endorse" :
        isOwnProfile ? "Validations received" : 
        (isEndorsed ? "Remove endorsement" : "Verify this skill")
      }
    >
      <ThumbsUp className={cn("w-3 h-3", isEndorsed && "fill-current")} />
      <span>{count}</span>
    </button>
  );
}
