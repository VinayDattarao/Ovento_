import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Event } from '@/types';
import { Search, Filter, Globe, TrendingUp, Users, Star, Map } from 'lucide-react';

export default function Discover() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('worldwide');

  // Fetch all events for discovery
  const { data: allEvents = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events/discover', selectedType, selectedLocation],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedLocation !== 'all') params.append('location', selectedLocation);
      
      const response = await fetch(`/api/events/discover?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
  });

  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = searchTerm === '' || 
                         event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Categorize events by organizers
  const organizers = Array.from(new Set(allEvents.map(event => event.organizerId)))
    .map(organizerId => {
      const organizerEvents = allEvents.filter(event => event.organizerId === organizerId);
      return {
        id: organizerId,
        name: `Organizer ${organizerId?.slice(0, 8)}...`,
        events: organizerEvents,
        totalParticipants: organizerEvents.reduce((sum, event) => sum + (event.maxParticipants || 0), 0),
        avgPrize: organizerEvents.reduce((sum, event) => sum + parseFloat(event.prizePool || '0'), 0) / organizerEvents.length
      };
    });

  const popularEvents = [...allEvents].sort((a, b) => 
    (b.maxParticipants || 0) - (a.maxParticipants || 0)
  ).slice(0, 8);

  const highPrizeEvents = [...allEvents]
    .filter(event => parseFloat(event.prizePool || '0') > 0)
    .sort((a, b) => parseFloat(b.prizePool || '0') - parseFloat(a.prizePool || '0'))
    .slice(0, 6);

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          {/* Discover Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Globe className="w-8 h-8 text-primary" />
              <h1 className="text-6xl font-bold gradient-text">Discover</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Explore amazing events from creators around the world. Find hackathons, workshops, 
              conferences and competitions organized by the global community.
            </p>
            
            {/* Global Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-card rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">{allEvents.length}</div>
                <div className="text-sm text-muted-foreground">Events Available</div>
              </div>
              <div className="bg-card rounded-lg p-4">
                <div className="text-2xl font-bold text-accent">{organizers.length}</div>
                <div className="text-sm text-muted-foreground">Active Organizers</div>
              </div>
              <div className="bg-card rounded-lg p-4">
                <div className="text-2xl font-bold text-chart-3">
                  {allEvents.reduce((sum, event) => sum + (event.maxParticipants || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Capacity</div>
              </div>
              <div className="bg-card rounded-lg p-4">
                <div className="text-2xl font-bold text-chart-5">
                  ${allEvents.reduce((sum, event) => sum + parseFloat(event.prizePool || '0'), 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Prize Money</div>
              </div>
            </div>
          </div>

          {/* Enhanced Search and Filter */}
          <div className="bg-card border rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search events, topics, organizers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
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
              
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectItem value="north-america">North America</SelectItem>
                  <SelectItem value="europe">Europe</SelectItem>
                  <SelectItem value="asia">Asia</SelectItem>
                  <SelectItem value="global">Global</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Discovery Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="worldwide" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Worldwide ({allEvents.length})
              </TabsTrigger>
              <TabsTrigger value="popular" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Popular
              </TabsTrigger>
              <TabsTrigger value="organizers" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                By Organizers
              </TabsTrigger>
              <TabsTrigger value="featured" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                High Prizes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="worldwide" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Events from Around the World</h2>
                <p className="text-sm text-muted-foreground">
                  Showing {filteredEvents.length} of {allEvents.length} events
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="popular" className="space-y-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Most Popular Events</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="organizers" className="space-y-6">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Browse by Organizers</h2>
              </div>
              <div className="space-y-8">
                {organizers.slice(0, 5).map((organizer) => (
                  <div key={organizer.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{organizer.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {organizer.events.length} events • {organizer.totalParticipants} participants
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        Avg Prize: ${Math.round(organizer.avgPrize).toLocaleString()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {organizer.events.slice(0, 3).map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="featured" className="space-y-6">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">High Prize Events</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {highPrizeEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}