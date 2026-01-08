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

import { upsertEducation } from '@/app/actions/professional-profile';

export function AddEducationSheet() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    grade: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        institution: formData.institution,
        degree: formData.degree,
        field_of_study: formData.field_of_study,
        start_date: new Date(formData.start_date),
        end_date: formData.end_date ? new Date(formData.end_date) : undefined,
        grade: formData.grade || undefined,
        description: formData.description || undefined,
      };

      await upsertEducation(payload);
      
      toast.success('Education added successfully');
      setOpen(false);
      
      // Reset form
      setFormData({
        institution: '',
        degree: '',
        field_of_study: '',
        start_date: '',
        end_date: '',
        grade: '',
        description: '',
      });
      
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to add education');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="ghost">
          <Plus className="w-4 h-4 mr-2" />
          Add Education
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add Education</SheetTitle>
          <SheetDescription>
            Add your academic background and qualifications.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="institution">Institution / University *</Label>
            <Input
              id="institution"
              name="institution"
              placeholder="e.g. University of Manchester"
              required
              value={formData.institution}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="degree">Degree / Qualification *</Label>
            <Input
              id="degree"
              name="degree"
              placeholder="e.g. Doctorate in Educational Psychology"
              required
              value={formData.degree}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="field_of_study">Field of Study *</Label>
            <Input
              id="field_of_study"
              name="field_of_study"
              placeholder="e.g. Psychology"
              required
              value={formData.field_of_study}
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
              <Label htmlFor="end_date">End Date (or expected)</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Grade (Optional)</Label>
            <Input
              id="grade"
              name="grade"
              placeholder="e.g. First Class or Pass"
              value={formData.grade}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your thesis or key achievements..."
              className="min-h-[100px]"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <SheetFooter>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Education
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
