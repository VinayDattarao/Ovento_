import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  Users, 
  Settings,
  Volume2,
  VolumeX,
  Headphones,
  Camera,
  Globe,
  Zap,
  Play,
  Square,
  BarChart3,
  MessageSquare,
  LogOut
} from "lucide-react";

export default function VirtualSpace() {
  const [isStreamLive, setIsStreamLive] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [vrMode, setVrMode] = useState(false);
  const [viewers, setViewers] = useState(1247);
  const [audioLevel, setAudioLevel] = useState([75]);

  // Mock poll data
  const [pollData, setPollData] = useState({
    question: "What's your favorite frontend framework?",
    options: [
      { name: "React", votes: 45, percentage: 45 },
      { name: "Vue.js", votes: 25, percentage: 25 },
      { name: "Angular", votes: 30, percentage: 30 }
    ],
    totalVotes: 347,
    timeRemaining: "2:34"
  });

  const [participants] = useState({
    vr: 23,
    ar: 156,
    web: 1068
  });

  useEffect(() => {
    // Simulate viewer count changes
    const interval = setInterval(() => {
      setViewers(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const toggleStream = () => {
    setIsStreamLive(!isStreamLive);
  };

  const toggleCamera = () => {
    setCameraEnabled(!cameraEnabled);
  };

  const toggleMic = () => {
    setMicEnabled(!micEnabled);
  };

  const toggleScreenShare = () => {
    setScreenSharing(!screenSharing);
  };

  const toggleVR = () => {
    setVrMode(!vrMode);
  };

  return (
    <div className="min-h-screen pt-20 virtual-space">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Immersive <span className="gradient-text">Virtual Experiences</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            VR/AR integration, live streaming, interactive environments, and real-time collaboration
          </p>
        </div>

        {/* Virtual Event Controls */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Live Stream Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isStreamLive ? 'bg-red-500 animate-pulse' : 'bg-muted'}`} />
                Live Stream Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Stream Preview */}
              <div className="bg-black rounded-lg mb-4 relative overflow-hidden aspect-video">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  {isStreamLive ? (
                    <div className="text-center">
                      <Video className="h-16 w-16 text-white mb-2 mx-auto" />
                      <p className="text-white text-sm">Live Stream Active</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <VideoOff className="h-16 w-16 text-muted-foreground mb-2 mx-auto" />
                      <p className="text-muted-foreground text-sm">Stream Offline</p>
                    </div>
                  )}
                </div>
                {isStreamLive && (
                  <>
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      LIVE
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      {viewers.toLocaleString()} viewers
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Camera
                  </span>
                  <Switch
                    checked={cameraEnabled}
                    onCheckedChange={toggleCamera}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Microphone
                  </span>
                  <Switch
                    checked={micEnabled}
                    onCheckedChange={toggleMic}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Screen Share
                  </span>
                  <Switch
                    checked={screenSharing}
                    onCheckedChange={toggleScreenShare}
                  />
                </div>
              </div>

              <Button
                onClick={toggleStream}
                className={`w-full ${isStreamLive 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-chart-4 hover:bg-chart-4/90 text-white'
                }`}
              >
                {isStreamLive ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    End Stream
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Stream
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* VR/AR Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-accent" />
                Immersive Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* VR Environment Preview */}
              <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg aspect-video mb-4 flex items-center justify-center relative border border-accent/30">
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-8 w-8 text-accent" />
                  </div>
                  <div className="text-sm text-accent font-medium">Virtual Auditorium</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Immersive 3D environment
                  </p>
                </div>
                <div className="absolute top-2 right-2 bg-accent/20 text-accent px-2 py-1 rounded text-xs border border-accent/30">
                  VR Ready
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <Button 
                  onClick={toggleVR}
                  className={`w-full ${vrMode 
                    ? 'bg-accent text-accent-foreground' 
                    : 'bg-accent/20 text-accent border border-accent/30'
                  }`}
                  variant={vrMode ? "default" : "outline"}
                >
                  <Headphones className="h-4 w-4 mr-2" />
                  {vrMode ? 'Exit VR Mode' : 'Enter VR Mode'}
                </Button>
                <Button variant="outline" className="w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  AR View
                </Button>
              </div>

              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VR Participants</span>
                  <span className="font-medium">{participants.vr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AR Viewers</span>
                  <span className="font-medium">{participants.ar}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Web Participants</span>
                  <span className="font-medium">{participants.web}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Polls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-chart-3" />
                Live Polls & Q&A
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Active Poll */}
              <div className="mb-6">
                <div className="mb-3">
                  <Badge variant="secondary" className="mb-2">Active Poll</Badge>
                  <p className="text-sm font-medium">{pollData.question}</p>
                </div>
                
                <div className="space-y-3">
                  {pollData.options.map((option, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{option.name}</span>
                        <span>{option.percentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            index === 0 ? 'bg-primary' : 
                            index === 1 ? 'bg-accent' : 
                            'bg-chart-3'
                          }`}
                          style={{ width: `${option.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 mb-4">
                <Button className="flex-1 bg-chart-3 text-white hover:bg-chart-3/90">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  New Poll
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Q&A
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                {pollData.totalVotes} responses • Poll ends in {pollData.timeRemaining}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3D Virtual Environment */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Virtual Event Space</CardTitle>
              <div className="flex space-x-2">
                <Button variant={!vrMode ? "default" : "outline"} size="sm">
                  Auditorium
                </Button>
                <Button variant="outline" size="sm">
                  Exhibition
                </Button>
                <Button variant="outline" size="sm">
                  Networking
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* 3D Environment Placeholder */}
            <div className="h-96 bg-gradient-to-b from-indigo-900/20 to-purple-900/20 rounded-xl relative overflow-hidden border border-primary/20">
              {/* Virtual environment visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Globe className="h-12 w-12 text-white" />
                  </div>
                  <div className="text-2xl font-bold mb-2">3D Virtual Environment</div>
                  <div className="text-muted-foreground mb-4">WebGL-powered immersive experience</div>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Play className="h-4 w-4 mr-2" />
                    Launch 3D View
                  </Button>
                </div>
              </div>

              {/* Floating UI Elements */}
              <div className="absolute top-4 left-4 glass-card p-3 rounded-lg">
                <div className="text-sm font-medium mb-1">Participants</div>
                <div className="text-2xl font-bold text-primary">{viewers.toLocaleString()}</div>
              </div>

              <div className="absolute top-4 right-4 glass-card p-3 rounded-lg">
                <div className="text-sm font-medium mb-1">Audio Quality</div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded ${
                        i < 4 ? 'bg-chart-4' : 'bg-muted'
                      }`}
                      style={{ height: `${12 + i * 4}px` }}
                    />
                  ))}
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <div className="glass-card p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant={micEnabled ? "outline" : "destructive"}
                        size="sm"
                        className="w-12 h-12 rounded-full p-0"
                        onClick={toggleMic}
                      >
                        {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                      </Button>
                      <Button
                        variant={cameraEnabled ? "outline" : "secondary"}
                        size="sm"
                        className="w-12 h-12 rounded-full p-0"
                        onClick={toggleCamera}
                      >
                        {cameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                      </Button>
                      <Button
                        variant={screenSharing ? "default" : "outline"}
                        size="sm"
                        className="w-12 h-12 rounded-full p-0"
                        onClick={toggleScreenShare}
                      >
                        <Monitor className="h-5 w-5" />
                      </Button>
                      
                      <div className="flex items-center space-x-2">
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                        <Slider
                          value={audioLevel}
                          onValueChange={setAudioLevel}
                          max={100}
                          step={1}
                          className="w-20"
                        />
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Speaking: <span className="text-foreground font-medium">Sarah Chen</span>
                    </div>
                    
                    <Button variant="destructive" size="sm">
                      <LogOut className="h-4 w-4 mr-2" />
                      Leave
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Virtual Environment Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="display" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="display">Display</TabsTrigger>
                <TabsTrigger value="audio">Audio</TabsTrigger>
                <TabsTrigger value="interaction">Interaction</TabsTrigger>
                <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
              </TabsList>

              <TabsContent value="display" className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">High Quality Rendering</h4>
                    <p className="text-sm text-muted-foreground">Enable advanced visual effects</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Motion Blur</h4>
                    <p className="text-sm text-muted-foreground">Smooth camera movements</p>
                  </div>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Field of View</h4>
                  <Slider defaultValue={[75]} max={120} min={60} step={5} />
                </div>
              </TabsContent>

              <TabsContent value="audio" className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Spatial Audio</h4>
                    <p className="text-sm text-muted-foreground">3D positional audio</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Noise Cancellation</h4>
                    <p className="text-sm text-muted-foreground">AI-powered background noise reduction</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Master Volume</h4>
                  <Slider defaultValue={[75]} max={100} min={0} step={1} />
                </div>
              </TabsContent>

              <TabsContent value="interaction" className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Hand Tracking</h4>
                    <p className="text-sm text-muted-foreground">Use hand gestures for interaction</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Voice Commands</h4>
                    <p className="text-sm text-muted-foreground">Control interface with voice</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Movement Speed</h4>
                  <Slider defaultValue={[50]} max={100} min={10} step={10} />
                </div>
              </TabsContent>

              <TabsContent value="accessibility" className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">High Contrast Mode</h4>
                    <p className="text-sm text-muted-foreground">Increase visual contrast</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Large Text</h4>
                    <p className="text-sm text-muted-foreground">Increase font size</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Motion Reduction</h4>
                    <p className="text-sm text-muted-foreground">Reduce motion effects</p>
                  </div>
                  <Switch />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
