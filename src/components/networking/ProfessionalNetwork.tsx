/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Professional {
  id: string;
  name: string;
  title: string;
  organization: string;
  specialty: string;
  location: string;
  connectionStatus: 'connected' | 'pending' | 'none';
  profileImage?: string;
  endorsements?: number;
  mutualConnections?: number;
}

interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isJoined: boolean;
  category: string;
  topics: string[];
  lastActivity: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  isVirtual: boolean;
  organizerId: string;
  organizerName: string;
  attendeeCount: number;
  isAttending: boolean;
  category: string;
  tags: string[];
}

const ProfessionalNetwork: React.FC = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        setLoading(true);

        // In a real implementation, these would be API calls
        // Demo data for demonstration purposes - real professionals will be populated from database
        // Note: All entries marked with [Demo] are placeholders for beta testing
        const mockProfessionals: Professional[] = [
          {
            id: 'prof-1',
            name: 'Dr Scott I-Patrick D.Ed.Psych CPsychol',
            title: 'Founder & Managing Director',
            organization: 'EdPsych Connect Limited',
            specialty: 'Restorative Justice, SEMH, Autism',
            location: 'Buckinghamshire, UK',
            connectionStatus: 'connected',
            profileImage: '/images/dr-scott-marketplace.jpg',
            endorsements: 127,
            mutualConnections: 15
          },
          {
            id: 'prof-2',
            name: '[Demo] EP Profile - Birmingham',
            title: 'Educational Psychologist',
            organization: '[Demo Organisation]',
            specialty: 'Early Intervention',
            location: 'Birmingham, UK',
            connectionStatus: 'pending',
            profileImage: '', // Uses initials fallback
            endorsements: 0,
            mutualConnections: 0
          },
          {
            id: 'prof-3',
            name: '[Demo] EP Profile - Oxford',
            title: 'Researcher',
            organization: '[Demo Organisation]',
            specialty: 'Learning Disabilities',
            location: 'Oxford, UK',
            connectionStatus: 'none',
            profileImage: '', // Uses initials fallback
            endorsements: 0,
            mutualConnections: 0
          },
          {
            id: 'prof-4',
            name: '[Demo] EP Profile - Manchester',
            title: 'Researcher',
            organization: '[Demo Organisation]',
            specialty: 'Educational Interventions',
            location: 'Manchester, UK',
            connectionStatus: 'connected',
            profileImage: '', // Uses initials fallback
            endorsements: 0,
            mutualConnections: 0
          },
          {
            id: 'prof-5',
            name: '[Demo] EP Profile - Edinburgh',
            title: 'Educational Psychologist',
            organization: '[Demo Organisation]',
            specialty: 'Autism',
            location: 'Edinburgh, UK',
            connectionStatus: 'none',
            profileImage: '', // Uses initials fallback
            endorsements: 0,
            mutualConnections: 0
          },
        ];
        
        const mockGroups: Group[] = [
          {
            id: 'group-1',
            name: 'UK Educational Psychologists',
            description: 'A community for educational psychologists in the UK to share ideas and resources.',
            memberCount: 245,
            isJoined: true,
            category: 'Professional',
            topics: ['Education', 'Psychology', 'UK Practice'],
            lastActivity: '2 hours ago'
          },
          {
            id: 'group-2',
            name: 'Dyslexia Research & Interventions',
            description: 'Discussion and sharing of the latest research and interventions for dyslexia.',
            memberCount: 178,
            isJoined: true,
            category: 'Research',
            topics: ['Dyslexia', 'Reading', 'Interventions'],
            lastActivity: '1 day ago'
          },
          {
            id: 'group-3',
            name: 'Early Years Assessment',
            description: 'Focused on assessment strategies for early years education.',
            memberCount: 132,
            isJoined: false,
            category: 'Assessment',
            topics: ['Early Years', 'Assessment', 'Development'],
            lastActivity: '3 days ago'
          },
          {
            id: 'group-4',
            name: 'EP Technology Innovation',
            description: 'Exploring technological innovations in educational psychology practice.',
            memberCount: 87,
            isJoined: false,
            category: 'Technology',
            topics: ['EdTech', 'Digital Assessment', 'Innovation'],
            lastActivity: '5 days ago'
          },
        ];
        
        const mockMessages: Message[] = [
          {
            id: 'msg-1',
            senderId: 'prof-1',
            senderName: 'Dr Scott I-Patrick',
            senderImage: '/images/dr-scott-marketplace.jpg',
            content: 'Welcome to EdPsych Connect! I saw your interest in our platform. Would love to discuss how we can support your practice.',
            timestamp: '2 hours ago',
            isRead: false
          },
          {
            id: 'msg-2',
            senderId: 'prof-4',
            senderName: '[Demo] EP Profile',
            senderImage: '', // Uses initials fallback
            content: "[Demo Message] This is an example of how messages appear between professionals.",
            timestamp: '1 day ago',
            isRead: true
          },
          {
            id: 'msg-3',
            senderId: 'group-1',
            senderName: 'UK Educational Psychologists',
            content: 'New discussion: "Changes to HCPC registration requirements" has 15 new replies',
            timestamp: '2 days ago',
            isRead: true
          },
        ];
        
        const mockEvents: Event[] = [
          {
            id: 'event-1',
            title: 'Annual UK Educational Psychology Conference',
            description: 'The largest gathering of educational psychologists in the UK',
            startDate: '2025-11-15T09:00:00',
            endDate: '2025-11-17T17:00:00',
            location: 'London Convention Centre',
            isVirtual: false,
            organizerId: 'org-1',
            organizerName: 'British Psychological Society',
            attendeeCount: 450,
            isAttending: true,
            category: 'Conference',
            tags: ['Professional Development', 'Networking', 'Research']
          },
          {
            id: 'event-2',
            title: 'Webinar: Latest Developments in ADHD Interventions',
            description: 'Learn about the most recent evidence-based interventions for ADHD',
            startDate: '2025-10-05T14:00:00',
            endDate: '2025-10-05T16:00:00',
            location: 'Online',
            isVirtual: true,
            organizerId: 'org-2',
            organizerName: 'ADHD Research Network',
            attendeeCount: 230,
            isAttending: false,
            category: 'Webinar',
            tags: ['ADHD', 'Interventions', 'Professional Development']
          },
          {
            id: 'event-3',
            title: 'Workshop: Trauma-Informed Assessment Techniques',
            description: 'Practical workshop on implementing trauma-informed approaches in educational assessments',
            startDate: '2025-10-20T09:30:00',
            endDate: '2025-10-20T16:30:00',
            location: 'Manchester University',
            isVirtual: false,
            organizerId: 'prof-4',
            organizerName: 'EdPsych Connect Training Team',
            attendeeCount: 75,
            isAttending: false,
            category: 'Workshop',
            tags: ['Trauma', 'Assessment', 'Practical Skills']
          },
        ];

        setProfessionals(mockProfessionals);
        setGroups(mockGroups);
        setMessages(mockMessages);
        setEvents(mockEvents);
      } catch (err: any) {
        console.error('Error fetching network data:', err);
        setError(err.message || 'Failed to load networking data');
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkData();
  }, []);

  const filteredProfessionals = professionals.filter(prof => {
    const matchesSearch = searchQuery === '' || 
      prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = selectedSpecialties.length === 0 || 
      selectedSpecialties.includes(prof.specialty);
    
    return matchesSearch && matchesSpecialty;
  });

  const handleConnect = (id: string) => {
    setProfessionals(prevProfessionals => 
      prevProfessionals.map(prof => 
        prof.id === id 
          ? { ...prof, connectionStatus: 'pending' } 
          : prof
      )
    );
  };

  const handleJoinGroup = (id: string) => {
    setGroups(prevGroups => 
      prevGroups.map(group => 
        group.id === id 
          ? { ...group, isJoined: true, memberCount: group.memberCount + 1 } 
          : group
      )
    );
  };

  const handleAttendEvent = (id: string) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === id 
          ? { ...event, isAttending: true, attendeeCount: event.attendeeCount + 1 } 
          : event
      )
    );
  };

  const handleReadMessage = (id: string) => {
    setMessages(prevMessages => 
      prevMessages.map(message => 
        message.id === id 
          ? { ...message, isRead: true } 
          : message
      )
    );
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-700">Error Loading Network Data</h3>
        <p className="text-red-600">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Tab labels
  const tabLabels = ['Professionals', 'Groups', 'Messages', 'Events'];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Professional Network</h1>
        <p className="text-gray-600">Connect with other educational psychology professionals, join communities, and discover events.</p>
      </div>

      {/* Custom Tab Navigation */}
      <div className="flex p-1 space-x-1 bg-blue-100 rounded-xl mb-6">
        {tabLabels.map((label, idx) => (
          <button
            key={idx}
            className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg
              ${activeTab === idx 
                ? 'bg-white text-blue-700 shadow'
                : 'text-blue-500 hover:bg-blue-200 hover:text-blue-700'
              }`}
            onClick={() => setActiveTab(idx)}
          >
            {label}
          </button>
        ))}
      </div>
        
      {/* Tab Content */}
      <div>
        {/* Professionals Panel */}
        {activeTab === 0 && (
          <div>
            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-2/3">
                  <input
                    type="text"
                    placeholder="Search by name, organization, or specialty"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-1/3">
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedSpecialties.length === 1 ? selectedSpecialties[0] : ''}
                    aria-label="Filter by specialty"
                    onChange={(e) => {
                      if (e.target.value === '') {
                        setSelectedSpecialties([]);
                      } else {
                        setSelectedSpecialties([e.target.value]);
                      }
                    }}
                  >
                    <option value="">All Specialties</option>
                    <option value="Cognitive Assessment">Cognitive Assessment</option>
                    <option value="Early Intervention">Early Intervention</option>
                    <option value="Learning Disabilities">Learning Disabilities</option>
                    <option value="Educational Interventions">Educational Interventions</option>
                    <option value="Autism">Autism</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfessionals.map((professional) => (
                <div key={professional.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden mr-3">
                      {professional.profileImage ? (
                        <Image 
                          src={professional.profileImage} 
                          alt={professional.name} 
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                          {professional.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{professional.name}</h3>
                      <p className="text-sm text-gray-600">{professional.title}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center mb-1">
                      <svg className="w-4 h-4 text-gray-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A1 1 0 0011.172 2H8.828a1 1 0 00-.707.293L7 3.414A1 1 0 016.293 4H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600">{professional.organization}</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <svg className="w-4 h-4 text-gray-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600">{professional.location}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600">{professional.specialty}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{professional.endorsements} Endorsements</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 text-blue-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      <span>{professional.mutualConnections} Mutual</span>
                    </div>
                  </div>
                  
                  {professional.connectionStatus === 'none' && (
                    <button
                      className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      onClick={() => handleConnect(professional.id)}
                    >
                      Connect
                    </button>
                  )}
                  
                  {professional.connectionStatus === 'pending' && (
                    <button
                      className="w-full py-2 bg-gray-200 text-gray-700 rounded-md cursor-default"
                    >
                      Connection Pending
                    </button>
                  )}
                  
                  {professional.connectionStatus === 'connected' && (
                    <button
                      className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Message
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {filteredProfessionals.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">No professionals match your search criteria.</p>
                <button
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSpecialties([]);
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Groups Panel */}
        {activeTab === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((group) => (
              <div key={group.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="mb-3">
                  <h3 className="font-semibold text-lg">{group.name}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 text-gray-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span>{group.memberCount} members</span>
                    <span className="mx-2">•</span>
                    <span>Last active: {group.lastActivity}</span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">
                  {group.description}
                </p>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-1">Category: {group.category}</div>
                  <div className="flex flex-wrap gap-1">
                    {group.topics.map((topic, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                
                {!group.isJoined ? (
                  <button
                    className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={() => handleJoinGroup(group.id)}
                  >
                    Join Group
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      className="w-1/2 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      View Discussions
                    </button>
                    <button
                      className="w-1/2 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                    >
                      Invite Colleagues
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Messages Panel */}
        {activeTab === 2 && (
          <div>
            <div className="border rounded-lg divide-y">
              {messages.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No messages in your inbox.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`p-4 hover:bg-gray-50 transition-colors ${!message.isRead ? 'bg-blue-50' : ''}`}
                    onClick={() => handleReadMessage(message.id)}
                  >
                    <div className="flex items-start">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                        {message.senderImage ? (
                          <Image 
                            src={message.senderImage} 
                            alt={message.senderName} 
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">
                            {message.senderName.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between mb-1">
                          <h3 className={`font-semibold ${!message.isRead ? 'text-blue-800' : ''}`}>
                            {message.senderName}
                          </h3>
                          <span className="text-xs text-gray-500">{message.timestamp}</span>
                        </div>
                        <p className={`text-sm ${!message.isRead ? 'font-medium' : 'text-gray-700'}`}>
                          {message.content}
                        </p>
                      </div>
                      {!message.isRead && (
                        <div className="w-3 h-3 bg-blue-600 rounded-full ml-2 flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-4 text-right">
              <button className="text-blue-600 hover:text-blue-800">
                Compose New Message
              </button>
            </div>
          </div>
        )}
        
        {/* Events Panel */}
        {activeTab === 3 && (
          <div>
            <div className="mb-6 flex justify-end">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button 
                  type="button" 
                  className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-l-lg text-blue-700 hover:bg-gray-100"
                >
                  Upcoming
                </button>
                <button 
                  type="button" 
                  className="px-4 py-2 text-sm font-medium bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-100"
                >
                  Past
                </button>
                <button 
                  type="button" 
                  className="px-4 py-2 text-sm font-medium bg-gray-100 border border-gray-200 rounded-r-md text-gray-700 hover:bg-gray-100"
                >
                  My Events
                </button>
              </div>
            </div>
          
            <div className="space-y-6">
              {events.map((event) => {
                // Parse dates for formatting
                const startDate = new Date(event.startDate);
                const endDate = new Date(event.endDate);
                
                // Format for display
                const dateOptions: Intl.DateTimeFormatOptions = { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                };
                const timeOptions: Intl.DateTimeFormatOptions = { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                };
                
                const formattedDate = startDate.toLocaleDateString('en-GB', dateOptions);
                const formattedStartTime = startDate.toLocaleTimeString('en-GB', timeOptions);
                const formattedEndTime = endDate.toLocaleTimeString('en-GB', timeOptions);
                
                return (
                  <div key={event.id} className="border rounded-lg overflow-hidden">
                    <div className="bg-blue-600 text-white p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{event.title}</h3>
                          <p className="text-blue-100">Organised by {event.organizerName}</p>
                        </div>
                        <div className="bg-white text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                          {event.category}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="mb-4">
                        <p className="text-gray-700">{event.description}</p>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">{formattedDate}</span>
                        </div>
                        
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formattedStartTime} - {formattedEndTime}</span>
                        </div>
                        
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>
                            {event.location}
                            {event.isVirtual && <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Virtual</span>}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>{event.attendeeCount} attendees</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {event.tags.map((tag, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      {!event.isAttending ? (
                        <button
                          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          onClick={() => handleAttendEvent(event.id)}
                        >
                          Attend This Event
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Add to Calendar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 text-center">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Create New Event
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalNetwork;
