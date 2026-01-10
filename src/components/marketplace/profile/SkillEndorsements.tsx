'use client';

import React from 'react';
import { EndorseSkillButton } from '@/components/directory/EndorseSkillButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils'; // Assuming this exists, typical in shadcn/ui

// Type matches the one in ProfessionalProfileService
interface SkillWithEndorsements {
  id: string;
  name: string;
  user_id: number;
  is_verified: boolean;
  created_at: Date;
  endorsements: {
    endorser: {
      id: number;
      name: string;
      avatar_url: string | null;
    };
  }[];
}

interface SkillEndorsementsProps {
  skills: SkillWithEndorsements[];
  currentUserId: number | null;
}

export function SkillEndorsements({ skills, currentUserId }: SkillEndorsementsProps) {
  if (!skills || skills.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No skills listed.</p>;
  }

  const isOwnProfile = (skillUserId: number) => {
      // Logic assumes all skills belong to the profile owner
      // We don't have the profile owner's ID passed directly, but we can infer from the first skill
      // Or safer: the parent component should handle "isOwnProfile" logic for the button, 
      // but EndorseSkillButton takes a boolean. 
      // Better: we pass isOwnProfile logic down or check against skill.user_id
      return currentUserId === skillUserId;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {skills.map((skill) => {
          const isEndorsed = currentUserId
            ? skill.endorsements.some((e) => e.endorser.id === currentUserId)
            : false;
          
          const endorsers = skill.endorsements.map(e => e.endorser);
          const visibleEndorsers = endorsers.slice(0, 3);
          const hasMore = endorsers.length > 3;

          return (
            <div
              key={skill.id}
              className="group flex items-center justify-between gap-3 bg-secondary/30 border border-secondary hover:bg-secondary/50 transition-colors px-3 py-2 rounded-lg"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{skill.name}</span>
                {/* Endorser Avatar Stack (Social Proof) */}
                {endorsers.length > 0 && (
                  <div className="flex items-center -space-x-2 mt-1">
                     <TooltipProvider delayDuration={300}>
                      {visibleEndorsers.map((endorser, i) => (
                        <Tooltip key={endorser.id}>
                          <TooltipTrigger asChild>
                            <Avatar className="h-5 w-5 border-2 border-background cursor-help">
                              <AvatarImage src={endorser.avatar_url || ''} alt={endorser.name} />
                              <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                                {endorser.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs font-semibold">{endorser.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                    {hasMore && (
                       <span className="flex items-center justify-center h-5 w-5 rounded-full bg-muted text-[9px] font-medium border-2 border-background z-10 text-muted-foreground ml-1">
                         +{endorsers.length - 3}
                       </span>
                    )}
                  </div>
                )}
              </div>

              <EndorseSkillButton
                skillId={skill.id}
                initialCount={skill.endorsements.length}
                initialIsEndorsed={isEndorsed}
                isOwnProfile={isOwnProfile(skill.user_id)}
                isLoggedIn={!!currentUserId}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
