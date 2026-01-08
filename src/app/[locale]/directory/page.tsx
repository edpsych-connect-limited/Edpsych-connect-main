import { ProfessionalProfileService } from '@/services/professional-profile-service';
import { ProfileCard } from '@/components/directory/ProfileCard';
import { DirectorySearch } from '@/components/directory/DirectorySearch';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find a Professional | EdPsych Connect',
  description: 'Search our directory of educational psychology professionals.',
};

export default async function DirectoryPage({
  searchParams,
  params
}: {
  searchParams?: { q?: string };
  params: { locale: string };
}) {
  const query = searchParams?.q || '';
  const profiles = await ProfessionalProfileService.searchProfiles(query);

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="text-center mb-10 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Professional Directory</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Connect with qualified educational psychologists, speech therapists, and SEN coordinators.
        </p>
      </div>

      <DirectorySearch />

      {profiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} locale={params.locale} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-secondary/20 rounded-lg">
          <h3 className="text-lg font-medium">No results found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  );
}
