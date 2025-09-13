import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Chat from "@/components/Chat";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  MessageSquare, 
  Code, 
  Palette, 
  Rocket, 
  Brain,
  UserPlus,
  Search,
  Filter,
  Star,
  Zap,
  RefreshCw,
  FileText,
  Image,
  Upload
} from "lucide-react";

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImageUrl?: string;
  skills?: string[];
  interests?: string[];
  bio?: string;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  eventId?: string;
  leaderId: string;
  maxMembers: number;
  skills?: string[];
  isOpen: boolean;
}

interface ChatRoom {
  id: string;
  name: string;
  type: string;
  memberCount: number;
  isActive: boolean;
}

export default function Community() {
  const [activeTab, setActiveTab] = useState("recommendations");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChatRoom, setSelectedChatRoom] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for demonstration
  const mockRecommendations = [
    {
      id: "1",
      firstName: "Alex",
      lastName: "Chen",
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      skills: ["React", "Node.js", "AI/ML"],
      matchScore: 95,
      matchType: "AI Match",
      reason: "Complementary skills for next hackathon"
    },
    {
      id: "2",
      firstName: "Sarah",
      lastName: "Johnson",
      profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      skills: ["UI/UX", "Figma", "Product Design"],
      matchScore: 88,
      matchType: "Team Match",
      reason: "Perfect design partner for your projects"
    },
    {
      id: "3",
      firstName: "Mike",
      lastName: "Rodriguez",
      profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      skills: ["Python", "Machine Learning", "Data Science"],
      matchScore: 82,
      matchType: "Skill Boost",
      reason: "Can teach you advanced ML techniques"
    }
  ];

  const mockChatRooms = [
    {
      id: "1",
      name: "React Developers",
      type: "Technology",
      memberCount: 2847,
      isActive: true,
      icon: <Code className="h-5 w-5" />
    },
    {
      id: "2",
      name: "UI/UX Designers",
      type: "Design",
      memberCount: 1923,
      isActive: true,
      icon: <Palette className="h-5 w-5" />
    },
    {
      id: "3",
      name: "Startup Founders",
      type: "Business",
      memberCount: 756,
      isActive: false,
      icon: <Rocket className="h-5 w-5" />
    }
  ];

  const mockStats = {
    totalMembers: 127000,
    activeChats: 2800,
    teamsFormed: 15600,
    projectsCompleted: 8200
  };

  const getMatchTypeColor = (type: string) => {
    switch (type) {
      case 'AI Match':
        return 'bg-primary/20 text-primary';
      case 'Team Match':
        return 'bg-accent/20 text-accent';
      case 'Skill Boost':
        return 'bg-chart-5/20 text-chart-5';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const connectWithUser = useMutation({
    mutationFn: async (userId: string) => {
      // This would make an API call to connect with user
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Connection request sent!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
    },
  });

  const joinChatRoom = useMutation({
    mutationFn: async (roomId: string) => {
      // This would make an API call to join chat room
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Joined chat room successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join chat room",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Connect & <span className="gradient-text">Collaborate</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            AI-powered networking, real-time collaboration tools, and vibrant community spaces
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {mockStats.totalMembers.toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground">Active Members</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                {mockStats.activeChats.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Group Chats</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-chart-4 mb-2">
                {mockStats.teamsFormed.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Teams Formed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-chart-5 mb-2">
                {mockStats.projectsCompleted.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Projects Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations Banner */}
        <Card className="mb-12 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
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
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Recommendations
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Group Chats
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Collaboration
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Team Formation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI-Recommended Connections
                </CardTitle>
                <p className="text-muted-foreground">
                  People you should connect with based on shared interests and complementary skills
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockRecommendations.map((person) => (
                    <Card key={person.id} className="border border-border hover:border-primary/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={person.profileImageUrl} />
                            <AvatarFallback>
                              {person.firstName?.[0]}{person.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold">{person.firstName} {person.lastName}</h4>
                            <Badge className={getMatchTypeColor(person.matchType)}>
                              {person.matchScore}% {person.matchType}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4">{person.reason}</p>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {person.skills.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => connectWithUser.mutate(person.id)}
                            disabled={connectWithUser.isPending}
                            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                          <Button variant="outline" className="px-4">
                            View Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Chat Rooms List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Group Chats</CardTitle>
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search groups..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockChatRooms.map((room) => (
                        <div
                          key={room.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedChatRoom === room.id 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedChatRoom(room.id)}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                              {room.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{room.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {room.memberCount.toLocaleString()} members
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{room.type}</Badge>
                            {room.isActive && (
                              <div className="flex items-center gap-1 text-chart-4">
                                <div className="w-2 h-2 bg-chart-4 rounded-full animate-pulse" />
                                <span className="text-xs">Active</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Group
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Chat Interface */}
              <div className="lg:col-span-2">
                {selectedChatRoom ? (
                  <Chat roomId={selectedChatRoom} />
                ) : (
                  <Card className="h-96">
                    <CardContent className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Select a Chat Room</h3>
                        <p className="text-muted-foreground">Choose a group chat to start conversations</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="collaboration" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Virtual Whiteboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-chart-3" />
                    Virtual Whiteboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg h-48 mb-4 p-4 relative border">
                    <div className="text-gray-800 text-sm">
                      {/* Simulated whiteboard content */}
                      <div className="absolute top-4 left-4">
                        <div className="w-16 h-16 border-2 border-blue-500 rounded bg-blue-50"></div>
                        <span className="text-xs mt-1 block">Login</span>
                      </div>
                      <div className="absolute top-4 left-28">
                        <div className="w-16 h-16 border-2 border-green-500 rounded bg-green-50"></div>
                        <span className="text-xs mt-1 block">Dashboard</span>
                      </div>
                      <div className="absolute top-24 left-16">
                        <div className="w-16 h-16 border-2 border-purple-500 rounded bg-purple-50"></div>
                        <span className="text-xs mt-1 block">Profile</span>
                      </div>
                      {/* Arrows */}
                      <div className="absolute top-8 left-20 w-6 h-0.5 bg-gray-400"></div>
                      <div className="absolute top-16 left-12 w-0.5 h-6 bg-gray-400"></div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button className="flex-1 bg-chart-3 text-white hover:bg-chart-3/90">
                      Join Board
                    </Button>
                    <Button variant="outline" className="px-3">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Code Editor */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-chart-4" />
                    Collaborative Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 rounded-lg h-48 mb-4 p-4 text-sm font-mono overflow-hidden">
                    <div className="text-gray-400 mb-2">// Real-time collaborative editing</div>
                    <div className="text-blue-400">function <span className="text-yellow-400">createTeam</span>() {`{`}</div>
                    <div className="ml-4 text-gray-300">const team = {`{`}</div>
                    <div className="ml-8 text-green-400">name: <span className="text-orange-400">'AI Innovators'</span>,</div>
                    <div className="ml-8 text-green-400">members: <span className="text-purple-400">[]</span>,</div>
                    <div className="ml-8 text-green-400">skills: <span className="text-orange-400">['React', 'Python']</span></div>
                    <div className="ml-4 text-gray-300">{`};`}</div>
                    <div className="text-blue-400">{`}`}</div>
                    <div className="mt-2 text-gray-500">// User typing...</div>
                  </div>
                  <div className="flex space-x-2">
                    <Button className="flex-1 bg-chart-4 text-white hover:bg-chart-4/90">
                      Open Editor
                    </Button>
                    <Button variant="outline" className="px-3">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* File Sharing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-chart-5" />
                    File Sharing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 h-48 overflow-y-auto scrollbar-thin mb-4">
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-red-500" />
                        <div>
                          <div className="text-sm font-medium">project-spec.pdf</div>
                          <div className="text-xs text-muted-foreground">2.4 MB • Alex Chen</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded">
                      <div className="flex items-center space-x-3">
                        <Code className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="text-sm font-medium">app.js</div>
                          <div className="text-xs text-muted-foreground">156 KB • Sarah Kim</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded">
                      <div className="flex items-center space-x-3">
                        <Image className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="text-sm font-medium">mockup.png</div>
                          <div className="text-xs text-muted-foreground">8.9 MB • Mike Rodriguez</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full bg-chart-5 text-white hover:bg-chart-5/90">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="teams" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">AI-Powered Team Formation</CardTitle>
                <p className="text-center text-muted-foreground">
                  Let AI find the perfect teammates for your next project or hackathon
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">Skill Matching</h4>
                    <p className="text-sm text-muted-foreground">
                      AI analyzes your skills and finds complementary team members
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-accent" />
                    </div>
                    <h4 className="font-semibold mb-2">Team Dynamics</h4>
                    <p className="text-sm text-muted-foreground">
                      Creates balanced teams based on personality and work styles
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-chart-4/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="h-8 w-8 text-chart-4" />
                    </div>
                    <h4 className="font-semibold mb-2">Success Prediction</h4>
                    <p className="text-sm text-muted-foreground">
                      Predicts team success rate for better project outcomes
                    </p>
                  </div>
                </div>
                
                <div className="text-center mt-8">
                  <Button className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90">
                    <Zap className="h-4 w-4 mr-2" />
                    Find My Team
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
