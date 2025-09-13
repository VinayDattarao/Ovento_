import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Event } from '@/types';
import { 
  CheckCircle, X, User, Users, FileText, CreditCard, 
  AlertCircle, ChevronRight, ChevronLeft, Star, Plus, Minus
} from 'lucide-react';
import { Link } from 'wouter';
import { formatCurrencyINR } from "@/lib/utils";

interface RegistrationWizardProps {
  event: Event;
  onComplete: () => void;
  onCancel: () => void;
}

interface RegistrationData {
  // Personal Information
  bio?: string;
  skills: string[];
  interests: string[];
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  
  // Event-specific
  motivation?: string;
  experience?: string;
  teamPreference: 'individual' | 'team' | 'either';
  teamName?: string;
  teamInviteCode?: string;
  lookingForTeammates?: boolean;
  
  // Requirements
  agreesToTerms: boolean;
  agreesToCodeOfConduct: boolean;
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
  emergencyContact?: string;
  
  // Payment
  paymentMethod?: 'card' | 'upi' | 'wallet';
}

const initialData: RegistrationData = {
  skills: [],
  interests: [],
  teamPreference: 'either',
  lookingForTeammates: false,
  agreesToTerms: false,
  agreesToCodeOfConduct: false,
};

export function RegistrationWizard({ event, onComplete, onCancel }: RegistrationWizardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState<RegistrationData>(initialData);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const totalSteps = event.registrationFee && parseFloat(event.registrationFee) > 0 ? 5 : 4;

  // Check if user meets requirements
  const { data: profileCheck } = useQuery({
    queryKey: ['/api/profile/check', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/profile/check');
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user,
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      const response = await fetch(`/api/events/${event.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Registration Successful!",
        description: "You have been registered for this event. Check your email for confirmation.",
      });
      onComplete();
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addSkill = (skill: string) => {
    if (skill && !registrationData.skills.includes(skill)) {
      setRegistrationData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setRegistrationData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addInterest = (interest: string) => {
    if (interest && !registrationData.interests.includes(interest)) {
      setRegistrationData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setRegistrationData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const canProceed = (step: number) => {
    switch (step) {
      case 1:
        return registrationData.bio && registrationData.skills.length >= 2;
      case 2:
        return registrationData.motivation && registrationData.experience;
      case 3:
        if (event.allowTeams && registrationData.teamPreference === 'team') {
          return registrationData.teamName || registrationData.teamInviteCode;
        }
        return true;
      case 4:
        return registrationData.agreesToTerms && registrationData.agreesToCodeOfConduct;
      case 5:
        return registrationData.paymentMethod;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (canProceed(currentStep)) {
      registerMutation.mutate(registrationData);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step < currentStep ? 'bg-green-500 text-white' : 
            step === currentStep ? 'bg-primary text-white' : 
            'bg-muted text-muted-foreground'
          }`}>
            {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
          </div>
          {step < totalSteps && (
            <div className={`w-8 h-0.5 mx-2 ${
              step < currentStep ? 'bg-green-500' : 'bg-muted'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {renderStepIndicator()}

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStep === 1 && <User className="w-5 h-5" />}
            {currentStep === 2 && <FileText className="w-5 h-5" />}
            {currentStep === 3 && <Users className="w-5 h-5" />}
            {currentStep === 4 && <CheckCircle className="w-5 h-5" />}
            {currentStep === 5 && <CreditCard className="w-5 h-5" />}
            Step {currentStep} of {totalSteps}: {
              currentStep === 1 ? 'Profile Information' :
              currentStep === 2 ? 'Event Application' :
              currentStep === 3 ? 'Team Preferences' :
              currentStep === 4 ? 'Terms & Requirements' :
              'Payment'
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Profile Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium">Bio *</label>
                <Textarea
                  placeholder="Tell us about yourself, your background, and what excites you..."
                  value={registrationData.bio || ''}
                  onChange={(e) => setRegistrationData(prev => ({...prev, bio: e.target.value}))}
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Skills * (minimum 2)</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Add a skill and press Enter"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSkill(newSkill);
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => addSkill(newSkill)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {registrationData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-sm">
                      {skill}
                      <button 
                        onClick={() => removeSkill(skill)}
                        className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Interests</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Add an interest and press Enter"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addInterest(newInterest);
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => addInterest(newInterest)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {registrationData.interests.map((interest) => (
                    <Badge key={interest} variant="outline" className="text-sm">
                      {interest}
                      <button 
                        onClick={() => removeInterest(interest)}
                        className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Portfolio URL</label>
                  <Input
                    placeholder="https://yourportfolio.com"
                    value={registrationData.portfolioUrl || ''}
                    onChange={(e) => setRegistrationData(prev => ({...prev, portfolioUrl: e.target.value}))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">LinkedIn URL</label>
                  <Input
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={registrationData.linkedinUrl || ''}
                    onChange={(e) => setRegistrationData(prev => ({...prev, linkedinUrl: e.target.value}))}
                    className="mt-1"
                  />
                </div>
              </div>

              {!canProceed(1) && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                    <div className="text-sm text-orange-700">
                      Please complete all required fields:
                      {!registrationData.bio && <div>• Bio is required</div>}
                      {registrationData.skills.length < 2 && <div>• At least 2 skills are required</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Event Application */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium">Why do you want to participate in this event? *</label>
                <Textarea
                  placeholder="Share your motivation and what you hope to achieve..."
                  value={registrationData.motivation || ''}
                  onChange={(e) => setRegistrationData(prev => ({...prev, motivation: e.target.value}))}
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Relevant experience *</label>
                <Textarea
                  placeholder="Tell us about your relevant experience and background..."
                  value={registrationData.experience || ''}
                  onChange={(e) => setRegistrationData(prev => ({...prev, experience: e.target.value}))}
                  className="mt-1 min-h-[100px]"
                />
              </div>

              {event.requirements && event.requirements.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Event Requirements</label>
                  <div className="mt-2 space-y-2">
                    {event.requirements.map((req, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Team Preferences */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium">Team Preference *</label>
                <Select 
                  value={registrationData.teamPreference} 
                  onValueChange={(value: 'individual' | 'team' | 'either') => 
                    setRegistrationData(prev => ({...prev, teamPreference: value}))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">I want to participate individually</SelectItem>
                    {event.allowTeams && <SelectItem value="team">I want to join/form a team</SelectItem>}
                    {event.allowTeams && <SelectItem value="either">I'm flexible (individual or team)</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              {event.allowTeams && registrationData.teamPreference === 'team' && (
                <Tabs defaultValue="create" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="create">Create Team</TabsTrigger>
                    <TabsTrigger value="join">Join Team</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="create" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Team Name *</label>
                      <Input
                        placeholder="Enter your team name"
                        value={registrationData.teamName || ''}
                        onChange={(e) => setRegistrationData(prev => ({...prev, teamName: e.target.value}))}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="looking-for-teammates"
                        checked={registrationData.lookingForTeammates}
                        onCheckedChange={(checked) => 
                          setRegistrationData(prev => ({...prev, lookingForTeammates: !!checked}))
                        }
                      />
                      <label htmlFor="looking-for-teammates" className="text-sm">
                        I'm looking for teammates to join my team
                      </label>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="join" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Team Invite Code *</label>
                      <Input
                        placeholder="Enter the team invite code"
                        value={registrationData.teamInviteCode || ''}
                        onChange={(e) => setRegistrationData(prev => ({...prev, teamInviteCode: e.target.value}))}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Ask your team leader for the invite code
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              )}

              {event.maxTeamSize && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <strong>Team Size Limit:</strong> Maximum {event.maxTeamSize} members per team
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Terms & Requirements */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={registrationData.agreesToTerms}
                    onCheckedChange={(checked) => 
                      setRegistrationData(prev => ({...prev, agreesToTerms: !!checked}))
                    }
                  />
                  <label htmlFor="terms" className="text-sm">
                    I agree to the <Link href="/terms" className="text-primary hover:underline">Terms and Conditions</Link> *
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="code-of-conduct"
                    checked={registrationData.agreesToCodeOfConduct}
                    onCheckedChange={(checked) => 
                      setRegistrationData(prev => ({...prev, agreesToCodeOfConduct: !!checked}))
                    }
                  />
                  <label htmlFor="code-of-conduct" className="text-sm">
                    I agree to the <Link href="/code-of-conduct" className="text-primary hover:underline">Code of Conduct</Link> *
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Dietary Restrictions</label>
                <Input
                  placeholder="Any dietary restrictions or food allergies?"
                  value={registrationData.dietaryRestrictions || ''}
                  onChange={(e) => setRegistrationData(prev => ({...prev, dietaryRestrictions: e.target.value}))}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Accessibility Needs</label>
                <Input
                  placeholder="Any accessibility accommodations needed?"
                  value={registrationData.accessibilityNeeds || ''}
                  onChange={(e) => setRegistrationData(prev => ({...prev, accessibilityNeeds: e.target.value}))}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Emergency Contact</label>
                <Input
                  placeholder="Name and phone number of emergency contact"
                  value={registrationData.emergencyContact || ''}
                  onChange={(e) => setRegistrationData(prev => ({...prev, emergencyContact: e.target.value}))}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Step 5: Payment */}
          {currentStep === 5 && event.registrationFee && parseFloat(event.registrationFee) > 0 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{formatCurrencyINR(parseFloat(event.registrationFee))}</div>
                  <div className="text-sm text-muted-foreground">Registration Fee</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Payment Method *</label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {['card', 'upi', 'wallet'].map((method) => (
                    <Button
                      key={method}
                      type="button"
                      variant={registrationData.paymentMethod === method ? "default" : "outline"}
                      onClick={() => setRegistrationData(prev => ({...prev, paymentMethod: method as any}))}
                      className="h-12"
                    >
                      {method === 'card' && '💳 Card'}
                      {method === 'upi' && '📱 UPI'}
                      {method === 'wallet' && '💰 Wallet'}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <div className="text-sm text-yellow-700">
                    <strong>Prototype Mode:</strong> Payment processing is simulated. No real charges will be made.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onCancel : handlePrevious}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed(currentStep)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed(currentStep) || registerMutation.isPending}
                className="bg-primary"
              >
                {registerMutation.isPending ? 'Registering...' : 'Complete Registration'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}