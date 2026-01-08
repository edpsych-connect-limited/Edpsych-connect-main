'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { 
  removeExperience, 
  removeEducation, 
  removeSkill 
} from '@/app/actions/professional-profile';

interface DeleteProps {
  id: string;
  name?: string; // For confirmation messages
}

export function DeleteExperienceButton({ id, name }: DeleteProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to remove the experience at ${name || 'this company'}?`)) return;
    
    setIsDeleting(true);
    try {
      await removeExperience(id);
      toast.success('Experience removed');
      router.refresh();
    } catch (error) {
      toast.error('Failed to remove experience');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 text-muted-foreground hover:text-destructive"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      <span className="sr-only">Delete</span>
    </Button>
  );
}

export function DeleteEducationButton({ id, name }: DeleteProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to remove ${name || 'this education'}?`)) return;

    setIsDeleting(true);
    try {
      await removeEducation(id);
      toast.success('Education removed');
      router.refresh();
    } catch (error) {
      toast.error('Failed to remove education');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 text-muted-foreground hover:text-destructive"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      <span className="sr-only">Delete</span>
    </Button>
  );
}

export function DeleteSkillButton({ id, name }: DeleteProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    // Skills usually don't need a heavy confirmation, but preventing accidental clicks is good.
    // Making it subtle for skills (maybe no confirm for simple tags, but let's be safe).
    // Actually, for tags, a confirm might be annoying. Let's skip confirm or make it instant.
    // Decision: Instant delete for tags is standard UI pattern.
    
    setIsDeleting(true);
    try {
      await removeSkill(id);
      toast.success('Skill removed');
      router.refresh();
    } catch (error) {
      toast.error('Failed to remove skill');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      className="ml-1 text-muted-foreground hover:text-destructive focus:outline-none"
      onClick={handleDelete}
      disabled={isDeleting}
      aria-label={`Remove ${name}`}
    >
      {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
    </button>
  );
}
