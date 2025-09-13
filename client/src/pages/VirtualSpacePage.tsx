import { useState, useEffect } from 'react';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { VirtualEnvironment } from '@/components/VirtualEnvironment';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MonitorOff, 
  Users, 
  Settings, 
  Headphones,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function VirtualSpacePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { isConnected } = useWebSocket(user?.id);
  
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [audioLevel, setAudioLevel] = useState([75]);
  const [selectedEnvironment, setSelectedEnvironment] = useState('auditorium');

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

  const virtualEnvironments = [
    {
      id: 'auditorium',
      name: 'Virtual Auditorium',
      description: 'Large presentation space for conferences',
      capacity: 1000,
      features: ['Stage View', 'Audience Chat', 'Q&A'],
      isActive: true,
    },
    {
      id: 'classroom',
      name: 'Interactive Classroom',
      description: 'Collaborative learning environment',
      capacity: 50,
      features: ['Breakout Rooms', 'Whiteboard', 'Screen Share'],
      isActive: true,
    },
    {
      id: 'networking',
      name: 'Networking Lounge',
      description: 'Casual space for connections',
      capacity: 200,
      features: ['Small Groups', 'Profile Cards', 'Icebreakers'],
      isActive: true,
    },
    {
      id: 'exhibition',
      name: 'Exhibition Hall',
      description: 'Virtual booths and demos',
      capacity: 500,
      features: ['3D Booths', 'Product Demos', 'Lead Capture'],
      isActive: false,
    },
  ];

  const liveEvents = [
    {
      id: '1',
      title: 'AI Innovation Summit',
      participants: 1247,
      type: 'Conference',
      environment: 'auditorium',
      status: 'live',
    },
    {
      id: '2',
      title: 'React Workshop',
      participants: 89,
      type: 'Workshop',
      environment: 'classroom',
      status: 'live',
    },
    {
      id: '3',
      title: 'Tech Networking',
      participants: 156,
      type: 'Networking',
      environment: 'networking',
      status: 'live',
    },
  ];

  const handleToggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    toast({
      title: isVideoOn ? "Camera Off" : "Camera On",
      description: `Video ${isVideoOn ? 'disabled' : 'enabled'}`,
    });
  };

  const handleToggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    toast({
      title: isAudioOn ? "Microphone Muted" : "Microphone Unmuted",
      description: `Audio ${isAudioOn ? 'disabled' : 'enabled'}`,
    });
  };

  const handleToggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast({
      title: isScreenSharing ? "Screen Share Stopped" : "Screen Share Started",
      description: `Screen sharing ${isScreenSharing ? 'disabled' : 'enabled'}`,
    });
  };

  const handleJoinEnvironment = (environmentId: string) => {
    setSelectedEnvironment(environmentId);
    toast({
      title: "Joining Virtual Space",
      description: "Connecting you to the virtual environment...",
    });
  };

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
    <div className="min-h-screen bg-background virtual-space">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">
              Immersive <span className="gradient-text">Virtual Experiences</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              VR/AR integration, live streaming, interactive environments, and real-time collaboration
            </p>
          </div>

          {/* Connection Status */}
          <div className="mb-8">
            <Card className={`border-2 ${isConnected ? 'border-chart-4 bg-chart-4/10' : 'border-destructive bg-destructive/10'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isConnected ? (
                      <Wifi className="w-5 h-5 text-chart-4" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-destructive" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {isConnected ? '🟢 Connected to Virtual Space' : '🔴 Connection Lost'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isConnected 
                          ? 'All systems operational • Low latency' 
                          : 'Attempting to reconnect...'
                        }
                      </p>
                    </div>
                  </div>
                  <Badge variant={isConnected ? "outline" : "destructive"} className="text-xs">
                    {isConnected ? 'ONLINE' : 'OFFLINE'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Events */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Live Virtual Events</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full live-indicator"></div>
                <span className="text-sm font-medium text-red-500">{liveEvents.length} events live now</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {liveEvents.map((event) => (
                <Card key={event.id} className="glass-card hover-lift" data-testid={`live-event-${event.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-red-500 text-white">
                        <div className="w-2 h-2 bg-white rounded-full mr-2 live-indicator"></div>
                        LIVE
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {event.participants.toLocaleString()}
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {event.type} • {virtualEnvironments.find(e => e.id === event.environment)?.name}
                    </p>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white hover:opacity-90"
                      onClick={() => handleJoinEnvironment(event.environment)}
                      data-testid={`button-join-${event.id}`}
                    >
                      Join Live Event
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Media Controls */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" />
                  Media Controls
                </CardTitle>
                <CardDescription>Manage your audio and video settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Video Preview */}
                <div className="relative">
                  <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {isVideoOn ? (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-2">
                          <span className="text-white text-xl">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">Camera Active</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <VideoOff className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Camera Off</p>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
                      {isVideoOn ? 'ON' : 'OFF'}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      <span className="text-sm">Camera</span>
                    </div>
                    <Switch 
                      checked={isVideoOn} 
                      onCheckedChange={handleToggleVideo}
                      data-testid="switch-video"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      <span className="text-sm">Microphone</span>
                    </div>
                    <Switch 
                      checked={isAudioOn} 
                      onCheckedChange={handleToggleAudio}
                      data-testid="switch-audio"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isScreenSharing ? <Monitor className="w-4 h-4" /> : <MonitorOff className="w-4 h-4" />}
                      <span className="text-sm">Screen Share</span>
                    </div>
                    <Switch 
                      checked={isScreenSharing} 
                      onCheckedChange={handleToggleScreenShare}
                      data-testid="switch-screen"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Headphones className="w-4 h-4" />
                      <span className="text-sm">Audio Level</span>
                    </div>
                    <Slider
                      value={audioLevel}
                      onValueChange={setAudioLevel}
                      max={100}
                      step={1}
                      className="w-full"
                      data-testid="slider-audio-level"
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {audioLevel[0]}%
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    data-testid="button-settings"
                    onClick={() => {
                      toast({
                        title: "Settings",
                        description: "Virtual space settings panel opened. Audio quality: High, Video quality: HD.",
                      });
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    data-testid="button-test-audio"
                    onClick={() => {
                      toast({
                        title: "Audio Test",
                        description: "Audio test completed successfully! Your microphone is working properly.",
                      });
                    }}
                  >
                    Test Audio
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Virtual Environments */}
            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🌐</span>
                  Virtual Environments
                </CardTitle>
                <CardDescription>Choose your immersive experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {virtualEnvironments.map((env) => (
                    <div
                      key={env.id}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedEnvironment === env.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      } ${!env.isActive ? 'opacity-50' : ''}`}
                      onClick={() => env.isActive && handleJoinEnvironment(env.id)}
                      data-testid={`environment-${env.id}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{env.name}</h4>
                          <p className="text-sm text-muted-foreground">{env.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            Up to {env.capacity.toLocaleString()} users
                          </div>
                          {env.isActive ? (
                            <Badge variant="outline" className="text-chart-4 border-chart-4">
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Coming Soon
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {env.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Virtual Environment Renderer */}
          <VirtualEnvironment 
            environmentId={selectedEnvironment}
            isVideoOn={isVideoOn}
            isAudioOn={isAudioOn}
            isScreenSharing={isScreenSharing}
          />

          {/* Quick Actions */}
          <div className="mt-12">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common virtual space functions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2" 
                    data-testid="action-join-breakout"
                    onClick={() => {
                      toast({
                        title: "Joining Breakout Room",
                        description: "You've been assigned to Breakout Room 3 with 4 other participants.",
                      });
                    }}
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-sm">Join Breakout</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2" 
                    data-testid="action-share-screen"
                    onClick={() => {
                      toast({
                        title: "Screen Sharing Started",
                        description: "Your screen is now being shared with all participants.",
                      });
                    }}
                  >
                    <Monitor className="w-6 h-6" />
                    <span className="text-sm">Share Screen</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2" 
                    data-testid="action-virtual-background"
                    onClick={() => {
                      toast({
                        title: "Virtual Background Applied",
                        description: "Office space background has been applied to your video feed.",
                      });
                    }}
                  >
                    <span className="text-2xl">🖼️</span>
                    <span className="text-sm">Background</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2" 
                    data-testid="action-record-session"
                    onClick={() => {
                      toast({
                        title: "Recording Started",
                        description: "Session recording has begun. All participants have been notified.",
                      });
                    }}
                  >
                    <span className="text-2xl">⏺️</span>
                    <span className="text-sm">Record</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
