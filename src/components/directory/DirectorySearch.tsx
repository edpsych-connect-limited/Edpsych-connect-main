'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

// If use-debounce is not installed, I'll use a timer.
// I'll check package.json quickly? 
// No, I'll just write a custom hook or simple timeout to be safe and avoid dependency errors.

export function DirectorySearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const [value, setValue] = useState(searchParams.get('q')?.toString() || '');

  // Manual debounce
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (timer) clearTimeout(timer);
    
    const newTimer = setTimeout(() => {
        handleSearch(newValue);
    }, 300);
    
    setTimer(newTimer);
  };

  return (
    <div className="relative mb-8 max-w-lg mx-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder="Search by name, title, or skills..." 
        className="pl-10"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
