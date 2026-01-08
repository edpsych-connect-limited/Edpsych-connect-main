import { ProfessionalProfileService } from '@/services/professional-profile-service';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, GraduationCap, Award, MapPin, Mail, Calendar } from 'lucide-react';
import React from 'react';
import { Metadata } from 'next';
import { ProfileActions } from '@/components/directory/ProfileActions';
import { RecommendationsSection } from '@/components/directory/RecommendationsSection';

interface Props {
  params: {
    id: string;
    locale: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const userId = parseInt(params.id);
  if (isNaN(userId)) return { title: 'Profile Not Found' };

  const profile = await ProfessionalProfileService.getProfile(userId);
  if (!profile) return { title: 'Profile Not Found' };

  return {
    title: `${profile.user.name} - Professional Profile | EdPsych Connect`,
    description: `View the professional profile and portfolio of ${profile.user.name}.`,
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const userId = parseInt(params.id);
  if (isNaN(userId)) notFound();

  const profile = await ProfessionalProfileService.getProfile(userId);
  if (!profile) notFound();

  const { user, experiences, education, skills, recommendations } = profile;

  // Format date helper
  const formatDate = (d: Date | null) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Present';
  
  // Initials for avatar fallback
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-5xl">
       {/* Header Card */}
       <Card className="overflow-hidden">
         <div className="h-32 bg-gradient-to-r from-primary/10 to-secondary/20"></div>
         <CardContent className="relative pt-0">
           <div className="flex flex-col md:flex-row items-start gap-6 -mt-12 px-2">
             
             {/* Avatar */}
             <div className="h-32 w-32 rounded-full border-4 border-background bg-secondary flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
               {user.avatar_url ? (
                 // eslint-disable-next-line @next/next/no-img-element
                 <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
               ) : (
                 <span className="text-4xl font-bold text-muted-foreground">{initials}</span>
               )}
             </div>

             {/* Basic Info */}
             <div className="flex-1 mt-12 md:mt-14 space-y-2 text-center md:text-left">
               <div>
                 <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                 {/* Ideally we'd have a 'headline' or 'current role' field. For now, use the most recent experience or a generic placeholder if missing */}
                 {experiences.length > 0 && experiences[0].is_current ? (
                   <div className="text-lg text-muted-foreground font-medium">{experiences[0].title} at {experiences[0].company}</div>
                 ) : (
                    <div className="text-lg text-muted-foreground">Education Professional</div>
                 )}
               </div>
               
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-muted-foreground">
                 {experiences.length > 0 && experiences[0].location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {experiences[0].location}
                    </div>
                 )}
                 <div className="flex items-center gap-1">
                   <Mail className="w-4 h-4" />
                   <span className="opacity-90">Verify via Connect</span>
                 </div>
                 <div className="flex items-center gap-1">
                   <Calendar className="w-4 h-4" />
                   <span>Member since {new Date().getFullYear()}</span> 
                 </div>
               </div>
             </div>

             {/* Action Buttons */}
             <div className="mt-12 md:mt-14 flex gap-3 shrink-0">
               <ProfileActions professionalId={user.id.toString()} professionalName={user.name} />
             </div>
           </div>
         </CardContent>
       </Card>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         
         {/* Left Column: Stats or Summary (Future Phase) -> currently Skills */}
         <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5 text-primary" />
                  Skills & Endorsements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {skills.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No skills listed.</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <div key={skill.id} className="bg-secondary/50 hover:bg-secondary transition-colors text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 cursor-default" title={`${skill.endorsements.length} endorsements`}>
                      {skill.name}
                      {skill.endorsements.length > 0 && (
                        <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">{skill.endorsements.length}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations Section */}
            <RecommendationsSection 
              professionalId={userId} 
              recommendations={recommendations} 
            />
         </div>

         {/* Right Column: Experience & Education */}
         <div className="md:col-span-2 space-y-6">
           
           {/* Experience */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Building2 className="w-5 h-5 text-primary" />
                 Experience
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-8">
               {experiences.length === 0 && (
                 <p className="text-muted-foreground italic text-sm">No professional experience listed.</p>
               )}
               {experiences.map((exp, i) => (
                 <div key={exp.id} className="relative pl-6 border-l-2 border-border last:border-0 pb-6 last:pb-0">
                   {/* Timeline dot */}
                   <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-background border-2 border-primary"></div>
                   
                   <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg">{exp.title}</h3>
                   </div>
                   <div className="text-foreground/80 font-medium mb-1">{exp.company}</div>
                   <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                     <span>{formatDate(exp.start_date)} - {exp.is_current ? 'Present' : formatDate(exp.end_date)}</span>
                     {exp.location && (
                       <>
                         <span>•</span>
                         <span>{exp.location}</span>
                       </>
                     )}
                   </div>
                   {exp.description && (
                     <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{exp.description}</p>
                   )}
                 </div>
               ))}
             </CardContent>
           </Card>

           {/* Education */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <GraduationCap className="w-5 h-5 text-primary" />
                 Education
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
                {education.length === 0 && (
                 <p className="text-muted-foreground italic text-sm">No education listed.</p>
               )}
               {education.map(edu => (
                 <div key={edu.id} className="flex gap-4">
                   <div className="h-12 w-12 rounded bg-secondary/30 flex items-center justify-center shrink-0">
                     <GraduationCap className="w-6 h-6 text-muted-foreground" />
                   </div>
                   <div>
                     <h3 className="font-semibold text-base">{edu.institution}</h3>
                     <p className="text-sm font-medium">{edu.degree}, {edu.field_of_study}</p>
                     <p className="text-xs text-muted-foreground mt-0.5">
                       {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                     </p>
                   </div>
                 </div>
               ))}
             </CardContent>
           </Card>
         </div>
       </div>
    </div>
  );
}
