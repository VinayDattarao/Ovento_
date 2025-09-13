import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { EventCard } from '@/components/EventCard';
import { Event } from '@/types';
import { User, Settings, Calendar, Trophy, Users, Target, Edit3, Save, X } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    skills: user?.skills || [],
    interests: user?.interests || []
  });

  // Fetch user's registered events
  const { data: userEvents = [] } = useQuery<Event[]>({
    queryKey: ['/api/events/user'],
    enabled: !!user,
  });

  // Fetch user's organized events
  const { data: organizedEvents = [] } = useQuery<Event[]>({
    queryKey: ['/api/events/organized'],
    enabled: !!user,
  });

  const registeredEvents = userEvents.filter(event => event.organizerId !== user?.id);
  const myOrganizedEvents = userEvents.filter(event => event.organizerId === user?.id);

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSkillAdd = (skill: string) => {
    if (skill && !editedProfile.skills.includes(skill)) {
      setEditedProfile(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const handleSkillRemove = (skill: string) => {
    setEditedProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleInterestAdd = (interest: string) => {
    if (interest && !editedProfile.interests.includes(interest)) {
      setEditedProfile(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }
  };

  const handleInterestRemove = (interest: string) => {
    setEditedProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleSave = () => {
    updateProfileMutation.mutate(editedProfile);
  };

  const handleCancel = () => {
    setEditedProfile({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      skills: user?.skills || [],
      interests: user?.interests || []
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
            <Button onClick={() => window.location.href = '/api/login'}>
              Log In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Profile Header */}
          <div className="mb-8">
            <Card className="glass-card">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user.profileImageUrl || ""} />
                    <AvatarFallback className="text-2xl">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                value={editedProfile.firstName}
                                onChange={(e) => setEditedProfile(prev => ({...prev, firstName: e.target.value}))}
                                placeholder="First Name"
                                className="w-32"
                              />
                              <Input
                                value={editedProfile.lastName}
                                onChange={(e) => setEditedProfile(prev => ({...prev, lastName: e.target.value}))}
                                placeholder="Last Name"
                                className="w-32"
                              />
                            </div>
                          </div>
                        ) : (
                          <h1 className="text-3xl font-bold">{user.firstName} {user.lastName}</h1>
                        )}
                        <p className="text-muted-foreground">{user.email}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <Button onClick={handleSave} size="sm" disabled={updateProfileMutation.isPending}>
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </Button>
                            <Button onClick={handleCancel} variant="outline" size="sm">
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {isEditing ? (
                        <Textarea
                          value={editedProfile.bio}
                          onChange={(e) => setEditedProfile(prev => ({...prev, bio: e.target.value}))}
                          placeholder="Tell us about yourself..."
                          className="min-h-[100px]"
                        />
                      ) : (
                        <p className="text-muted-foreground">
                          {user.bio || "No bio available. Edit your profile to add one!"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{registeredEvents.length}</div>
                    <div className="text-sm text-muted-foreground">Events Joined</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{myOrganizedEvents.length}</div>
                    <div className="text-sm text-muted-foreground">Events Organized</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-chart-3">{user.skills?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Skills</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-chart-5">{user.interests?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Interests</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="events">My Events</TabsTrigger>
              <TabsTrigger value="organized">Organized</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {(isEditing ? editedProfile.skills : user.skills || []).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-sm">
                            {skill}
                            {isEditing && (
                              <button 
                                onClick={() => handleSkillRemove(skill)}
                                className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </Badge>
                        ))}
                      </div>
                      {isEditing && (
                        <Input
                          placeholder="Add a skill and press Enter"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSkillAdd(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Interests */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Interests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {(isEditing ? editedProfile.interests : user.interests || []).map((interest) => (
                          <Badge key={interest} variant="outline" className="text-sm">
                            {interest}
                            {isEditing && (
                              <button 
                                onClick={() => handleInterestRemove(interest)}
                                className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </Badge>
                        ))}
                      </div>
                      {isEditing && (
                        <Input
                          placeholder="Add an interest and press Enter"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleInterestAdd(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Registered for AI Innovation Hackathon</p>
                        <p className="text-sm text-muted-foreground">2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Trophy className="w-5 h-5 text-accent" />
                      <div>
                        <p className="font-medium">Won 2nd place in Web3 Challenge</p>
                        <p className="text-sm text-muted-foreground">1 week ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Users className="w-5 h-5 text-chart-3" />
                      <div>
                        <p className="font-medium">Joined team "Code Warriors"</p>
                        <p className="text-sm text-muted-foreground">2 weeks ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">My Registered Events</h2>
                <Badge variant="outline">{registeredEvents.length} Events</Badge>
              </div>
              {registeredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {registeredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Events Registered</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't registered for any events yet. Start exploring!
                    </p>
                    <Button asChild>
                      <a href="/events">Browse Events</a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="organized" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Events I've Organized</h2>
                <Badge variant="outline">{myOrganizedEvents.length} Events</Badge>
              </div>
              {myOrganizedEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myOrganizedEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Events Organized</h3>
                    <p className="text-muted-foreground mb-4">
                      Ready to create your first event? Start organizing now!
                    </p>
                    <Button asChild>
                      <a href="/event-builder">Create Event</a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Account Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input value={user.email || ''} disabled className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Member since</label>
                      <p className="text-muted-foreground">January 2024</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Event reminders</label>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Team invitations</label>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Weekly digest</label>
                      <input type="checkbox" className="rounded" />
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