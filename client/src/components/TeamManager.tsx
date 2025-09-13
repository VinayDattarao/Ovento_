import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { Team, Event, User } from '@/types';
import { 
  Users, 
  Plus, 
  Copy, 
  UserPlus, 
  Settings, 
  Crown, 
  Code,
  GitBranch,
  Globe,
  Search,
  Filter,
  Star,
  ChevronRight
} from 'lucide-react';

interface TeamManagerProps {
  event: Event;
  userTeam?: Team;
  className?: string;
}

export default function TeamManager({ event, userTeam, className }: TeamManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [joinInviteCode, setJoinInviteCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  
  // Team creation form
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState(4);
  const [skillsNeeded, setSkillsNeeded] = useState<string>('');
  const [isOpenTeam, setIsOpenTeam] = useState(true);

  // Fetch event teams
  const { data: eventTeams = [] } = useQuery<Team[]>({
    queryKey: ['/api/events', event.id, 'teams'],
    queryFn: async () => {
      const response = await fetch(`/api/events/${event.id}/teams`);
      if (!response.ok) throw new Error('Failed to fetch teams');
      return response.json();
    },
  });

  // Fetch recommended teammates
  const { data: recommendedUsers = [] } = useQuery<User[]>({
    queryKey: ['/api/events', event.id, 'recommended-teammates'],
    queryFn: async () => {
      const response = await fetch(`/api/events/${event.id}/recommended-teammates`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user,
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (teamData: any) => {
      return apiRequest('POST', '/api/teams', {
        ...teamData,
        eventId: event.id,
        skillsNeeded: skillsNeeded.split(',').map(s => s.trim()).filter(Boolean),
      });
    },
    onSuccess: (newTeam) => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', event.id, 'teams'] });
      toast({
        title: "Team Created Successfully!",
        description: `Your team "${newTeam.name}" has been created. Share the invite code: ${newTeam.inviteCode}`,
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Team",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Join team mutation
  const joinTeamMutation = useMutation({
    mutationFn: async (inviteCode: string) => {
      return apiRequest('POST', '/api/teams/join-by-invite', { inviteCode });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', event.id, 'teams'] });
      toast({
        title: "Joined Team Successfully!",
        description: "Welcome to your new team!",
      });
      setIsJoinDialogOpen(false);
      setJoinInviteCode('');
    },
    onError: (error) => {
      toast({
        title: "Failed to Join Team",
        description: "Invalid invite code or team is full.",
        variant: "destructive",
      });
    },
  });

  // Leave team mutation
  const leaveTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      return apiRequest('POST', `/api/teams/${teamId}/leave`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', event.id, 'teams'] });
      toast({
        title: "Left Team",
        description: "You have left the team.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Leave Team",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTeamName('');
    setTeamDescription('');
    setMaxMembers(4);
    setSkillsNeeded('');
    setIsOpenTeam(true);
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Invite Code Copied!",
      description: "Share this code with your teammates.",
    });
  };

  const filteredTeams = eventTeams.filter(team => {
    const matchesSearch = searchQuery === '' || 
                         team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSkill = skillFilter === 'all' || 
                        team.skillsNeeded?.some(skill => 
                          skill.toLowerCase().includes(skillFilter.toLowerCase())
                        );
    
    return matchesSearch && matchesSkill;
  });

  const getTeamBadgeColor = (teamSize: number, maxSize: number) => {
    const ratio = teamSize / maxSize;
    if (ratio < 0.5) return 'bg-green-500';
    if (ratio < 0.8) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!event.allowTeams) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Individual Event</h3>
          <p className="text-muted-foreground">This event is for individual participants only.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Formation
              </CardTitle>
              <CardDescription>
                Form teams with up to {event.maxTeamSize} members for this {event.type}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!userTeam && (
                <>
                  <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Join Team
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Join Team with Invite Code</DialogTitle>
                        <DialogDescription>
                          Enter the invite code shared by your team leader.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="inviteCode">Invite Code</Label>
                          <Input
                            id="inviteCode"
                            placeholder="Enter invite code..."
                            value={joinInviteCode}
                            onChange={(e) => setJoinInviteCode(e.target.value.toUpperCase())}
                            className="font-mono"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => joinTeamMutation.mutate(joinInviteCode)}
                            disabled={!joinInviteCode || joinTeamMutation.isPending}
                            className="flex-1"
                          >
                            {joinTeamMutation.isPending ? 'Joining...' : 'Join Team'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsJoinDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Team
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create Your Team</DialogTitle>
                        <DialogDescription>
                          Set up your team for {event.title}. You'll get an invite code to share with teammates.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="teamName">Team Name *</Label>
                          <Input
                            id="teamName"
                            placeholder="Enter team name..."
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="teamDescription">Team Description</Label>
                          <Textarea
                            id="teamDescription"
                            placeholder="Describe your team's goals and approach..."
                            value={teamDescription}
                            onChange={(e) => setTeamDescription(e.target.value)}
                            rows={3}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="maxMembers">Max Members</Label>
                            <Select value={maxMembers.toString()} onValueChange={(v) => setMaxMembers(parseInt(v))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: event.maxTeamSize }, (_, i) => i + 1).map(num => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num} member{num > 1 ? 's' : ''}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>Team Visibility</Label>
                            <Select value={isOpenTeam ? 'open' : 'private'} onValueChange={(v) => setIsOpenTeam(v === 'open')}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open (Public)</SelectItem>
                                <SelectItem value="private">Invite Only</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="skillsNeeded">Skills Needed (comma-separated)</Label>
                          <Input
                            id="skillsNeeded"
                            placeholder="React, Python, UI/UX, Machine Learning..."
                            value={skillsNeeded}
                            onChange={(e) => setSkillsNeeded(e.target.value)}
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => createTeamMutation.mutate({
                              name: teamName,
                              description: teamDescription,
                              maxMembers,
                              isOpen: isOpenTeam,
                            })}
                            disabled={!teamName || createTeamMutation.isPending}
                            className="flex-1"
                          >
                            {createTeamMutation.isPending ? 'Creating...' : 'Create Team'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsCreateDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Team Status */}
          {userTeam && (
            <div className="border rounded-lg p-4 bg-primary/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{userTeam.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {userTeam.members?.length || 1} / {userTeam.maxMembers} members
                      {userTeam.leaderId === user?.id && " (You're the leader)"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Code className="w-4 h-4" />
                    <span className="font-mono bg-muted px-2 py-1 rounded">
                      {userTeam.inviteCode}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyInviteCode(userTeam.inviteCode!)}
                      className="h-6 w-6"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {userTeam.leaderId !== user?.id && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => leaveTeamMutation.mutate(userTeam.id)}
                      disabled={leaveTeamMutation.isPending}
                    >
                      Leave Team
                    </Button>
                  )}
                </div>
              </div>
              
              {userTeam.description && (
                <p className="text-sm text-muted-foreground mb-3">{userTeam.description}</p>
              )}
              
              {userTeam.skillsNeeded && userTeam.skillsNeeded.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {userTeam.skillsNeeded.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Team Members */}
              {userTeam.members && userTeam.members.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Team Members</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {userTeam.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {member.firstName?.[0]}{member.lastName?.[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {member.firstName} {member.lastName}
                            {member.id === userTeam.leaderId && (
                              <Crown className="w-3 h-3 inline ml-1 text-primary" />
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {member.skills?.slice(0, 2).join(', ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Teams Tabs */}
          <Tabs defaultValue="browse" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="browse">Browse Teams ({eventTeams.length})</TabsTrigger>
              <TabsTrigger value="recommended">Recommended ({recommendedUsers.length})</TabsTrigger>
              <TabsTrigger value="create-request">Find Teammates</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-4">
              {/* Search and Filter */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search teams..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={skillFilter} onValueChange={setSkillFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Skills</SelectItem>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="ml">Machine Learning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Teams Grid */}
              <div className="grid gap-4">
                {filteredTeams.map((team) => (
                  <Card key={team.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{team.name}</h3>
                            <div className={`w-2 h-2 rounded-full ${getTeamBadgeColor(team.members?.length || 0, team.maxMembers)}`} />
                            <span className="text-xs text-muted-foreground">
                              {team.members?.length || 0}/{team.maxMembers} members
                            </span>
                            {team.isOpen && (
                              <Badge variant="secondary" className="text-xs">Open</Badge>
                            )}
                          </div>
                          
                          {team.description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {team.description}
                            </p>
                          )}
                          
                          {team.skillsNeeded && team.skillsNeeded.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {team.skillsNeeded.slice(0, 4).map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {team.skillsNeeded.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{team.skillsNeeded.length - 4} more
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Crown className="w-3 h-3" />
                            <span>Led by {team.leader?.firstName} {team.leader?.lastName}</span>
                          </div>
                        </div>
                        
                        {!userTeam && team.isOpen && (team.members?.length || 0) < team.maxMembers && (
                          <Button size="sm" variant="outline">
                            Request to Join
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredTeams.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Teams Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || skillFilter !== 'all' 
                        ? "Try adjusting your search or filters" 
                        : "Be the first to create a team!"
                      }
                    </p>
                    {!userTeam && (
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Team
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="recommended" className="space-y-4">
              <div className="text-center py-8">
                <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Find Your Perfect Teammates</h3>
                <p className="text-muted-foreground">
                  AI-powered recommendations based on your skills and interests
                </p>
              </div>
            </TabsContent>

            <TabsContent value="create-request" className="space-y-4">
              <div className="text-center py-8">
                <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Looking for Teammates?</h3>
                <p className="text-muted-foreground mb-4">
                  Post what skills you're looking for and let others find you
                </p>
                <Button disabled>
                  Coming Soon
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}