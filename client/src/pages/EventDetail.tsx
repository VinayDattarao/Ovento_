import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrencyINR } from '@/lib/utils';
import { RegistrationWizard } from '@/components/RegistrationWizard';
import { TeamFormation } from '@/components/TeamFormation';
import { Event } from '@/types';
import { 
  Calendar, MapPin, Users, Trophy, Clock, Globe, ArrowLeft, 
  Share2, Bookmark, Heart, MessageSquare, UserPlus, Download, 
  CheckCircle, AlertCircle, Info 
} from 'lucide-react';
import { Link } from 'wouter';

export default function EventDetail() {
  const [match, params] = useRoute('/event/:id');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const eventId = params?.id;
  const [showRegistrationWizard, setShowRegistrationWizard] = useState(false);

  const { data: event, isLoading } = useQuery<Event>({
    queryKey: ['/api/events', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) throw new Error('Event not found');
      return response.json();
    },
    enabled: !!eventId,
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['/api/events', eventId, 'registrations'],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/registrations`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!eventId && event?.organizerId === user?.id,
  });

  // Separate query to check if current user is registered (works for all users)
  const { data: userRegistration } = useQuery({
    queryKey: ['/api/events', eventId, 'user-registration'],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/registration-status`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!eventId && !!user,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['/api/events', eventId, 'teams'],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/teams`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!eventId,
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error('Registration failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Registration Successful!",
        description: "You have been registered for this event.",
      });
    },
    onError: () => {
      toast({
        title: "Registration Failed",
        description: "Failed to register for the event. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 flex items-center justify-center">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist.</p>
            <Link href="/events">
              <Button>Browse Events</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOrganizer = event.organizerId === user?.id;
  // Fix registration state logic - use userRegistration for all users, fallback to registrations for organizers
  const isRegistered = userRegistration?.isRegistered || (isOrganizer && registrations.some((reg: any) => reg.userId === user?.id));
  const registrationCount = registrations.length;
  const spotsRemaining = event.maxParticipants ? event.maxParticipants - registrationCount : null;

  const handleRegistrationClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register for this event.",
        variant: "destructive",
      });
      return;
    }
    setShowRegistrationWizard(true);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'hackathon': return '💻';
      case 'workshop': return '🛠️';
      case 'conference': return '🎤';
      case 'quiz': return '🏆';
      default: return '📅';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-red-500 text-white">🔴 LIVE NOW</Badge>;
      case 'published':
        return <Badge className="bg-green-500 text-white">📅 UPCOMING</Badge>;
      case 'registration_open':
        return <Badge className="bg-blue-500 text-white">✅ REGISTRATION OPEN</Badge>;
      case 'completed':
        return <Badge variant="secondary">✅ COMPLETED</Badge>;
      default:
        return <Badge variant="outline">{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/events">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Events
              </Button>
            </Link>
          </div>

          {/* Event Header */}
          <div className="mb-8">
            <Card className="glass-card">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Event Visual */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
                      <div className="text-6xl">{getEventIcon(event.type)}</div>
                    </div>
                  </div>
                  
                  {/* Event Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      {getStatusBadge(event.status)}
                      <Badge variant="secondary" className="capitalize">{event.type}</Badge>
                      {event.isVirtual && <Badge variant="outline">🌐 Virtual</Badge>}
                      {event.allowTeams && <Badge variant="outline">👥 Team Event</Badge>}
                    </div>
                    
                    <h1 className="text-4xl font-bold leading-tight">{event.title}</h1>
                    
                    {event.description && (
                      <p className="text-lg text-muted-foreground">{event.description}</p>
                    )}
                    
                    {/* Event Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">Start Date</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(event.startDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-accent" />
                        <div>
                          <div className="font-medium">Duration</div>
                          <div className="text-sm text-muted-foreground">
                            {Math.ceil((new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-chart-3" />
                        <div>
                          <div className="font-medium">Participants</div>
                          <div className="text-sm text-muted-foreground">
                            {registrationCount}{event.maxParticipants ? ` / ${event.maxParticipants}` : ''}
                          </div>
                        </div>
                      </div>
                      
                      {event.prizePool && parseFloat(event.prizePool) > 0 && (
                        <div className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-chart-5" />
                          <div>
                            <div className="font-medium">Prize Pool</div>
                            <div className="text-sm text-muted-foreground">{event.prizePool ? formatCurrencyINR(parseFloat(event.prizePool)) : '₹0'}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 min-w-[200px]">
                    {event.status === 'live' ? (
                      <Button size="lg" className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                        <div className="w-2 h-2 bg-white rounded-full mr-2 live-indicator"></div>
                        Join Live Event
                      </Button>
                    ) : event.status === 'published' || event.status === 'registration_open' ? (
                      <>
                        {isRegistered ? (
                          <Button size="lg" disabled className="bg-green-500">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Registered
                          </Button>
                        ) : (
                          <Button 
                            size="lg" 
                            onClick={handleRegistrationClick}
                            className="bg-primary"
                          >
                            {event.registrationFee && parseFloat(event.registrationFee) > 0 ? (
                              <>Register - {event.registrationFee ? formatCurrencyINR(parseFloat(event.registrationFee)) : 'Free'}</>
                            ) : (
                              <>Register Free</>
                            )}
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button size="lg" disabled variant="outline">
                        Registration Closed
                      </Button>
                    )}
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Bookmark className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    </div>
                    
                    {spotsRemaining !== null && spotsRemaining <= 10 && spotsRemaining > 0 && (
                      <div className="bg-orange-500/10 text-orange-500 text-sm p-2 rounded-lg text-center">
                        ⚡ Only {spotsRemaining} spots left!
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="teams">Teams ({teams.length})</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              {isOrganizer && <TabsTrigger value="manage">Manage</TabsTrigger>}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Description */}
                  <Card>
                    <CardHeader>
                      <CardTitle>About This Event</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">
                        {event.description || "No description provided for this event."}
                      </p>
                    </CardContent>
                  </Card>
                  
                  {/* Requirements */}
                  {event.requirements && event.requirements.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Info className="w-5 h-5" />
                          Requirements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {event.requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                <div className="space-y-6">
                  {/* Event Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Event Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{event.location || 'Virtual Event'}</span>
                      </div>
                      
                      {event.maxTeamSize && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>Max team size: {event.maxTeamSize}</span>
                        </div>
                      )}
                      
                      {event.registrationFee && parseFloat(event.registrationFee) > 0 ? (
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-muted-foreground" />
                          <span>Registration: ${event.registrationFee}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Free Event</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Tags */}
                  {event.tags && event.tags.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Tags</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {event.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Organizer */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Organizer</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>OR</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">Event Organizer</div>
                          <div className="text-sm text-muted-foreground">Verified organizer</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Schedule</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Registration Opens:</span>
                          <span>{new Date(event.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Event Starts:</span>
                          <span>{new Date(event.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Event Ends:</span>
                          <span>{new Date(event.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Participation</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Registered:</span>
                          <span>{registrationCount} participants</span>
                        </div>
                        {event.maxParticipants && (
                          <div className="flex justify-between">
                            <span>Max Capacity:</span>
                            <span>{event.maxParticipants}</span>
                          </div>
                        )}
                        {event.allowTeams && (
                          <div className="flex justify-between">
                            <span>Teams Formed:</span>
                            <span>{teams.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teams" className="space-y-6">
              <TeamFormation event={event} />
            </TabsContent>

            <TabsContent value="chat" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Event Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Event chat will be available once you register for this event.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {isOrganizer && (
              <TabsContent value="manage" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-primary">{registrationCount}</div>
                      <div className="text-sm text-muted-foreground">Total Registrations</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-accent">{teams.length}</div>
                      <div className="text-sm text-muted-foreground">Teams Formed</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-chart-3">
                        {spotsRemaining || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Spots Remaining</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex gap-4">
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Export Registrations
                  </Button>
                  <Button variant="outline">
                    Send Announcement
                  </Button>
                  <Button variant="outline">
                    Edit Event
                  </Button>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* Registration Wizard Modal */}
      <Dialog open={showRegistrationWizard} onOpenChange={setShowRegistrationWizard}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-auto p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Register for {event.title}</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-0">
            <RegistrationWizard 
              event={event}
              onComplete={() => {
                setShowRegistrationWizard(false);
                queryClient.invalidateQueries({ queryKey: ['/api/events'] });
                queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'user-registration'] });
              }}
              onCancel={() => setShowRegistrationWizard(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}