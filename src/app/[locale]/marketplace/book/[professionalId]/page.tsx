
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
               <form className="space-y-6">
                 <div className="space-y-2">
                   <Label htmlFor="subject">Subject</Label>
                   <Input id="subject" placeholder="Brief summary of requirements (e.g. EHCP Assessment)" required />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preferred-date">Preferred Date</Label>
                      <Input id="preferred-date" type="date" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferred-time">Preferred Time</Label>
                      {/* Simple Select Placeholder */}
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" id="preferred-time">
                        <option>Morning (9am - 12pm)</option>
                        <option>Afternoon (1pm - 5pm)</option>
                        <option>Anytime</option>
                      </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                   <Label htmlFor="message">Message</Label>
                   <Textarea 
                      id="message" 
                      placeholder="Please describe the context, age of the child/young person, and specific needs..." 
                      className="min-h-[150px]"
                      required
                   />
                 </div>

                 <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                    <p>There is no charge for making this initial enquiry. Fees will be discussed once the scope of work is agreed.</p>
                 </div>

                 <Button type="submit" className="w-full size-lg">
                    Send Request
                 </Button>
               </form>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
