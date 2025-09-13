import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsChart } from '@/components/ui/analytics-chart';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Analytics, Event } from '@/types';
import { TrendingUp, TrendingDown, Users, Calendar, IndianRupee, Star, Download, BarChart3, Brain } from 'lucide-react';
import { formatCurrencyINR } from '@/lib/utils';

export default function AnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) {
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
  }, [user, authLoading, toast]);

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['/api/events'],
    enabled: !!user,
  });

  const { data: analytics = [] } = useQuery<Analytics[]>({
    queryKey: ['/api/analytics/events', selectedEvent],
    enabled: !!user && selectedEvent !== 'all',
  });

  // Mock analytics data for demonstration
  const keyMetrics = {
    totalParticipants: {
      value: 12847,
      change: 15.3,
      trend: 'up' as const,
    },
    activeEvents: {
      value: 89,
      change: 8.7,
      trend: 'up' as const,
    },
    engagementRate: {
      value: 94.2,
      change: 22.1,
      trend: 'up' as const,
    },
    revenue: {
      value: 248000,
      change: 31.5,
      trend: 'up' as const,
    },
  };

  const eventPerformanceData = [
    { name: 'Jan', participants: 400, engagement: 85, revenue: 15000 },
    { name: 'Feb', participants: 600, engagement: 88, revenue: 18000 },
    { name: 'Mar', participants: 800, engagement: 92, revenue: 22000 },
    { name: 'Apr', participants: 950, engagement: 90, revenue: 25000 },
    { name: 'May', participants: 1200, engagement: 94, revenue: 28000 },
    { name: 'Jun', participants: 1100, engagement: 96, revenue: 30000 },
  ];

  const eventTypePerformance = [
    { type: 'Hackathons', participants: 2847, change: 15.2 },
    { type: 'Workshops', participants: 1923, change: 8.7 },
    { type: 'Conferences', participants: 756, change: 2.1 },
    { type: 'Competitions', participants: 432, change: -1.3 },
  ];

  const geographicData = [
    { region: 'North America', percentage: 45, color: 'bg-primary' },
    { region: 'Europe', percentage: 32, color: 'bg-secondary' },
    { region: 'Asia Pacific', percentage: 18, color: 'bg-chart-4' },
    { region: 'Other', percentage: 5, color: 'bg-chart-5' },
  ];

  const revenueBreakdown = [
    { source: 'Event Registration', amount: 186000, percentage: 65.5 },
    { source: 'Sponsorships', amount: 72000, percentage: 25.4 },
    { source: 'Premium Features', amount: 21000, percentage: 7.4 },
    { source: 'Merchandise', amount: 5000, percentage: 1.7 },
  ];

  if (authLoading) {
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
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
            <div>
              <h1 className="text-5xl font-bold mb-4">
                Powerful <span className="gradient-text">Analytics</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Real-time insights, predictive analytics, and comprehensive reporting for data-driven decisions
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32" data-testid="select-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              
              <Button className="bg-primary text-primary-foreground" data-testid="button-export-report">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="analytics-card" data-testid="metric-participants">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{keyMetrics.totalParticipants.value.toLocaleString()}</div>
                <div className={`flex items-center text-xs ${keyMetrics.totalParticipants.trend === 'up' ? 'text-chart-4' : 'text-destructive'}`}>
                  {keyMetrics.totalParticipants.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  +{keyMetrics.totalParticipants.change}% from last month
                </div>
              </CardContent>
            </Card>

            <Card className="analytics-card" data-testid="metric-events">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{keyMetrics.activeEvents.value}</div>
                <div className={`flex items-center text-xs ${keyMetrics.activeEvents.trend === 'up' ? 'text-chart-4' : 'text-destructive'}`}>
                  {keyMetrics.activeEvents.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  +{keyMetrics.activeEvents.change}% improvement
                </div>
              </CardContent>
            </Card>

            <Card className="analytics-card" data-testid="metric-engagement">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{keyMetrics.engagementRate.value}%</div>
                <div className={`flex items-center text-xs ${keyMetrics.engagementRate.trend === 'up' ? 'text-chart-4' : 'text-destructive'}`}>
                  {keyMetrics.engagementRate.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  +{keyMetrics.engagementRate.change}% growth
                </div>
              </CardContent>
            </Card>

            <Card className="analytics-card" data-testid="metric-revenue">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue (MTD)</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrencyINR(keyMetrics.revenue.value)}</div>
                <div className={`flex items-center text-xs ${keyMetrics.revenue.trend === 'up' ? 'text-chart-4' : 'text-destructive'}`}>
                  <Star className="w-3 h-3 mr-1 text-chart-5" />
                  Excellent performance
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 glass-card">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="events" data-testid="tab-events">Events</TabsTrigger>
              <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
              <TabsTrigger value="revenue" data-testid="tab-revenue">Revenue</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Performance Charts */}
              <div className="grid lg:grid-cols-2 gap-8">
                <Card className="analytics-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Event Performance Trends</CardTitle>
                      <Select defaultValue="participants">
                        <SelectTrigger className="w-32" data-testid="select-metric">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="participants">Participants</SelectItem>
                          <SelectItem value="engagement">Engagement</SelectItem>
                          <SelectItem value="revenue">Revenue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <AnalyticsChart data={eventPerformanceData} type="line" />
                  </CardContent>
                </Card>

                <Card className="analytics-card">
                  <CardHeader>
                    <CardTitle>User Engagement Heatmap</CardTitle>
                    <CardDescription>Activity patterns throughout the week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <div key={day} className="text-xs text-center text-muted-foreground p-2">
                          {day}
                        </div>
                      ))}
                      {Array.from({ length: 14 }, (_, i) => (
                        <div
                          key={i}
                          className={`h-8 rounded ${
                            Math.random() > 0.3 ? 'bg-primary' : 'bg-primary/40'
                          }`}
                          style={{ opacity: 0.3 + Math.random() * 0.7 }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Less active</span>
                      <span>More active</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Analytics */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Event Type Performance */}
                <Card className="analytics-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Event Type Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {eventTypePerformance.map((item, index) => (
                        <div key={index} className="flex items-center justify-between" data-testid={`event-type-${index}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-chart-4' : 
                              index === 1 ? 'bg-chart-5' : 
                              index === 2 ? 'bg-chart-3' : 'bg-destructive'
                            }`}></div>
                            <span className="text-sm">{item.type}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-sm">{item.participants.toLocaleString()}</div>
                            <div className={`text-xs ${item.change > 0 ? 'text-chart-4' : 'text-destructive'}`}>
                              {item.change > 0 ? '+' : ''}{item.change}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Geographic Distribution */}
                <Card className="analytics-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-secondary" />
                      Geographic Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {geographicData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between" data-testid={`geo-${index}`}>
                          <span className="text-sm">{item.region}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div 
                                className={`${item.color} h-2 rounded-full`}
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-8">{item.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Insights */}
                <Card className="analytics-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-accent" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="text-sm font-medium text-primary mb-2">📈 Engagement Boost</div>
                        <p className="text-sm text-muted-foreground">Adding interactive polls could increase engagement by 34% in your next webinar.</p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                        <div className="text-sm font-medium text-accent mb-2">🎯 Team Matching</div>
                        <p className="text-sm text-muted-foreground">AI has identified 12 potential team formations for upcoming hackathon.</p>
                      </div>

                      <div className="p-4 rounded-lg bg-chart-4/10 border border-chart-4/20">
                        <div className="text-sm font-medium text-chart-4 mb-2">💡 Recommendation</div>
                        <p className="text-sm text-muted-foreground">Consider scheduling events at 2 PM EST for 25% higher attendance.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="events" className="space-y-8">
              <Card className="analytics-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Event Performance Details</CardTitle>
                    <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                      <SelectTrigger className="w-48" data-testid="select-event">
                        <SelectValue placeholder="Select Event" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedEvent === 'all' ? (
                    <div className="text-center py-16">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">Select an Event</h3>
                      <p className="text-muted-foreground">
                        Choose a specific event to view detailed analytics and insights
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-4 gap-4">
                        <Card className="p-4 text-center">
                          <div className="text-2xl font-bold text-primary">247</div>
                          <div className="text-sm text-muted-foreground">Registrations</div>
                        </Card>
                        <Card className="p-4 text-center">
                          <div className="text-2xl font-bold text-chart-4">89%</div>
                          <div className="text-sm text-muted-foreground">Attendance</div>
                        </Card>
                        <Card className="p-4 text-center">
                          <div className="text-2xl font-bold text-accent">4.8</div>
                          <div className="text-sm text-muted-foreground">Rating</div>
                        </Card>
                        <Card className="p-4 text-center">
                          <div className="text-2xl font-bold text-chart-5">{formatCurrencyINR(2400)}</div>
                          <div className="text-sm text-muted-foreground">Revenue</div>
                        </Card>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-8">
              <Card className="analytics-card">
                <CardHeader>
                  <CardTitle>User Engagement</CardTitle>
                  <CardDescription>Detailed user activity and behavior patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">2h 34m</div>
                        <div className="text-sm text-muted-foreground">Avg. Session</div>
                        <div className="text-xs text-chart-4">+22min</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-accent">47.2K</div>
                        <div className="text-sm text-muted-foreground">Chat Messages</div>
                        <div className="text-xs text-chart-4">+18.5%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-chart-3">3.8K</div>
                        <div className="text-sm text-muted-foreground">File Shares</div>
                        <div className="text-xs text-chart-4">+9.2%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-chart-5">12.4K</div>
                        <div className="text-sm text-muted-foreground">Connections</div>
                        <div className="text-xs text-chart-4">+15.7%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-8">
                <Card className="analytics-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IndianRupee className="w-5 h-5 text-chart-4" />
                      Revenue Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {revenueBreakdown.map((item, index) => (
                        <div key={index} className="flex items-center justify-between" data-testid={`revenue-${index}`}>
                          <span className="text-sm">{item.source}</span>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrencyINR(item.amount)}</div>
                            <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="analytics-card">
                  <CardHeader>
                    <CardTitle>Sustainability Impact</CardTitle>
                    <CardDescription>Environmental benefits of virtual events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-chart-4 mb-2">12.4T</div>
                        <div className="text-sm text-muted-foreground">CO₂ Saved vs in-person</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-chart-4">2,847</div>
                          <div className="text-xs text-muted-foreground">Trees Equivalent</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-chart-4">4.2M</div>
                          <div className="text-xs text-muted-foreground">Miles Saved</div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-chart-4/10 border border-chart-4/30 rounded-lg text-center">
                        <p className="text-xs text-chart-4 font-medium">🌱 You're in the top 5% for sustainability!</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
