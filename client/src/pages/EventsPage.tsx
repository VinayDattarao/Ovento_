import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventCard } from '@/components/EventCard';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import { formatCurrencyINR } from '@/lib/utils';
import { Event, User } from '@/types';
import { Search, Filter, Plus, Calendar, Users, Trophy, BookOpen, Zap, TrendingUp, Star, Globe, MapPin } from 'lucide-react';
import { Link } from 'wouter';

export default function EventsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState<string>('popularity');

  // Scroll to top when page loads and check for category filter
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Check if a specific event type was selected from category navigation
    const selectedEventType = sessionStorage.getItem('selectedEventType');
    if (selectedEventType) {
      setSelectedType(selectedEventType);
      sessionStorage.removeItem('selectedEventType');
    }
  }, []);

  // Note: We now show ALL events as a marketplace, authentication is optional
  // Users can browse events without being logged in

  // Fetch ALL events - this is now a marketplace view
  const { data: allEvents = [], isLoading, error } = useQuery<Event[]>({
    queryKey: ['/api/events', selectedType, selectedStatus, selectedDifficulty, selectedLocation, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty);
      if (selectedLocation !== 'all') params.append('location', selectedLocation);
      if (sortBy) params.append('sort', sortBy);
      
      const response = await fetch(`/api/events?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
  });

  // Get recommended events for authenticated users
  const { data: recommendedEvents = [] } = useQuery<Event[]>({
    queryKey: ['/api/events/recommended'],
    queryFn: async () => {
      const response = await fetch('/api/events/recommended');
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user,
  });

  // Get popular/trending events
  const { data: trendingEvents = [] } = useQuery<Event[]>({
    queryKey: ['/api/events/trending'],
    queryFn: async () => {
      const response = await fetch('/api/events/trending');
      if (!response.ok) return [];
      return response.json();
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) {
        throw new Error('Please log in to register for events');
      }
      return apiRequest('POST', `/api/events/${eventId}/register`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Registration Successful",
        description: "You have been registered for this event!",
      });
    },
    onError: (error: any) => {
      if (error.message.includes('log in')) {
        toast({
          title: "Login Required",
          description: "Please log in to register for events.",
          variant: "destructive",
        });
        window.location.href = "/api/login";
        return;
      }
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Registration Failed",
        description: "Failed to register for event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = searchTerm === '' || 
                         event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const eventCategories = [
    { id: 'all', label: 'All Events', icon: Globe, count: allEvents.length },
    { id: 'hackathon', label: 'Hackathons', icon: '💻', count: allEvents.filter(e => e.type === 'hackathon').length },
    { id: 'workshop', label: 'Workshops', icon: '🛠️', count: allEvents.filter(e => e.type === 'workshop').length },
    { id: 'conference', label: 'Conferences', icon: '🎤', count: allEvents.filter(e => e.type === 'conference').length },
    { id: 'quiz', label: 'Quizzes', icon: '❓', count: allEvents.filter(e => e.type === 'quiz').length },
    { id: 'networking', label: 'Networking', icon: Users, count: allEvents.filter(e => e.type === 'networking').length },
  ];

  const liveEvents = allEvents.filter(e => e.status === 'live');
  const upcomingEvents = allEvents.filter(e => ['published', 'registration_open'].includes(e.status));
  const featuredEvent = upcomingEvents.find(e => e.prizePool && parseFloat(e.prizePool) > 1000);

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

  const getEventsForTab = (tabId: string) => {
    switch (tabId) {
      case 'trending':
        return trendingEvents.slice(0, 12);
      case 'recommended':
        return user ? recommendedEvents.slice(0, 12) : [];
      case 'live':
        return liveEvents;
      case 'upcoming':
        return upcomingEvents.slice(0, 12);
      default:
        return filteredEvents;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          {/* Enhanced Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
            <div>
              <h1 className="text-6xl font-bold mb-4">
                Discover <span className="gradient-text">Amazing Events</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Browse thousands of hackathons, workshops, conferences, and networking events from organizers worldwide
              </p>
              
              {/* Quick Stats */}
              <div className="flex items-center gap-6 mt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{allEvents.length}+ Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-chart-3" />
                  <span>100K+ Participants</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-chart-5" />
                  <span>₹10Cr+ Prizes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-accent" />
                  <span>Global Community</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              {user && (
                <Link href="/event-builder">
                  <Button className="bg-gradient-to-r from-secondary to-primary text-white hover:opacity-90 transition duration-300" data-testid="button-create-event">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </Link>
              )}
              {!user && (
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  Login to Create Events
                </Button>
              )}
            </div>
          </div>

          {/* Live Events Alert */}
          {liveEvents.length > 0 && (
            <div className="mb-8">
              <Card className="border-red-500/50 bg-red-500/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full live-indicator"></div>
                      <div>
                        <h3 className="font-semibold text-red-500">🔴 Live Events Now</h3>
                        <p className="text-sm text-muted-foreground">
                          {liveEvents.length} event{liveEvents.length > 1 ? 's are' : ' is'} currently live - Join now!
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-red-500 text-white hover:bg-red-600" 
                      data-testid="button-join-live"
                      onClick={() => setActiveTab('live')}
                    >
                      View Live Events
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Featured Event Banner */}
          {featuredEvent && (
            <div className="mb-12">
              <Card className="glass-card overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20"></div>
                <CardContent className="p-8 relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                      ⭐ FEATURED EVENT
                    </Badge>
                    <Badge variant="outline" className="border-primary text-primary">
                      {featuredEvent.type.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <h3 className="text-3xl font-bold mb-4">{featuredEvent.title}</h3>
                      <p className="text-muted-foreground mb-6 text-lg">
                        {featuredEvent.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>
                            {new Date(featuredEvent.startDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Trophy className="w-4 h-4 text-accent" />
                          <span className="text-sm">{featuredEvent.prizePool ? formatCurrencyINR(parseFloat(featuredEvent.prizePool)) : '₹0'} prizes</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-chart-3" />
                          <span>Open registration</span>
                        </div>
                        {featuredEvent.isVirtual && (
                          <div className="flex items-center gap-2 text-sm">
                            <Globe className="w-4 h-4 text-chart-4" />
                            <span>Virtual Event</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-3">
                        {featuredEvent.registrationFee && parseFloat(featuredEvent.registrationFee) > 0 ? (
                          <Button 
                            className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
                            asChild
                          >
                            <Link href={`/payment/${featuredEvent.id}`}>
                              Register - {featuredEvent.registrationFee ? formatCurrencyINR(parseFloat(featuredEvent.registrationFee)) : 'Free'}
                            </Link>
                          </Button>
                        ) : (
                          <Button 
                            className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
                            onClick={() => registerMutation.mutate(featuredEvent.id)}
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? 'Registering...' : 'Register Free'}
                          </Button>
                        )}
                        <Button variant="outline" asChild>
                          <Link href={`/event/${featuredEvent.id}`}>
                            Learn More
                          </Link>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Featured event image/stats */}
                    <div className="text-center">
                      <div className="text-8xl mb-4">
                        {featuredEvent.type === 'hackathon' ? '💻' : 
                         featuredEvent.type === 'workshop' ? '🛠️' : 
                         featuredEvent.type === 'conference' ? '🎤' : 
                         featuredEvent.type === 'quiz' ? '🏆' : '📅'}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">{featuredEvent.maxParticipants || 500}</div>
                          <div className="text-sm text-muted-foreground">Max Participants</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-accent">{featuredEvent.prizePool ? formatCurrencyINR(parseFloat(featuredEvent.prizePool)) : '₹0'}</div>
                          <div className="text-sm text-muted-foreground">Prize Pool</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Enhanced Search and Filter Bar */}
          <div className="bg-card border rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search events, organizers, skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-events"
                />
              </div>
              
              {/* Event Type Filter */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hackathon">Hackathons</SelectItem>
                  <SelectItem value="workshop">Workshops</SelectItem>
                  <SelectItem value="conference">Conferences</SelectItem>
                  <SelectItem value="quiz">Quizzes</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="registration_open">Open for Registration</SelectItem>
                  <SelectItem value="live">Live Now</SelectItem>
                  <SelectItem value="published">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Location Filter */}
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectItem value="in-person">In-Person</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="date">Upcoming</SelectItem>
                  <SelectItem value="prize">Highest Prize</SelectItem>
                  <SelectItem value="participants">Most Participants</SelectItem>
                  <SelectItem value="recent">Recently Added</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Quick Filter Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge 
                variant={selectedStatus === 'registration_open' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedStatus(selectedStatus === 'registration_open' ? 'all' : 'registration_open')}
              >
                🟢 Open Registration
              </Badge>
              <Badge 
                variant={selectedStatus === 'live' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedStatus(selectedStatus === 'live' ? 'all' : 'live')}
              >
                🔴 Live Now
              </Badge>
              <Badge 
                variant={selectedLocation === 'virtual' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedLocation(selectedLocation === 'virtual' ? 'all' : 'virtual')}
              >
                🌐 Virtual
              </Badge>
              <Badge 
                variant={sortBy === 'prize' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSortBy(sortBy === 'prize' ? 'popularity' : 'prize')}
              >
                💰 High Prizes
              </Badge>
            </div>
          </div>

          {/* Enhanced Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                All Events ({allEvents.length})
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trending ({trendingEvents.length})
              </TabsTrigger>
              {user && (
                <TabsTrigger value="recommended" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  For You ({recommendedEvents.length})
                </TabsTrigger>
              )}
              <TabsTrigger value="live" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Live ({liveEvents.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Upcoming
              </TabsTrigger>
            </TabsList>

            {/* Event Categories Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {eventCategories.map((category) => (
                <Card 
                  key={category.id}
                  className={`cursor-pointer hover:border-primary transition-colors ${
                    selectedType === category.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedType(selectedType === category.id ? 'all' : category.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">
                      {typeof category.icon === 'string' ? category.icon : <category.icon className="w-6 h-6 mx-auto" />}
                    </div>
                    <h3 className="font-semibold text-sm">{category.label}</h3>
                    <p className="text-xs text-muted-foreground">{category.count} events</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tab Content */}
            <TabsContent value="all" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">All Events</h2>
                <div className="text-sm text-muted-foreground">
                  Showing {filteredEvents.length} of {allEvents.length} events
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRegister={() => registerMutation.mutate(event.id)}
                    isRegistering={registerMutation.isPending}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trending" className="space-y-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Trending Events</h2>
              </div>
              <p className="text-muted-foreground">
                Most popular events based on views, registrations, and engagement
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getEventsForTab('trending').map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRegister={() => registerMutation.mutate(event.id)}
                    isRegistering={registerMutation.isPending}
                  />
                ))}
              </div>
            </TabsContent>

            {user && (
              <TabsContent value="recommended" className="space-y-6">
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Recommended for You</h2>
                </div>
                <p className="text-muted-foreground">
                  Events curated based on your skills, interests, and past participation
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getEventsForTab('recommended').map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onRegister={() => registerMutation.mutate(event.id)}
                      isRegistering={registerMutation.isPending}
                    />
                  ))}
                </div>
              </TabsContent>
            )}

            <TabsContent value="live" className="space-y-6">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-red-500" />
                <h2 className="text-2xl font-bold">Live Events</h2>
                <div className="w-3 h-3 bg-red-500 rounded-full live-indicator"></div>
              </div>
              <p className="text-muted-foreground">
                Events happening right now - Join the action!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getEventsForTab('live').map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRegister={() => registerMutation.mutate(event.id)}
                    isRegistering={registerMutation.isPending}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Upcoming Events</h2>
              </div>
              <p className="text-muted-foreground">
                Events starting soon - Register before it's too late!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getEventsForTab('upcoming').map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onRegister={() => registerMutation.mutate(event.id)}
                    isRegistering={registerMutation.isPending}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Empty State */}
          {filteredEvents.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold mb-4">No Events Found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filter criteria to find events that match your interests.
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedStatus('all');
                setSelectedLocation('all');
              }}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}