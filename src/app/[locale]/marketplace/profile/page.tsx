import { getSession } from '@/lib/auth/auth-service';
import { ProfessionalProfileService } from '@/services/professional-profile-service';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, GraduationCap, Award, CheckCircle2, Calendar } from 'lucide-react';
import { AddExperienceSheet } from '@/components/marketplace/profile/AddExperienceSheet';
import { AddEducationSheet } from '@/components/marketplace/profile/AddEducationSheet';
import { AddSkillSheet } from '@/components/marketplace/profile/AddSkillSheet';
import { DeleteExperienceButton, DeleteEducationButton, DeleteSkillButton } from '@/components/marketplace/profile/DeleteButtons';
import { ProfileAvatarUploader } from '@/components/marketplace/profile/ProfileAvatarUploader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import React from 'react';

export default async function ProfilePage({ searchParams }: { searchParams: { id?: string } }) {
  const session = await getSession();
  
  let targetUserId: number;
  let isOwner = false;
  let isPublicView = false;

  if (searchParams?.id) {
     targetUserId = parseInt(searchParams.id);
     if (isNaN(targetUserId)) return <div>Invalid Profile ID</div>;
     
     if (session && parseInt(session.id) === targetUserId) {
         isOwner = true;
     } else {
         isPublicView = true;
     }
  } else {
     // Private mode (My Profile)
     if (!session) redirect('/login');
     targetUserId = parseInt(session.id);
     isOwner = true;
  }

  const profile = await ProfessionalProfileService.getProfile(targetUserId);
  
  if (!profile) {
    if (isPublicView) return notFound();
    return <div>Profile not found. Please complete onboarding.</div>;
  }

  // Helper to format date
  const formatDate = (d: Date | null) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Present';

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-5xl">
       <div className="flex justify-between items-center mb-6">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isOwner ? 'My Professional Profile' : `${profile.user.name}'s Profile`}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isOwner 
                ? 'Manage your experience, skills, and validated claims.' 
                : 'View professional experience, qualifications, and areas of expertise.'}
            </p>
         </div>
         {isOwner ? (
            <Button variant="outline" asChild>
              <Link href={`/marketplace/profile?id=${targetUserId}`}>View Public Profile</Link>
            </Button>
         ) : (
            <Button size="lg" className="gap-2" asChild>
              <Link href={`/marketplace/book/${targetUserId}`}>
                <Calendar className="w-4 h-4" />
                Book Consultation
              </Link>
            </Button>
         )}
       </div>

       {/* Profile Header */}
       <Card>
         <CardContent className="pt-6">
           <div className="flex flex-col md:flex-row items-center gap-6">
             {isOwner ? (
                <ProfileAvatarUploader 
                    currentImageUrl={profile.user.avatar_url} 
                    userName={profile.user.name} 
                />
             ) : (
                <Avatar className="h-24 w-24 ring-2 ring-background shadow-lg">
                  <AvatarImage src={profile.user.avatar_url || ''} alt={profile.user.name} />
                  <AvatarFallback className="text-2xl">{profile.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
             )}
             
             <div className="flex-1 text-center md:text-left space-y-2">
               <div>
                  <h2 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
                    {profile.user.name}
                    {/* Add featured badge if applicable, or generic check */}
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  </h2>
                  <p className="text-muted-foreground">{profile.user.email}</p>
               </div>
               
               {isPublicView && (
                 <div className="flex gap-2 justify-center md:justify-start pt-2">
                   <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Verified EP
                   </div>
                   {/* We could add more badges here dynamically */}
                 </div>
               )}
             </div>
           </div>
         </CardContent>
       </Card>

       {/* Experience Section */}
       <Card>
         <CardHeader className="flex flex-row items-center justify-between pb-2">
           <div className="flex items-center gap-2">
             <Building2 className="w-5 h-5 text-primary" />
             <CardTitle>Experience</CardTitle>
           </div>
           {isOwner && <AddExperienceSheet />}
         </CardHeader>
         <CardContent className="space-y-6 pt-2">
           {(!profile.experiences || profile.experiences.length === 0) && (
             <p className="text-muted-foreground italic text-sm">No professional experience listed.</p>
           )}
           {profile.experiences.map(exp => (
             <div key={exp.id} className="border-b last:border-0 pb-6 last:pb-0 relative group">
               <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{exp.title}</h3>
                  {isOwner && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <DeleteExperienceButton id={exp.id} name={exp.company} />
                    </div>
                  )}
               </div>
               <div className="flex items-center gap-2 text-sm text-foreground/80 mt-1">
                 <span className="font-medium">{exp.company}</span>
                 <span>•</span>
                 <span className="text-muted-foreground">{exp.location}</span>
               </div>
               <p className="text-xs text-muted-foreground mt-1">
                 {formatDate(exp.start_date)} - {exp.is_current ? 'Present' : formatDate(exp.end_date)}
               </p>
               {exp.description && <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
             </div>
           ))}
         </CardContent>
       </Card>

       {/* Education Section */}
       <Card>
         <CardHeader className="flex flex-row items-center justify-between pb-2">
           <div className="flex items-center gap-2">
             <GraduationCap className="w-5 h-5 text-primary" />
             <CardTitle>Education</CardTitle>
           </div>
           {isOwner && <AddEducationSheet />}
         </CardHeader>
         <CardContent className="space-y-6 pt-2">
            {(!profile.education || profile.education.length === 0) && (
             <p className="text-muted-foreground italic text-sm">No education listed.</p>
           )}
           {profile.education.map(edu => (
             <div key={edu.id} className="border-b last:border-0 pb-6 last:pb-0 group">
               <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{edu.institution}</h3>
                  {isOwner && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <DeleteEducationButton id={edu.id} name={edu.institution} />
                    </div>
                  )}
               </div>
               <p className="text-sm font-medium mt-1">{edu.degree}, {edu.field_of_study}</p>
               <p className="text-xs text-muted-foreground mt-1">
                 {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
               </p>
               {edu.grade && <p className="text-xs mt-1">Grade: {edu.grade}</p>}
             </div>
           ))}
         </CardContent>
       </Card>
        
       {/* Skills Section */}
       <Card>
         <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
             <Award className="w-5 h-5 text-primary" />
             <CardTitle>Skills & Verification</CardTitle>
           </div>
           {isOwner && <AddSkillSheet />}
         </CardHeader>
         <CardContent>
           <div className="flex flex-wrap gap-2">
             {profile.skills.map(skill => (
               <div key={skill.id} className={`bg-secondary/50 border transition-colors px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 group ${isOwner ? 'hover:bg-secondary pr-2 cursor-pointer' : ''}`}>
                 {skill.name}
                 {skill.is_verified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
                 {skill.endorsements.length > 0 && <span className="text-[10px] bg-background border px-1.5 rounded-full">{skill.endorsements.length}</span>}
                 {isOwner && (
                    <div className="border-l pl-2 ml-1 cursor-auto">
                        <DeleteSkillButton id={skill.id} name={skill.name} />
                    </div>
                 )}
               </div>
             ))}
             {(!profile.skills || profile.skills.length === 0) && (
                <p className="text-muted-foreground italic text-sm">No skills listed.</p>
             )}
           </div>
         </CardContent>
       </Card>
    </div>
  );
}
