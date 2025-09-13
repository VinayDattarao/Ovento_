import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ChatInterface } from '@/components/ChatInterface';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { TeamMatchingResult } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import { Brain, Users, MessageSquare, Search, Zap, Code, Palette, Rocket } from 'lucide-react';

export default function CommunityPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { isConnected, messages, sendChatMessage } = useWebSocket(user?.id);

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

  const { data: teamMatches, isLoading: matchesLoading } = useQuery<TeamMatchingResult>({
    queryKey: ['/api/ai/team-matches'],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/ai/team-matches', {
        eventType: 'hackathon',
        teamSize: 4,
      });
      return response.json();
    },
    enabled: !!user,
  });

  const communityStats = {
    totalMembers: '127K+',
    activeChats: '2.8K',
    teamsFormed: '15.6K',
    projectsCompleted: '8.2K',
  };

  const groupChats = [
    {
      id: '1',
      name: 'React Developers',
      members: 2847,
      description: 'Discuss React best practices, share projects, and get help from the community.',
      icon: '⚛️',
      isActive: true,
      recentActivity: '2 minutes ago',
    },
    {
      id: '2',
      name: 'UI/UX Designers',
      members: 1923,
      description: 'Share your designs, get feedback, and collaborate on creative projects.',
      icon: '🎨',
      isActive: true,
      recentActivity: '5 minutes ago',
    },
    {
      id: '3',
      name: 'Startup Founders',
      members: 756,
      description: 'Connect with fellow entrepreneurs and share startup experiences.',
      icon: '🚀',
      isActive: true,
      recentActivity: '1 hour ago',
    },
    {
      id: '4',
      name: 'Machine Learning',
      members: 3421,
      description: 'Deep dive into ML algorithms, share research, and discuss latest developments.',
      icon: '🤖',
      isActive: false,
      recentActivity: '3 hours ago',
    },
  ];

  const recommendedConnections = [
    {
      id: '1',
      name: 'Alex Chen',
      role: 'Full-stack Developer',
      skills: ['React', 'Node.js', 'AI/ML'],
      matchScore: 95,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      bio: 'Passionate about building scalable web applications',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      role: 'UX Designer',
      skills: ['Figma', 'Product Design', 'User Research'],
      matchScore: 88,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      bio: 'Creating delightful user experiences through design',
    },
    {
      id: '3',
      name: 'Mike Rodriguez',
      role: 'Data Scientist',
      skills: ['Python', 'Machine Learning', 'Data Analysis'],
      matchScore: 82,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      bio: 'Turning data into actionable insights',
    },
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
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">
              Join The <span className="gradient-text">Ovento Community</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Connect with like-minded individuals, form teams, and collaborate on amazing projects
            </p>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="glass-card text-center" data-testid="stat-members">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">{communityStats.totalMembers}</div>
                <div className="text-sm text-muted-foreground">Active Members</div>
              </CardContent>
            </Card>
            <Card className="glass-card text-center" data-testid="stat-chats">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-secondary mb-2">{communityStats.activeChats}</div>
                <div className="text-sm text-muted-foreground">Group Chats</div>
              </CardContent>
            </Card>
            <Card className="glass-card text-center" data-testid="stat-teams">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-chart-4 mb-2">{communityStats.teamsFormed}</div>
                <div className="text-sm text-muted-foreground">Teams Formed</div>
              </CardContent>
            </Card>
            <Card className="glass-card text-center" data-testid="stat-projects">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-chart-5 mb-2">{communityStats.projectsCompleted}</div>
                <div className="text-sm text-muted-foreground">Projects Completed</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 glass-card">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="connections" data-testid="tab-connections">Connections</TabsTrigger>
              <TabsTrigger value="teams" data-testid="tab-teams">Teams</TabsTrigger>
              <TabsTrigger value="chat" data-testid="tab-chat">Chat</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* AI Recommendations */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    AI-Recommended Connections
                  </CardTitle>
                  <CardDescription>
                    People you should connect with based on shared interests and complementary skills
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendedConnections.map((connection) => (
                      <Card key={connection.id} className="border border-border hover:border-primary transition-colors" data-testid={`connection-${connection.id}`}>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={connection.avatar} alt={connection.name} />
                              <AvatarFallback>{connection.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold">{connection.name}</h4>
                              <p className="text-sm text-muted-foreground">{connection.role}</p>
                              <Badge variant="secondary" className="text-xs mt-1">
                                {connection.matchScore}% match
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-4">{connection.bio}</p>
                          
                          <div className="mb-4">
                            <p className="text-sm font-medium mb-2">Skills:</p>
                            <div className="flex flex-wrap gap-2">
                              {connection.skills.map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1" 
                              data-testid={`button-connect-${connection.id}`}
                              onClick={() => {
                                toast({
                                  title: "Connection Request Sent!",
                                  description: `Your connection request has been sent to ${connection.name}.`,
                                });
                              }}
                            >
                              Connect
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              data-testid={`button-view-profile-${connection.id}`}
                              onClick={() => {
                                toast({
                                  title: "Profile View",
                                  description: `Viewing ${connection.name}'s profile (hardcoded demo).`,
                                });
                              }}
                            >
                              Profile
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Popular Group Chats */}
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Popular Group Chats</CardTitle>
                      <CardDescription>Join conversations with like-minded developers</CardDescription>
                    </div>
                    <Button className="bg-primary text-primary-foreground" data-testid="button-create-group">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Group
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {groupChats.map((chat) => (
                      <Card key={chat.id} className="glass-card hover-lift" data-testid={`group-chat-${chat.id}`}>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-2xl">
                              {chat.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold">{chat.name}</h4>
                              <p className="text-sm text-muted-foreground">{chat.members.toLocaleString()} members</p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-4">{chat.description}</p>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${chat.isActive ? 'bg-chart-4' : 'bg-muted-foreground'}`}></div>
                              <span className="text-xs text-muted-foreground">{chat.recentActivity}</span>
                            </div>
                            {chat.isActive && (
                              <Badge variant="outline" className="text-chart-4 border-chart-4">
                                Active
                              </Badge>
                            )}
                          </div>
                          
                          <Button 
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
                            data-testid={`button-join-chat-${chat.id}`}
                            onClick={() => {
                              toast({
                                title: `Joined ${chat.name}!`,
                                description: `You've successfully joined the ${chat.name} group chat.`,
                              });
                            }}
                          >
                            Join Chat
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="connections" className="space-y-8">
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Your Network</CardTitle>
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search connections..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                        data-testid="input-search-connections"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">Build Your Network</h3>
                    <p className="text-muted-foreground mb-6">
                      Connect with other members to start collaborating on projects
                    </p>
                    <Button data-testid="button-find-connections">
                      Find Connections
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teams" className="space-y-8">
              {/* Team Formation Tools */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent" />
                    AI-Powered Team Formation
                  </CardTitle>
                  <CardDescription>
                    Let AI find the perfect teammates for your next project or hackathon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-8 mb-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <Brain className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="font-semibold mb-2">Skill Matching</h4>
                      <p className="text-sm text-muted-foreground">AI analyzes your skills and finds complementary team members</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="font-semibold mb-2">Team Dynamics</h4>
                      <p className="text-sm text-muted-foreground">Creates balanced teams based on personality and work styles</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-chart-4 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="font-semibold mb-2">Success Prediction</h4>
                      <p className="text-sm text-muted-foreground">Predicts team success rate for better project outcomes</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Button className="bg-gradient-to-r from-primary to-secondary text-white px-8" data-testid="button-find-team">
                      <Zap className="w-4 h-4 mr-2" />
                      Find My Team
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Your Teams */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Your Teams</CardTitle>
                  <CardDescription>Teams you're part of or leading</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No Teams Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Join or create teams to start collaborating on projects
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button data-testid="button-create-team">Create Team</Button>
                      <Button variant="outline" data-testid="button-browse-teams">Browse Teams</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chat" className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-8">
                <ChatInterface
                  title="Community Chat"
                  channelType="global"
                  channelId="community"
                  messages={messages}
                  onSendMessage={sendChatMessage}
                  isConnected={isConnected}
                />
                
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      Chat Channels
                    </CardTitle>
                    <CardDescription>Active conversations and channels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {groupChats.map((chat) => (
                        <div
                          key={chat.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                          data-testid={`channel-${chat.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{chat.icon}</div>
                            <div>
                              <div className="font-medium">{chat.name}</div>
                              <div className="text-sm text-muted-foreground">{chat.members} members</div>
                            </div>
                          </div>
                          {chat.isActive && (
                            <div className="w-2 h-2 bg-chart-4 rounded-full"></div>
                          )}
                        </div>
                      ))}
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
