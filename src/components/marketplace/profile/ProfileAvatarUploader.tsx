'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { getCloudinarySignature } from '@/app/actions/cloudinary-signature';
import { updateProfileImage } from '@/app/actions/professional-profile';
import { useRouter } from 'next/navigation';

interface ProfileAvatarUploaderProps {
  currentImageUrl?: string | null;
  userName: string;
}

export function ProfileAvatarUploader({ currentImageUrl, userName }: ProfileAvatarUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // 1. Get signature from server
      const { signature, timestamp, apiKey, cloudName, folder } = await getCloudinarySignature();

      // 2. Upload to Cloudinary directly
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey!);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image to storage');
      }

      const data = await response.json();
      const secureUrl = data.secure_url;

      // 3. Update database
      await updateProfileImage(secureUrl);

      toast.success('Profile picture updated');
      router.refresh();
      
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile picture');
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative group">
      <div className="h-24 w-24 rounded-full border-2 border-primary/10 overflow-hidden bg-secondary/50 flex items-center justify-center relative">
        {currentImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={currentImageUrl} 
            alt={userName} 
            className="h-full w-full object-cover" 
          />
        ) : (
          <span className="text-2xl font-bold text-muted-foreground">{initials}</span>
        )}
        
        {/* Overlay on hover */}
        <div 
          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
            <Camera className="w-6 h-6 text-white" />
        </div>
        
        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      
      {/* Mobile helper text or button if needed, basically a visually hidden hint 
          that this area is clickable 
      */}
      <p className="text-xs text-muted-foreground mt-2 text-center group-hover:text-primary transition-colors">
        Change Photo
      </p>
    </div>
  );
}
