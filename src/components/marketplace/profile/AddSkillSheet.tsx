'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Plus, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { addSkill } from '@/app/actions/professional-profile';

export function AddSkillSheet() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [skillName, setSkillName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    
    setLoading(true);

    try {
      const result = await addSkill(skillName.trim());
      
      if (!result.success && result.error) {
        throw new Error(result.error);
      }

      toast.success('Skill added successfully');
      setOpen(false);
      setSkillName('');
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="ghost">
          <Plus className="w-4 h-4 mr-2" />
          Add Skill
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add Skill</SheetTitle>
          <SheetDescription>
            Highlight your professional capabilities.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="skillName">Skill Name <span className="text-red-500">*</span></Label>
            <Input
              id="skillName"
              placeholder="e.g. Cognitive Assessment, Educational Psychology, Conflict Resolution"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              required
            />
          </div>

          <SheetFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Skill
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
