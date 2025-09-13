import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  Users, 
  IndianRupee, 
  MapPin,
  Clock,
  Trophy,
  Star,
  Bookmark,
  Share,
  Play
} from "lucide-react";
import { formatCurrencyINR } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  description: string;
  type: 'hackathon' | 'workshop' | 'quiz' | 'conference' | 'networking';
  status: 'draft' | 'published' | 'live' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  location?: string;
  isVirtual: boolean;
  maxParticipants?: number;
  registrationFee: string;
  prizePool: string;
  tags?: string[];
  imageUrl?: string;
  organizerId: string;
}

export default function Events() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [activeTab, setActiveTab] = useState("discover");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events", { search: searchQuery, type: selectedType === "all" ? undefined : selectedType }],
  });

  const { data: userEvents } = useQuery<Event[]>({
    queryKey: ["/api/events", "user"],
  });

  const registerMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest("POST", `/api/events/${eventId}/register`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully registered for event!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const eventTypes = [
    { value: "all", label: "All Events", icon: Calendar },
    { value: "hackathon", label: "Hackathons", icon: Trophy },
    { value: "workshop", label: "Workshops", icon: Users },
    { value: "quiz", label: "Quizzes", icon: Star },
    { value: "conference", label: "Conferences", icon: Play },
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'hackathon':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'workshop':
        return 'bg-accent/20 text-accent border-accent/30';
      case 'quiz':
        return 'bg-chart-3/20 text-chart-3 border-chart-3/30';
      case 'conference':
        return 'bg-chart-4/20 text-chart-4 border-chart-4/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-500 text-white';
      case 'published':
        return 'bg-green-500 text-white';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-yellow-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="glass-card hover-lift group">
      <div className="relative">
        <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-xl flex items-center justify-center">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover rounded-t-xl" />
          ) : (
            <div className="text-center">
              <Calendar className="h-12 w-12 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{event.type.charAt(0).toUpperCase() + event.type.slice(1)}</p>
            </div>
          )}
        </div>
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className={getEventTypeColor(event.type)}>
            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
          </Badge>
          <Badge className={getStatusColor(event.status)}>
            {event.status === 'live' && <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />}
            {event.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
          )}
          {event.isVirtual && (
            <div className="flex items-center gap-2 text-sm">
              <Play className="h-4 w-4 text-chart-3" />
              <span className="text-chart-3">Virtual Event</span>
            </div>
          )}
          {event.maxParticipants && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{event.maxParticipants} participants max</span>
            </div>
          )}
        </div>

        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{event.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {parseFloat(event.registrationFee) > 0 ? (
              <span className="text-lg font-bold text-primary">${event.registrationFee}</span>
            ) : (
              <span className="text-lg font-bold text-chart-4">Free</span>
            )}
            {parseFloat(event.prizePool) > 0 && (
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4 text-chart-5" />
                <span className="text-sm font-medium text-chart-5">${event.prizePool}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => registerMutation.mutate(event.id)}
              disabled={registerMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {event.status === 'live' ? 'Join Now' : 'Register'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-xl" />
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-full mb-4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Discover <span className="gradient-text">Amazing Events</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            AI-curated events tailored to your interests, skills, and career goals
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search events, skills, or organizers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Type Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {eventTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Button
                key={type.value}
                variant={selectedType === type.value ? "default" : "outline"}
                onClick={() => setSelectedType(type.value)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {type.label}
              </Button>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="my-events">My Events</TabsTrigger>
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            {/* Featured Event */}
            {events && events.length > 0 && (
              <Card className="mb-12 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className="bg-red-500 text-white">
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                      LIVE NOW
                    </Badge>
                    <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                      FEATURED
                    </Badge>
                  </div>
                  <div className="grid lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <h2 className="text-3xl font-bold mb-4">{events[0].title}</h2>
                      <p className="text-muted-foreground mb-6 text-lg">
                        {events[0].description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{formatDate(events[0].startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-accent" />
                          <span>{events[0].maxParticipants} registered</span>
                        </div>
                        {parseFloat(events[0].prizePool) > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Trophy className="h-4 w-4 text-chart-5" />
                            <span className="text-sm">{events[0].prizePool ? formatCurrencyINR(parseFloat(events[0].prizePool)) : '₹0'} prizes</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={() => registerMutation.mutate(events[0].id)}
                          disabled={registerMutation.isPending}
                          className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
                        >
                          Join Live Stream
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href={`/event/${events[0].id}`}>
                            Learn More
                          </Link>
                        </Button>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
                        <Play className="h-16 w-16 text-primary" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Events Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events?.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {events?.length === 0 && (
              <div className="text-center py-16">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No events found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-events">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userEvents?.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {userEvents?.length === 0 && (
              <div className="text-center py-16">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No registered events</h3>
                <p className="text-muted-foreground">Start by discovering and registering for events</p>
                <Button onClick={() => setActiveTab("discover")} className="mt-4">
                  Discover Events
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations">
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Recommendations Coming Soon</h3>
              <p className="text-muted-foreground">We're building personalized event recommendations for you</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Floating Action Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-lg z-50">
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="text-center py-8">
              <p className="text-muted-foreground">Event creation wizard coming soon!</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
