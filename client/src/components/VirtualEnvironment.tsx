import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Settings, Maximize, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface VirtualEnvironmentProps {
  environmentId: string;
  isVideoOn: boolean;
  isAudioOn: boolean;
  isScreenSharing: boolean;
}

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isVideoOn: boolean;
  isAudioOn: boolean;
  position: { x: number; y: number; z: number };
}

export function VirtualEnvironment({
  environmentId,
  isVideoOn,
  isAudioOn,
  isScreenSharing
}: VirtualEnvironmentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [participants] = useState<Participant[]>([
    {
      id: '1',
      name: 'Alex Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      isVideoOn: true,
      isAudioOn: true,
      position: { x: -2, y: 0, z: 0 },
    },
    {
      id: '2',
      name: 'Sarah Kim',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      isVideoOn: true,
      isAudioOn: false,
      position: { x: 2, y: 0, z: 0 },
    },
    {
      id: '3',
      name: 'Mike Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      isVideoOn: false,
      isAudioOn: true,
      position: { x: 0, y: 0, z: -2 },
    },
  ]);

  const environments = {
    auditorium: {
      name: 'Virtual Auditorium',
      description: 'Large presentation space with stage',
      backgroundColor: '#1a1a2e',
      ambientColor: '#16213e',
    },
    classroom: {
      name: 'Interactive Classroom',
      description: 'Collaborative learning environment',
      backgroundColor: '#0f3460',
      ambientColor: '#16537e',
    },
    networking: {
      name: 'Networking Lounge',
      description: 'Casual space for conversations',
      backgroundColor: '#533483',
      ambientColor: '#7209b7',
    },
    exhibition: {
      name: 'Exhibition Hall',
      description: 'Virtual booths and demos',
      backgroundColor: '#2d1b69',
      ambientColor: '#402e7a',
    },
  };

  const currentEnvironment = environments[environmentId as keyof typeof environments] || environments.auditorium;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !window.THREE) return;

    const scene = new (window as any).THREE.Scene();
    const camera = new (window as any).THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new (window as any).THREE.WebGLRenderer({ canvas, alpha: true });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(currentEnvironment.backgroundColor, 1);

    // Set up lighting
    const ambientLight = new (window as any).THREE.AmbientLight(currentEnvironment.ambientColor, 0.6);
    scene.add(ambientLight);

    const directionalLight = new (window as any).THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create environment based on type
    if (environmentId === 'auditorium') {
      // Create stage
      const stageGeometry = new (window as any).THREE.BoxGeometry(10, 0.5, 4);
      const stageMaterial = new (window as any).THREE.MeshStandardMaterial({ color: 0x8b5cf6 });
      const stage = new (window as any).THREE.Mesh(stageGeometry, stageMaterial);
      stage.position.set(0, -2, -8);
      scene.add(stage);

      // Create seats
      for (let row = 0; row < 5; row++) {
        for (let seat = 0; seat < 10; seat++) {
          const seatGeometry = new (window as any).THREE.BoxGeometry(0.8, 0.8, 0.8);
          const seatMaterial = new (window as any).THREE.MeshStandardMaterial({ color: 0x4a5568 });
          const seatMesh = new (window as any).THREE.Mesh(seatGeometry, seatMaterial);
          seatMesh.position.set((seat - 5) * 1.2, -1.6, row * 2);
          scene.add(seatMesh);
        }
      }
    } else if (environmentId === 'classroom') {
      // Create desks
      for (let i = 0; i < 6; i++) {
        const deskGeometry = new (window as any).THREE.BoxGeometry(2, 0.1, 1);
        const deskMaterial = new (window as any).THREE.MeshStandardMaterial({ color: 0x8b7355 });
        const desk = new (window as any).THREE.Mesh(deskGeometry, deskMaterial);
        desk.position.set((i % 3 - 1) * 3, -1, Math.floor(i / 3) * 2 - 2);
        scene.add(desk);
      }

      // Create whiteboard
      const boardGeometry = new (window as any).THREE.PlaneGeometry(4, 2);
      const boardMaterial = new (window as any).THREE.MeshStandardMaterial({ color: 0xffffff });
      const board = new (window as any).THREE.Mesh(boardGeometry, boardMaterial);
      board.position.set(0, 1, -5);
      scene.add(board);
    }

    // Add participant avatars
    participants.forEach((participant) => {
      const avatarGeometry = new (window as any).THREE.SphereGeometry(0.5, 16, 16);
      const avatarMaterial = new (window as any).THREE.MeshStandardMaterial({ color: 0x7c3aed });
      const avatar = new (window as any).THREE.Mesh(avatarGeometry, avatarMaterial);
      avatar.position.set(participant.position.x, participant.position.y, participant.position.z);
      scene.add(avatar);

      // Add name label
      const canvas2d = document.createElement('canvas');
      canvas2d.width = 256;
      canvas2d.height = 64;
      const context = canvas2d.getContext('2d')!;
      context.fillStyle = '#ffffff';
      context.font = '24px Arial';
      context.textAlign = 'center';
      context.fillText(participant.name, 128, 35);

      const texture = new (window as any).THREE.CanvasTexture(canvas2d);
      const labelMaterial = new (window as any).THREE.SpriteMaterial({ map: texture });
      const label = new (window as any).THREE.Sprite(labelMaterial);
      label.position.set(participant.position.x, participant.position.y + 1.5, participant.position.z);
      label.scale.set(2, 0.5, 1);
      scene.add(label);
    });

    // Position camera
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    function animate() {
      requestAnimationFrame(animate);
      
      // Camera movement based on mouse
      camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
      camera.position.y += (mouseY * 2 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [environmentId, participants, currentEnvironment]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      canvasRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const resetCamera = () => {
    // Reset camera position logic would go here
    console.log('Resetting camera position');
  };

  return (
    <Card className="glass-card" data-testid="virtual-environment">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🌐</span>
              {currentEnvironment.name}
            </CardTitle>
            <CardDescription>{currentEnvironment.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-chart-4 border-chart-4">
              <Users className="w-3 h-3 mr-1" />
              {participants.length + 1} participants
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* 3D Environment Canvas */}
        <div className="relative mb-6">
          <canvas
            ref={canvasRef}
            className="w-full h-96 bg-gradient-to-b from-primary/20 to-secondary/20 rounded-xl"
            style={{ background: currentEnvironment.backgroundColor }}
          />
          
          {/* Overlay Controls */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            {/* Environment Info */}
            <div className="glass-card p-3 rounded-lg">
              <div className="text-sm font-medium mb-1">{currentEnvironment.name}</div>
              <div className="text-xs text-muted-foreground">
                Move mouse to look around • Click to interact
              </div>
            </div>

            {/* Quality Indicator */}
            <div className="glass-card p-3 rounded-lg">
              <div className="text-sm font-medium mb-1">Connection Quality</div>
              <div className="flex items-center space-x-1">
                <div className="w-1 h-4 bg-chart-4 rounded"></div>
                <div className="w-1 h-5 bg-chart-4 rounded"></div>
                <div className="w-1 h-6 bg-chart-4 rounded"></div>
                <div className="w-1 h-4 bg-chart-4 rounded"></div>
                <div className="w-1 h-3 bg-secondary rounded"></div>
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Media Controls */}
                  <Button
                    variant="outline"
                    size="icon"
                    className={isAudioOn ? 'bg-chart-4 text-white' : 'bg-destructive text-white'}
                    data-testid="button-toggle-audio"
                  >
                    {isAudioOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className={isVideoOn ? 'bg-chart-4 text-white' : 'bg-destructive text-white'}
                    data-testid="button-toggle-video"
                  >
                    📹
                  </Button>

                  <Button variant="outline" size="icon" data-testid="button-share-screen">
                    📺
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  Speaking: <span className="text-foreground font-medium">No one</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={resetCamera} data-testid="button-reset-camera">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  
                  <Button variant="outline" size="icon" data-testid="button-settings">
                    <Settings className="w-4 h-4" />
                  </Button>
                  
                  <Button variant="outline" size="icon" onClick={toggleFullscreen} data-testid="button-fullscreen">
                    <Maximize className="w-4 h-4" />
                  </Button>
                  
                  <Button variant="destructive" data-testid="button-leave-space">
                    Leave Space
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Participants List */}
        <div>
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Participants ({participants.length + 1})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Current User */}
            <div className="glass-card p-3 rounded-lg" data-testid="participant-current-user">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                    You
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${
                    isAudioOn ? 'bg-chart-4' : 'bg-destructive'
                  }`}>
                    {isAudioOn ? <Volume2 className="w-2 h-2 text-white" /> : <VolumeX className="w-2 h-2 text-white" />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">You</div>
                  <div className="text-xs text-muted-foreground">Host</div>
                </div>
              </div>
            </div>

            {/* Other Participants */}
            {participants.map((participant) => (
              <div key={participant.id} className="glass-card p-3 rounded-lg" data-testid={`participant-${participant.id}`}>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img 
                      src={participant.avatar} 
                      alt={participant.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${
                      participant.isAudioOn ? 'bg-chart-4' : 'bg-destructive'
                    }`}>
                      {participant.isAudioOn ? <Volume2 className="w-2 h-2 text-white" /> : <VolumeX className="w-2 h-2 text-white" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{participant.name}</div>
                    <div className="text-xs text-muted-foreground">Participant</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Environment Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{participants.length + 1}</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-chart-4">42ms</div>
            <div className="text-sm text-muted-foreground">Latency</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent">1080p</div>
            <div className="text-sm text-muted-foreground">Video Quality</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
