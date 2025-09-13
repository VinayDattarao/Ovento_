import { useState } from 'react';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Trophy, 
  Download, 
  Share2, 
  QrCode,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Eye
} from 'lucide-react';

interface RegisteredEvent {
  id: string;
  title: string;
  type: 'hackathon' | 'workshop' | 'conference' | 'quiz';
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  registrationStatus: 'confirmed' | 'pending' | 'cancelled' | 'waitlist';
  startDate: string;
  endDate: string;
  location?: string;
  isVirtual: boolean;
  registrationFee: number;
  amountPaid: number;
  registeredAt: string;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  qrCode: string;
  registrationId: string;
  certificateUrl?: string;
  teamId?: string;
  teamName?: string;
  placement?: number;
  prizeAmount?: number;
}

export default function EventHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  // Hardcoded registered events data
  const registeredEvents: RegisteredEvent[] = [
    {
      id: 'event-1',
      title: 'AI Innovation Summit 2024',
      type: 'conference',
      status: 'completed',
      registrationStatus: 'confirmed',
      startDate: '2024-01-15T09:00:00Z',
      endDate: '2024-01-17T18:00:00Z',
      location: 'San Francisco Convention Center',
      isVirtual: false,
      registrationFee: 299,
      amountPaid: 299,
      registeredAt: '2023-12-01T10:30:00Z',
      paymentStatus: 'paid',
      qrCode: 'QR-AI2024-USER789',
      registrationId: 'REG-AI2024-USER789',
      certificateUrl: '/certificates/ai-summit-2024.pdf',
      placement: 2,
      prizeAmount: 5000,
    },
    {
      id: 'event-2',
      title: 'React Advanced Workshop',
      type: 'workshop',
      status: 'upcoming',
      registrationStatus: 'confirmed',
      startDate: '2024-02-20T14:00:00Z',
      endDate: '2024-02-20T18:00:00Z',
      isVirtual: true,
      registrationFee: 149,
      amountPaid: 149,
      registeredAt: '2024-01-10T15:45:00Z',
      paymentStatus: 'paid',
      qrCode: 'QR-REACT-USER456',
      registrationId: 'REG-REACT-USER456',
    },
    {
      id: 'event-3',
      title: 'Global Hackathon 2024',
      type: 'hackathon',
      status: 'live',
      registrationStatus: 'confirmed',
      startDate: '2024-02-01T09:00:00Z',
      endDate: '2024-02-03T18:00:00Z',
      isVirtual: true,
      registrationFee: 0,
      amountPaid: 0,
      registeredAt: '2024-01-05T12:20:00Z',
      paymentStatus: 'paid',
      qrCode: 'QR-HACK-USER123',
      registrationId: 'REG-HACK-USER123',
      teamId: 'team-alpha',
      teamName: 'Team Alpha Innovators',
    },
    {
      id: 'event-4',
      title: 'JavaScript Quiz Championship',
      type: 'quiz',
      status: 'upcoming',
      registrationStatus: 'waitlist',
      startDate: '2024-03-10T16:00:00Z',
      endDate: '2024-03-10T18:00:00Z',
      isVirtual: true,
      registrationFee: 25,
      amountPaid: 0,
      registeredAt: '2024-02-01T09:15:00Z',
      paymentStatus: 'pending',
      qrCode: 'QR-QUIZ-WAIT789',
      registrationId: 'REG-QUIZ-WAIT789',
    },
    {
      id: 'event-5',
      title: 'UX Design Bootcamp',
      type: 'workshop',
      status: 'completed',
      registrationStatus: 'confirmed',
      startDate: '2023-12-05T09:00:00Z',
      endDate: '2023-12-07T17:00:00Z',
      location: 'Design Studio NYC',
      isVirtual: false,
      registrationFee: 499,
      amountPaid: 499,
      registeredAt: '2023-11-01T11:30:00Z',
      paymentStatus: 'paid',
      qrCode: 'QR-UX-USER345',
      registrationId: 'REG-UX-USER345',
      certificateUrl: '/certificates/ux-bootcamp-2023.pdf',
    }
  ];

  const filteredEvents = registeredEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesType = typeFilter === 'all' || event.type === typeFilter;
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'upcoming' && event.status === 'upcoming') ||
      (activeTab === 'completed' && event.status === 'completed') ||
      (activeTab === 'live' && event.status === 'live');
    
    return matchesSearch && matchesStatus && matchesType && matchesTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-chart-4 bg-chart-4/10 border-chart-4';
      case 'pending': return 'text-orange-500 bg-orange-500/10 border-orange-500';
      case 'cancelled': return 'text-destructive bg-destructive/10 border-destructive';
      case 'waitlist': return 'text-blue-500 bg-blue-500/10 border-blue-500';
      default: return 'text-muted-foreground bg-muted border-muted';
    }
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'text-red-500 bg-red-500/10 border-red-500';
      case 'upcoming': return 'text-blue-500 bg-blue-500/10 border-blue-500';
      case 'completed': return 'text-chart-4 bg-chart-4/10 border-chart-4';
      case 'cancelled': return 'text-destructive bg-destructive/10 border-destructive';
      default: return 'text-muted-foreground bg-muted border-muted';
    }
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

  const generateQRCodeUrl = (qrCode: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`;
  };

  const downloadQRCode = (event: RegisteredEvent) => {
    const link = document.createElement('a');
    link.href = generateQRCodeUrl(event.qrCode);
    link.download = `qr-code-${event.registrationId}.png`;
    link.click();
    
    toast({
      title: "QR Code Downloaded",
      description: `QR code for ${event.title} has been downloaded.`,
    });
  };

  const shareEvent = (event: RegisteredEvent) => {
    navigator.clipboard.writeText(`I'm registered for ${event.title}! Registration ID: ${event.registrationId}`);
    toast({
      title: "Event Shared",
      description: "Event details copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              My <span className="gradient-text">Event History</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Track your registered events, view certificates, and manage your event participation
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary mb-1">{registeredEvents.length}</div>
                <div className="text-sm text-muted-foreground">Total Events</div>
              </CardContent>
            </Card>
            <Card className="glass-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-chart-4 mb-1">
                  {registeredEvents.filter(e => e.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            <Card className="glass-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-500 mb-1">
                  {registeredEvents.filter(e => e.status === 'upcoming').length}
                </div>
                <div className="text-sm text-muted-foreground">Upcoming</div>
              </CardContent>
            </Card>
            <Card className="glass-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-accent mb-1">
                  ${registeredEvents.reduce((sum, e) => sum + e.amountPaid, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Spent</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="glass-card mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Event Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="hackathon">Hackathons</SelectItem>
                    <SelectItem value="workshop">Workshops</SelectItem>
                    <SelectItem value="conference">Conferences</SelectItem>
                    <SelectItem value="quiz">Quizzes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Event Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 glass-card">
              <TabsTrigger value="all">All Events ({registeredEvents.length})</TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming ({registeredEvents.filter(e => e.status === 'upcoming').length})
              </TabsTrigger>
              <TabsTrigger value="live">
                Live ({registeredEvents.filter(e => e.status === 'live').length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({registeredEvents.filter(e => e.status === 'completed').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6">
              {filteredEvents.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="p-8 text-center">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                        ? 'Try adjusting your search or filters.'
                        : 'You haven\'t registered for any events yet.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {filteredEvents.map((event) => (
                    <Card key={event.id} className="glass-card hover-lift">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Event Info */}
                          <div className="flex-1">
                            <div className="flex items-start gap-4 mb-4">
                              <div className="text-4xl">{getEventIcon(event.type)}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-bold">{event.title}</h3>
                                  <Badge variant="outline" className="capitalize">
                                    {event.type}
                                  </Badge>
                                  <Badge className={getEventStatusColor(event.status)}>
                                    {event.status.toUpperCase()}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-2 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                      {new Date(event.startDate).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>
                                  
                                  {event.location && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="w-4 h-4" />
                                      <span>{event.location}</span>
                                      {event.isVirtual && (
                                        <Badge variant="outline" className="text-xs">Virtual</Badge>
                                      )}
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                      Registered on {new Date(event.registeredAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Registration Details */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="text-center p-3 bg-secondary/30 rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">Registration</div>
                                <Badge className={getStatusColor(event.registrationStatus)}>
                                  {event.registrationStatus}
                                </Badge>
                              </div>
                              
                              <div className="text-center p-3 bg-secondary/30 rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">Payment</div>
                                <div className="flex items-center justify-center gap-1">
                                  {event.paymentStatus === 'paid' && <CheckCircle className="w-4 h-4 text-chart-4" />}
                                  {event.paymentStatus === 'pending' && <AlertCircle className="w-4 h-4 text-orange-500" />}
                                  {event.paymentStatus === 'failed' && <XCircle className="w-4 h-4 text-destructive" />}
                                  <span className="font-medium">${event.amountPaid}</span>
                                </div>
                              </div>
                              
                              <div className="text-center p-3 bg-secondary/30 rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">Registration ID</div>
                                <div className="font-mono text-xs">{event.registrationId}</div>
                              </div>
                              
                              <div className="text-center p-3 bg-secondary/30 rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">QR Code</div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => downloadQRCode(event)}
                                >
                                  <QrCode className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Additional Info */}
                            {(event.teamName || event.placement || event.certificateUrl) && (
                              <div className="flex flex-wrap gap-4 text-sm">
                                {event.teamName && (
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-500" />
                                    <span>Team: {event.teamName}</span>
                                  </div>
                                )}
                                
                                {event.placement && (
                                  <div className="flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-chart-5" />
                                    <span>
                                      {event.placement === 1 ? '🥇' : event.placement === 2 ? '🥈' : '🥉'} 
                                      {' '}#{event.placement} Place
                                      {event.prizeAmount && ` - $${event.prizeAmount} Prize`}
                                    </span>
                                  </div>
                                )}
                                
                                {event.certificateUrl && (
                                  <Button variant="outline" size="sm" asChild>
                                    <a href={event.certificateUrl} download>
                                      <Download className="w-4 h-4 mr-2" />
                                      Certificate
                                    </a>
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* QR Code Preview */}
                          <div className="lg:w-48 flex flex-col items-center gap-3">
                            <div className="text-sm font-medium text-center">Event QR Code</div>
                            <img
                              src={generateQRCodeUrl(event.qrCode)}
                              alt={`QR Code for ${event.title}`}
                              className="w-32 h-32 border rounded-lg"
                            />
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => downloadQRCode(event)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => shareEvent(event)}
                              >
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}