'use client'

/**
 * PROFESSIONAL MARKETPLACE - PROFESSIONAL DASHBOARD
 * 
 * Manage your marketplace profile, bookings, earnings, and reviews
 * Crystal-clear overview of your professional marketplace activity
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Star, 
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Award,
  Edit,
  Eye
} from 'lucide-react';

interface Profile {
  id: number;
  professional_type: string;
  job_title: string;
  verification_status: string;
  la_panel_status: string;
  panel_membership_tier: string;
  commission_rate: number;
  is_accepting_bookings: boolean;
  average_rating: number | null;
  total_reviews: number;
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  user: {
    name: string;
    email: string;
  };
}

interface Booking {
  id: number;
  booking_type: string;
  booking_date: string;
  status: string;
  total_amount: number;
  professional_earnings: number;
  client: {
    name: string;
    role: string;
  };
  student: {
    first_name: string;
    last_name: string;
  } | null;
}

export default function ProfessionalDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/marketplace/dashboard');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setBookings(data.bookings);
      }
    } catch (_error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAcceptingBookings = async () => {
    if (!profile) return;
    try {
      const response = await fetch('/api/marketplace/profile/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_accepting_bookings: !profile.is_accepting_bookings }),
      });
      if (response.ok) {
        setProfile({ ...profile, is_accepting_bookings: !profile.is_accepting_bookings });
      }
    } catch (_error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleBookingAction = async (bookingId: number, action: string) => {
    try {
      await fetch(`/api/marketplace/bookings/${bookingId}/${action}`, {
        method: 'POST',
      });
      fetchDashboardData();
    } catch (_error) {
      console.error(`Failed to ${action} booking:`, error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Become a Marketplace Professional</h1>
        <p className="text-gray-600 mb-8">
          Join our network of verified educational psychologists and therapists.
        </p>
        <Button onClick={() => router.push('/marketplace/register')}>
          Create Professional Profile
        </Button>
      </div>
    );
  }

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const totalEarnings = bookings
    .filter(b => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.professional_earnings, 0);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Professional Dashboard</h1>
          <p className="text-gray-600">Welcome back, {profile.user.name}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/marketplace/profile/edit')}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
          <Button variant="outline" onClick={() => router.push(`/marketplace/professionals/${profile.id}`)}>
            <Eye className="w-4 h-4 mr-2" />
            View Public Profile
          </Button>
        </div>
      </div>

      {/* Status Alerts */}
      {profile.verification_status === 'PENDING' && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            <strong>Profile Verification Pending:</strong> Your profile is being reviewed. 
            You cannot accept bookings until verified. Upload DBS and insurance certificates to speed up the process.
          </AlertDescription>
        </Alert>
      )}

      {profile.la_panel_status === 'APPLIED' && (
        <Alert className="mb-6">
          <Clock className="w-4 h-4" />
          <AlertDescription>
            <strong>LA Panel Application Under Review:</strong> Your application is being reviewed. 
            Expect a decision within 5-7 working days.
          </AlertDescription>
        </Alert>
      )}

      {profile.la_panel_status === 'APPROVED' && (
        <Alert className="mb-6 border-purple-200 bg-purple-50">
          <Award className="w-4 h-4 text-purple-600" />
          <AlertDescription className="text-purple-900">
            <strong>🎉 Congratulations!</strong> You are an approved LA Panel member. 
            You now have higher visibility to Local Authorities and earn 18% commission.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              £{totalEarnings.toFixed(2)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {bookings.filter(b => b.status === 'COMPLETED').length} completed bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {pendingBookings.length}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Action required
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Rating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-yellow-600">
                {profile.average_rating ? profile.average_rating.toFixed(1) : '-'}
              </span>
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {profile.total_reviews} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Booking Status</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant={profile.is_accepting_bookings ? 'default' : 'outline'}
              onClick={toggleAcceptingBookings}
              className="w-full"
            >
              {profile.is_accepting_bookings ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accepting Bookings
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Not Accepting
                </>
              )}
            </Button>
            <p className="text-sm text-gray-500 mt-2 text-center">
              {profile.panel_membership_tier} - {profile.commission_rate}% commission
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Bookings, Reviews, LA Panel */}
      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bookings">
            Bookings {pendingBookings.length > 0 && (
              <Badge className="ml-2" variant="destructive">{pendingBookings.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({profile.total_reviews})</TabsTrigger>
          <TabsTrigger value="la-panel">LA Panel</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No bookings yet</p>
                <p className="text-sm text-gray-400">
                  Make sure your profile is complete and you're accepting bookings to start receiving requests.
                </p>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {booking.booking_type.replace('_', ' ')}
                        {booking.student && ` - ${booking.student.first_name} ${booking.student.last_name}`}
                      </CardTitle>
                      <CardDescription>
                        {new Date(booking.booking_date).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          booking.status === 'PENDING' ? 'default' :
                          booking.status === 'CONFIRMED' ? 'secondary' :
                          booking.status === 'COMPLETED' ? 'default' :
                          'destructive'
                        }
                      >
                        {booking.status}
                      </Badge>
                      <div className="text-lg font-bold mt-2">
                        £{booking.professional_earnings.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <p>Client: {booking.client.name} ({booking.client.role})</p>
                      <p>Total: £{booking.total_amount.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      {booking.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleBookingAction(booking.id, 'accept')}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const reason = prompt('Reason for declining?');
                              if (reason) {
                                fetch(`/api/marketplace/bookings/${booking.id}/cancel`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ action: 'cancel', cancellation_reason: reason }),
                                }).then(() => fetchDashboardData());
                              }
                            }}
                          >
                            Decline
                          </Button>
                        </>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          onClick={() => handleBookingAction(booking.id, 'start')}
                        >
                          Start
                        </Button>
                      )}
                      {booking.status === 'IN_PROGRESS' && (
                        <Button
                          size="sm"
                          onClick={() => handleBookingAction(booking.id, 'complete')}
                        >
                          Mark Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/marketplace/bookings/${booking.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardContent className="py-12 text-center">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Reviews will appear here after clients submit them</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="la-panel">
          <Card>
            <CardHeader>
              <CardTitle>LA Framework Panel</CardTitle>
              <CardDescription>
                Join the LA Panel for higher visibility and direct access to Local Authority contracts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile.la_panel_status === 'NOT_APPLIED' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">Benefits of LA Panel Membership:</h3>
                    <ul className="list-disc list-inside text-sm text-purple-800 space-y-1">
                      <li>18% commission (vs 15% basic tier)</li>
                      <li>Higher visibility to Local Authorities</li>
                      <li>Pre-approved professional status</li>
                      <li>Single framework agreement (LAs avoid individual contracts)</li>
                      <li>Quality assurance badge on your profile</li>
                      <li>Priority in LA search results</li>
                    </ul>
                  </div>

                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Requirements:</strong> Enhanced DBS, Professional Indemnity Insurance (£6M+), 
                      HCPC Registration, Qualifications, 2+ Professional References, Current CV
                    </AlertDescription>
                  </Alert>

                  <Button onClick={() => router.push('/marketplace/la-panel/apply')}>
                    <Award className="w-4 h-4 mr-2" />
                    Apply to LA Panel
                  </Button>
                </div>
              )}

              {profile.la_panel_status === 'APPLIED' && (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Application Under Review</h3>
                  <p className="text-gray-600 mb-4">
                    Your LA Panel application is being reviewed by our team. 
                    Expect a decision within 5-7 working days.
                  </p>
                  <p className="text-sm text-gray-500">
                    We'll contact your references and verify all credentials.
                  </p>
                </div>
              )}

              {profile.la_panel_status === 'APPROVED' && (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">🎉 LA Panel Member</h3>
                  <p className="text-gray-600 mb-4">
                    You are an approved LA Panel member with enhanced visibility and 18% commission rate.
                  </p>
                  <Badge variant="secondary" className="text-lg py-2 px-4">
                    Annual Fee: £99/year
                  </Badge>
                </div>
              )}

              {profile.la_panel_status === 'REJECTED' && (
                <div className="text-center py-8">
                  <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Application Not Approved</h3>
                  <p className="text-gray-600 mb-4">
                    Unfortunately, your LA Panel application was not approved at this time.
                  </p>
                  <Button variant="outline" onClick={() => router.push('/support')}>
                    Contact Support
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
