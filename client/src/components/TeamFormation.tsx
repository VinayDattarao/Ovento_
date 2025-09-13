import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Event } from '@/types';
import { 
  Users, UserPlus, Copy, Search, Star, Trophy, 
  Clock, CheckCircle, X, Crown, Shield 
} from 'lucide-react';

interface Team {
  id: string;
  name: string;
  inviteCode: string;
  leaderId: string;
  leaderName: string;
  members: TeamMember[];
  maxMembers: number;
  description?: string;
  lookingFor?: string[];
  skills?: string[];
  isPrivate: boolean;
  createdAt: string;
}

interface TeamMember {
  id: string;
  userId: string;
  userName: string;
  userSkills?: string[];
  role: 'leader' | 'member';
  joinedAt: string;
}

interface TeamFormationProps {
  event: Event;
}

export function TeamFormation({ event }: TeamFormationProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [lookingForSkills, setLookingForSkills] = useState<string[]>([]);
  const [joinCode, setJoinCode] = useState('');

  // Fetch teams for this event
  const { data: teams = [], isLoading } = useQuery<Team[]>({
    queryKey: ['/api/events', event.id, 'teams'],
    queryFn: async () => {
      const response = await fetch(`/api/events/${event.id}/teams`);
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Check if user is already in a team for this event
  const userTeam = teams.find(team => 
    team.members.some(member => member.userId === user?.id)
  );

  const createTeamMutation = useMutation({
    mutationFn: async (teamData: { name: string; description?: string; lookingFor?: string[] }) => {
      const response = await fetch(`/api/events/${event.id}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create team');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', event.id, 'teams'] });
      setShowCreateDialog(false);
      setNewTeamName('');
      setNewTeamDescription('');
      setLookingForSkills([]);
      toast({
        title: "Team Created!",
        description: "Your team has been created successfully. Share the invite code with potential teammates.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Team",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const joinTeamMutation = useMutation({
    mutationFn: async (inviteCode: string) => {
      const response = await fetch(`/api/teams/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to join team');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', event.id, 'teams'] });
      setJoinCode('');
      toast({
        title: "Joined Team!",
        description: "You have successfully joined the team.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Join Team",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const leaveTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const response = await fetch(`/api/teams/${teamId}/leave`, {
        method: 'POST',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to leave team');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', event.id, 'teams'] });
      toast({
        title: "Left Team",
        description: "You have left the team.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Leave Team",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyInviteCode = (inviteCode: string) => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: "Invite Code Copied!",
      description: "Share this code with your teammates.",
    });
  };

  const filteredTeams = teams.filter(team => {
    if (searchTerm === '') return true;
    return team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           team.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           team.lookingFor?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const availableTeams = filteredTeams.filter(team => 
    team.members.length < team.maxMembers && !team.isPrivate
  );

  const addLookingForSkill = (skill: string) => {
    if (skill && !lookingForSkills.includes(skill)) {
      setLookingForSkills(prev => [...prev, skill]);
    }
  };

  const removeLookingForSkill = (skill: string) => {
    setLookingForSkills(prev => prev.filter(s => s !== skill));
  };

  if (!event.allowTeams) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Individual Event</h3>
          <p className="text-muted-foreground">
            This event is for individual participants only.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (userTeam) {
    return (
      <div className="space-y-6">
        {/* My Team Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                My Team: {userTeam.name}
              </div>
              <Badge variant="secondary">
                {userTeam.members.length}/{userTeam.maxMembers} Members
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Team Members */}
            <div>
              <label className="text-sm font-medium">Team Members</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {userTeam.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {member.userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {member.userName}
                        {member.role === 'leader' && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      {member.userSkills && member.userSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.userSkills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {member.userSkills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.userSkills.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invite Code */}
            <div>
              <label className="text-sm font-medium">Invite Code</label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={userTeam.inviteCode}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyInviteCode(userTeam.inviteCode)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Share this code with potential teammates
              </p>
            </div>

            {/* Team Actions */}
            <div className="flex gap-2 pt-4 border-t">
              {userTeam.leaderId === user?.id ? (
                <Button variant="outline" size="sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Manage Team
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => leaveTeamMutation.mutate(userTeam.id)}
                  disabled={leaveTeamMutation.isPending}
                >
                  Leave Team
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Teams</TabsTrigger>
          <TabsTrigger value="create">Create Team</TabsTrigger>
          <TabsTrigger value="join">Join with Code</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search teams by name, description, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {availableTeams.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Available Teams</h3>
                <p className="text-muted-foreground mb-4">
                  No teams are currently looking for members. Why not create your own?
                </p>
                <Button onClick={() => setActiveTab('create')}>
                  Create Team
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableTeams.map((team) => (
                <Card key={team.id} className="hover:border-primary/20 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <Badge variant="outline">
                        {team.members.length}/{team.maxMembers}
                      </Badge>
                    </div>
                    {team.description && (
                      <p className="text-sm text-muted-foreground">{team.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Team Leader */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">TEAM LEADER</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {team.leaderName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{team.leaderName}</span>
                      </div>
                    </div>

                    {/* Looking For */}
                    {team.lookingFor && team.lookingFor.length > 0 && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">LOOKING FOR</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {team.lookingFor.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {team.lookingFor.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{team.lookingFor.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Join Button */}
                    <div className="pt-2">
                      <Button
                        className="w-full"
                        onClick={() => joinTeamMutation.mutate(team.inviteCode)}
                        disabled={joinTeamMutation.isPending}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Join Team
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Team Name *</label>
                <Input
                  placeholder="Enter your team name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Brief description of your team and goals"
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Looking for Skills</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Add skill and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addLookingForSkill(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {lookingForSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-sm">
                      {skill}
                      <button 
                        onClick={() => removeLookingForSkill(skill)}
                        className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => createTeamMutation.mutate({
                  name: newTeamName,
                  description: newTeamDescription || undefined,
                  lookingFor: lookingForSkills.length > 0 ? lookingForSkills : undefined
                })}
                disabled={!newTeamName || createTeamMutation.isPending}
              >
                {createTeamMutation.isPending ? 'Creating...' : 'Create Team'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="join" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Join Team with Invite Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Invite Code *</label>
                <Input
                  placeholder="Enter the team invite code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="mt-1 font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ask your team leader for the invite code
                </p>
              </div>

              <Button
                className="w-full"
                onClick={() => joinTeamMutation.mutate(joinCode)}
                disabled={!joinCode || joinTeamMutation.isPending}
              >
                {joinTeamMutation.isPending ? 'Joining...' : 'Join Team'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}