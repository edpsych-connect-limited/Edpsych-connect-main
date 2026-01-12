
import { ProfessionalProfileService } from '@/services/professional-profile-service';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/auth-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import BookingForm from '@/components/marketplace/BookingForm';

export default async function BookingPage({ params }: { params: { professionalId: string } }) {
  const session = await getSession();
  if (!session) redirect(`/login?callbackUrl=/marketplace/book/${params.professionalId}`);

  const professionalId = parseInt(params.professionalId);
  if (isNaN(professionalId)) return notFound();

  const profile = await ProfessionalProfileService.getProfile(professionalId);
  if (!profile) return notFound();

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Link href={`/marketplace/profile?id=${professionalId}`} className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Profile
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Professional Summary Column */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="text-center">
               <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={profile.user.avatar_url || ''} />
                  <AvatarFallback>{profile.user.name.charAt(0)}</AvatarFallback>
               </Avatar>
               <CardTitle className="text-lg">{profile.user.name}</CardTitle>
               <CardDescription>Educational Psychologist</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {/* Rate info if available in future expansions */}
               <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Available for consultations</span>
               </div>
               <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Verified Professional</span>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Form Column */}
        <div className="md:col-span-2">
           <Card>
             <CardHeader>
               <CardTitle>Request Consultation</CardTitle>
               <CardDescription>
                 Send a request to discuss your case or requirements. {profile.user.name} will respond within 48 hours.
               </CardDescription>
             </CardHeader>
             <CardContent>
               <BookingForm professionalId={professionalId} />
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
