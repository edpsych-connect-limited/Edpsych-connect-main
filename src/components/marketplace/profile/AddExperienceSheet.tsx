'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Plus, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { upsertExperience } from '@/app/actions/professional-profile';

export function AddExperienceSheet() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setFormData((prev) => ({ ...prev, is_current: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        company: formData.company,
        location: formData.location || undefined,
        start_date: new Date(formData.start_date),
        end_date: formData.end_date ? new Date(formData.end_date) : undefined,
        is_current: formData.is_current,
        description: formData.description || undefined,
      };

      await upsertExperience(payload);
      
      toast.success('Experience added successfully');
      setOpen(false);
      
      // Reset form
      setFormData({
        title: '',
        company: '',
        location: '',
        start_date: '',
        end_date: '',
        is_current: false,
        description: '',
      });
      
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to add experience');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="ghost">
          <Plus className="w-4 h-4 mr-2" />
          Add Experience
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add Professional Experience</SheetTitle>
          <SheetDescription>
            Add your past work experience to build your professional profile.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Senior Educational Psychologist"
              required
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company / Organization *</Label>
            <Input
              id="company"
              name="company"
              placeholder="e.g. London Borough of Hackney"
              required
              value={formData.company}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g. London, UK"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                required
                value={formData.start_date}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                disabled={formData.is_current}
                required={!formData.is_current}
                value={formData.end_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_current"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              checked={formData.is_current}
              onChange={handleCheckboxChange}
            />
            <Label htmlFor="is_current" className="font-normal cursor-pointer">
              I currently work here
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your responsibilities and achievements..."
              className="min-h-[120px]"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <SheetFooter>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Experience
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
