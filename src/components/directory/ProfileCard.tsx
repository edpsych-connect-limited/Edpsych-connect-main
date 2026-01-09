'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, X, MessageSquare } from 'lucide-react';
import ContactProfessionalForm from './ContactProfessionalForm';

interface ProfileCardProps {
  profile: {
    id: number;
    name: string;
    avatar_url: string | null;
    experiences: { title: string; company: string; location: string | null }[];
    skills: { name: string }[];
  };
  locale?: string;
}

export function ProfileCard({ profile, locale = 'en' }: ProfileCardProps) {
  const [showContact, setShowContact] = useState(false);

  const currentRole = profile.experiences[0];
  const initials = profile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
    <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
      <CardContent className="p-6 flex-grow">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center shrink-0 overflow-hidden border">
            {profile.avatar_url ? (
               // eslint-disable-next-line @next/next/no-img-element
               <img src={profile.avatar_url} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-muted-foreground">{initials}</span>
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="font-bold text-lg leading-tight">{profile.name}</h3>
            {currentRole ? (
                <div className="text-sm text-muted-foreground flex flex-col gap-0.5">
                    <span className="font-medium text-foreground/80 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        {currentRole.title}
                    </span>
                    <span className="text-xs">{currentRole.company}</span>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">Education Professional</p>
            )}
            
            {currentRole?.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" />
                    {currentRole.location}
                </div>
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="mt-6">
            <div className="flex flex-wrap gap-2">
                {profile.skills.length > 0 ? (
                    profile.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="bg-secondary/40 text-secondary-foreground text-xs px-2.5 py-0.5 rounded-full font-medium">
                            {skill.name}
                        </span>
                    ))
                ) : (
                    <span className="text-xs text-muted-foreground italic">No skills listed</span>
                )}
                {profile.skills.length > 3 && (
                    <span className="text-xs text-muted-foreground px-1 py-0.5 self-center">+{profile.skills.length - 3} more</span>
                )}
            </div>
        </div>
      </CardContent>
      <CardFooter className="bg-secondary/10 p-4 pt-0 border-t border-border/50">
        <div className="flex gap-3 w-full mt-4">
            <Link href={`/professional/${profile.id}`} className="flex-1">
                <Button variant="outline" className="w-full">View Profile</Button>
            </Link>
            <Button 
                className="flex-1 gap-2" 
                onClick={() => setShowContact(true)}
            >
                <MessageSquare className="w-4 h-4" />
                Contact
            </Button>
        </div>
      </CardFooter>
    </Card>

    {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
            >
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-gray-900">Send Message</h3>
                    <button 
                        onClick={() => setShowContact(false)} 
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                     <ContactProfessionalForm 
                         professionalId={profile.id.toString()}
                         professionalName={profile.name}
                         onCancel={() => setShowContact(false)}
                         onSuccess={() => {
                             // Keep modal open briefly to show success message handled inside form, then close
                             // Form component handles the success UI, but we could close it here if passed as prop
                             // The form component waits 2s then calls onSuccess
                             setShowContact(false);
                         }}
                     />
                </div>
            </div>
        </div>
    )}
    </>
  );
}
