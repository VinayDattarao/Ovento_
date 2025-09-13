import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  IndianRupee, 
  Calendar,
  Globe,
  Star,
  Heart,
  Leaf,
  Brain,
  Download,
  Filter
} from "lucide-react";
import { formatCurrencyINR } from '@/lib/utils';

interface EventAnalytic {
  id: string;
  eventId: string;
  metric: string;
  value: string;
  date: string;
}

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for demonstration
  const mockAnalytics = {
    totalAttendees: 47892,
    engagementRate: 94.7,
    revenue: 284000,
    satisfaction: 4.8,
  };

  const mockEventPerformance = [
    { name: "AI Innovation Hackathon", type: "Hackathon", participants: 1247, engagement: 96.5, revenue: 15670, rating: 4.9 },
    { name: "React Masterclass", type: "Workshop", participants: 892, engagement: 91.3, revenue: 8920, rating: 4.7 },
    { name: "Tech Trivia Night", type: "Quiz", participants: 2156, engagement: 88.7, revenue: 3240, rating: 4.6 },
  ];

  const mockGeographicData = [
    { region: "North America", percentage: 45, color: "bg-primary" },
    { region: "Europe", percentage: 32, color: "bg-accent" },
    { region: "Asia Pacific", percentage: 18, color: "bg-chart-4" },
    { region: "Other", percentage: 5, color: "bg-chart-5" },
  ];

  const mockRevenueBreakdown = [
    { source: "Event Registration", amount: 186000, percentage: 65.5 },
    { source: "Sponsorships", amount: 72000, percentage: 25.4 },
    { source: "Premium Features", amount: 21000, percentage: 7.4 },
    { source: "Merchandise", amount: 5000, percentage: 1.7 },
  ];

  const mockEngagementMetrics = [
    { metric: "Session Duration", value: "2h 34m", change: "+22min", trend: "up" },
    { metric: "Chat Messages", value: "47.2K", change: "+18.5%", trend: "up" },
    { metric: "File Shares", value: "3.8K", change: "+9.2%", trend: "up" },
    { metric: "Network Connections", value: "12.4K", change: "+15.7%", trend: "up" },
  ];

  const mockAIInsights = [
    {
      type: "Optimization Tip",
      message: "Events starting at 2 PM show 23% higher attendance rates",
      color: "bg-primary/10 border-primary/30 text-primary"
    },
    {
      type: "Trend Alert",
      message: "AI/ML workshops are trending 45% above average",
      color: "bg-accent/10 border-accent/30 text-accent"
    },
    {
      type: "Engagement Boost",
      message: "Adding interactive polls increases engagement by 67%",
      color: "bg-chart-4/10 border-chart-4/30 text-chart-4"
    }
  ];

  const mockSustainabilityMetrics = {
    co2Saved: "12.4T",
    treesEquivalent: 2847,
    travelMilesSaved: "4.2M",
    sustainabilityRank: "top 5%"
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };


  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Powerful <span className="gradient-text">Analytics</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real-time insights, predictive analytics, and comprehensive reporting for data-driven decisions
          </p>
        </div>

        {/* Analytics Dashboard */}
        <Card className="mb-12">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Event Performance Dashboard</CardTitle>
              <div className="flex items-center gap-4">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {formatNumber(mockAnalytics.totalAttendees)}
                </div>
                <div className="text-sm text-muted-foreground">Total Attendees</div>
                <div className="text-xs text-chart-4 flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +12.5% from last month
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent mb-2">
                  {mockAnalytics.engagementRate}%
                </div>
                <div className="text-sm text-muted-foreground">Engagement Rate</div>
                <div className="text-xs text-chart-4 flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +3.2% improvement
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-chart-5 mb-2">
                  {formatCurrencyINR(mockAnalytics.revenue)}
                </div>
                <div className="text-sm text-muted-foreground">Revenue Generated</div>
                <div className="text-xs text-chart-4 flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +18.9% growth
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-chart-4 mb-2">
                  {mockAnalytics.satisfaction}
                </div>
                <div className="text-sm text-muted-foreground">Average Satisfaction</div>
                <div className="text-xs text-chart-5 flex items-center justify-center gap-1 mt-1">
                  <Star className="h-3 w-3" />
                  Excellent rating
                </div>
              </div>
            </div>

            {/* Charts Placeholder */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="border border-border p-6 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">Attendance Trends</h4>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-primary mb-2 mx-auto" />
                    <p className="text-sm text-muted-foreground">Interactive attendance trend chart would render here</p>
                  </div>
                </div>
              </div>
              
              <div className="border border-border p-6 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">Engagement Metrics</h4>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-accent mb-2 mx-auto" />
                    <p className="text-sm text-muted-foreground">Real-time engagement analytics chart would render here</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Analytics */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Event Performance</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Event Type Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Event Type Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-chart-4 rounded-full"></div>
                        <span>Hackathons</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">2,847</div>
                        <div className="text-xs text-chart-4">+15.2%</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-chart-5 rounded-full"></div>
                        <span>Workshops</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">1,923</div>
                        <div className="text-xs text-chart-4">+8.7%</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span>Conferences</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">756</div>
                        <div className="text-xs text-chart-5">+2.1%</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-accent rounded-full"></div>
                        <span>Competitions</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">432</div>
                        <div className="text-xs text-red-400">-1.3%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Geographic Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-accent" />
                    Geographic Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockGeographicData.map((region) => (
                      <div key={region.region} className="flex items-center justify-between">
                        <span>{region.region}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className={`${region.color} h-2 rounded-full`} 
                              style={{ width: `${region.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{region.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Sustainability Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-chart-4" />
                    Sustainability Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>CO₂ Saved</span>
                      <div className="text-right">
                        <div className="font-semibold text-chart-4">{mockSustainabilityMetrics.co2Saved}</div>
                        <div className="text-xs text-muted-foreground">vs in-person</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Trees Equivalent</span>
                      <div className="text-right">
                        <div className="font-semibold text-chart-4">{mockSustainabilityMetrics.treesEquivalent.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">planted</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Travel Miles Saved</span>
                      <div className="text-right">
                        <div className="font-semibold text-chart-4">{mockSustainabilityMetrics.travelMilesSaved}</div>
                        <div className="text-xs text-muted-foreground">miles</div>
                      </div>
                    </div>
                    <div className="p-3 bg-chart-4/10 border border-chart-4/30 rounded-lg">
                      <p className="text-xs text-chart-4 font-medium">
                        🌱 You're in the {mockSustainabilityMetrics.sustainabilityRank} for sustainability!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Event Performance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold">Event Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Type</th>
                        <th className="text-left py-3 px-4 font-semibold">Participants</th>
                        <th className="text-left py-3 px-4 font-semibold">Engagement</th>
                        <th className="text-left py-3 px-4 font-semibold">Revenue</th>
                        <th className="text-left py-3 px-4 font-semibold">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockEventPerformance.map((event, index) => (
                        <tr key={index} className="border-b border-border/50">
                          <td className="py-3 px-4 font-medium">{event.name}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{event.type}</Badge>
                          </td>
                          <td className="py-3 px-4">{event.participants.toLocaleString()}</td>
                          <td className="py-3 px-4">{event.engagement}%</td>
                          <td className="py-3 px-4">{formatCurrencyINR(event.revenue)}</td>
                          <td className="py-3 px-4">{event.rating} ⭐</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-chart-5" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRevenueBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{item.source}</span>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrencyINR(item.amount)}</div>
                        <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-accent" />
                  User Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEngagementMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{metric.metric}</span>
                      <div className="text-right">
                        <div className="font-semibold">{metric.value}</div>
                        <div className={`text-xs ${metric.trend === 'up' ? 'text-chart-4' : 'text-red-400'}`}>
                          {metric.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAIInsights.map((insight, index) => (
                    <div key={index} className={`p-4 border rounded-lg ${insight.color}`}>
                      <div className="text-sm font-medium mb-1">{insight.type}</div>
                      <p className="text-xs">{insight.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
