'use client';

import { useAuth } from '@/lib/auth/hooks';
import { getProfessionalInquiries } from '@/actions/inquiry-queries';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Calendar, User, Search } from 'lucide-react';
import { ProfessionalInquiry } from '@prisma/client';
import { Link } from '@/navigation';
import { EmptyState } from '@/components/ui/EmptyState';

export default function InquiriesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [inquiries, setInquiries] = useState<ProfessionalInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadInquiries() {
      if (!user) return;
      try {
        // Assuming user.id corresponds to the professional_id (int)
        // Check if user.id is string or number in AuthUser type. Usually string.
        // Prisma expects number. Need to verify ID type.
        const inquiriesData = await getProfessionalInquiries(parseInt(user.id));
        setInquiries(inquiriesData);
      } catch (error) {
        console.error('Failed to load inquiries:', error);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && user) {
        loadInquiries();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading inquiries...</div>;
  }

  if (!user) {
      return <div className="p-8 text-center">Please log in to view inquiries.</div>;
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inquiries & Messages</h1>
          <p className="text-muted-foreground">Manage messages from potential clients.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {inquiries.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <EmptyState
                title="No inquiries received yet"
                description="New messages from potential clients will appear here."
                icon={<Mail className="h-8 w-8 text-blue-500" />}
              />
            </CardContent>
          </Card>
        ) : (
          inquiries.map((inquiry) => (
            <Card 
                key={inquiry.id} 
                className={`cursor-pointer transition-all duration-200 ${expandedId === inquiry.id ? 'ring-2 ring-primary border-transparent shadow-md' : 'hover:border-primary/50'}`}
                onClick={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                       <h3 className="font-semibold text-lg">{inquiry.subject}</h3>
                       {inquiry.status === 'PENDING' && <Badge variant="secondary">New</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                       <span className="flex items-center gap-1">
                         <User className="h-3 w-3" />
                         {inquiry.sender_name} ({inquiry.sender_email})
                       </span>
                       <span className="flex items-center gap-1">
                         <Calendar className="h-3 w-3" />
                         {new Date(inquiry.created_at).toLocaleDateString()}
                       </span>
                    </div>
                  </div>
                  <div className="flex items-center sticky top-0">
                    <Button variant={expandedId === inquiry.id ? "default" : "ghost"} size="sm">
                        {expandedId === inquiry.id ? 'Close' : 'View Details'}
                    </Button>
                  </div>
                </div>
                <div className={`mt-4 text-sm text-muted-foreground ${expandedId === inquiry.id ? '' : 'line-clamp-2'}`}>
                    {inquiry.message}
                </div>
                {expandedId === inquiry.id && (
                    <div className="mt-6 pt-4 border-t flex justify-end gap-2 animate-in fade-in">
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${inquiry.sender_email}?subject=Re: ${inquiry.subject}`; }}>
                            Reply via Email
                        </Button>
                    </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
