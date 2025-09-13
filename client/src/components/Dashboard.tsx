import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import AIRecommendations from "@/components/AIRecommendations";
import EventBuilder from "@/components/EventBuilder";
import { useAuth } from "@/hooks/useAuth";
import { 
  Calendar, 
  Users, 
  IndianRupee, 
  Star, 
  Plus, 
  Brain,
  TrendingUp,
  Clock,
  MessageSquare,
  BarChart3
} from "lucide-react";
import { formatCurrencyINR } from "@/lib/utils";

interface DashboardStats {
  organizedEvents: number;
  registeredEvents: number;
  unreadNotifications: number;
  totalParticipants: number;
  totalRevenue: number;
  upcomingEvents: number;
  completedEvents: number;
  recentRegistrations: number;
  avgEventRating: number;
  networkGrowth: number;
  weeklyStats: {
    eventViews: number;
    profileViews: number;
    messagesSent: number;
    teamsJoined: number;
  };
  achievements: {
    eventsOrganized: boolean;
    communityBuilder: boolean;
    topRated: boolean;
    activeParticipant: boolean;
  };
  revenueHistory: {
    month: string;
    revenue: number;
  }[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user,
  });

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const { data: userEvents } = useQuery({
    queryKey: ["/api/events", "user"],
    enabled: !!user,
  });

  if (statsLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="gradient-text">{user?.firstName || 'there'}!</span>
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your events and community
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setLocation('/event-builder')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              // Scroll to AI Insights section
              document.querySelector('.ai-insights')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Assistant
          </Button>
        </div>
      </div>

      {/* AI Insights Banner */}
      <Card className="ai-insights mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">AI Insights Ready</h3>
                <p className="text-muted-foreground">
                  Based on your activity, we found 3 perfect events and 5 potential team members
                </p>
              </div>
            </div>
            <Button variant="ghost">
              <TrendingUp className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Event Builder
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Management
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                  <Badge variant="secondary" className="text-chart-4">+12.5%</Badge>
                </div>
                <div className="text-3xl font-bold mb-2">{stats?.organizedEvents || 0}</div>
                <p className="text-sm text-muted-foreground">Active Events</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="h-8 w-8 text-accent" />
                  <Badge variant="secondary" className="text-chart-4">+8.2%</Badge>
                </div>
                <div className="text-3xl font-bold mb-2">{stats?.totalParticipants || 0}</div>
                <p className="text-sm text-muted-foreground">Total Participants</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <IndianRupee className="h-8 w-8 text-chart-3" />
                  <Badge variant="secondary" className="text-chart-4">+15.8%</Badge>
                </div>
                <div className="text-3xl font-bold mb-2">{formatCurrencyINR(stats?.totalRevenue || 0)}</div>
                <p className="text-sm text-muted-foreground">Revenue</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Star className="h-8 w-8 text-chart-4" />
                  <Badge variant="secondary" className="text-chart-4">+0.3</Badge>
                </div>
                <div className="text-3xl font-bold mb-2">{stats?.avgEventRating || 4.5}</div>
                <p className="text-sm text-muted-foreground">Avg. Rating</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & AI Insights */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-secondary/50">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">New participant registered for "AI Hackathon 2024"</p>
                        <p className="text-sm text-muted-foreground">2 minutes ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-secondary/50">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Team "Code Wizards" submitted their project</p>
                        <p className="text-sm text-muted-foreground">15 minutes ago</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-secondary/50">
                      <div className="w-10 h-10 rounded-full bg-chart-3/20 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-chart-3" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Analytics report generated for "Web Dev Workshop"</p>
                        <p className="text-sm text-muted-foreground">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            <AIRecommendations />
          </div>
        </TabsContent>

        <TabsContent value="builder">
          <EventBuilder />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Team management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Advanced analytics features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Payment management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
