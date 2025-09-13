import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { Event, User } from '@/types';
import { 
  FileText, 
  User as UserIcon, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Users,
  Trophy,
  Target,
  Lightbulb,
  Upload,
  X,
  Plus
} from 'lucide-react';

interface ApplicationQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'file';
  required: boolean;
  options?: string[];
}

interface ApplicationFlowProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplicationFlow({ event, isOpen, onClose }: ApplicationFlowProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Mock application questions for the event
  const applicationQuestions: ApplicationQuestion[] = [
    {
      id: 'experience',
      question: 'What is your experience level with hackathons?',
      type: 'select',
      required: true,
      options: ['First time participant', 'Some experience (1-3 hackathons)', 'Experienced (4+ hackathons)', 'Expert level']
    },
    {
      id: 'motivation',
      question: 'Why do you want to participate in this event? What do you hope to achieve?',
      type: 'textarea',
      required: true
    },
    {
      id: 'skills',
      question: 'What are your primary skills and technologies?',
      type: 'multiselect',
      required: true,
      options: ['JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning', 'UI/UX Design', 'Mobile Development', 'DevOps', 'Blockchain', 'Data Science']
    },
    {
      id: 'portfolio',
      question: 'Please share your portfolio, GitHub profile, or previous work samples',
      type: 'text',
      required: false
    },
    {
      id: 'resume',
      question: 'Upload your resume (optional)',
      type: 'file',
      required: false
    }
  ];

  const steps = [
    { id: 'profile', title: 'Profile Review', icon: UserIcon },
    { id: 'application', title: 'Application', icon: FileText },
    { id: 'team', title: 'Team Setup', icon: Users },
    { id: 'confirmation', title: 'Confirmation', icon: CheckCircle }
  ];

  useEffect(() => {
    if (user) {
      // Calculate profile completion
      const requiredFields = ['firstName', 'lastName', 'skills', 'bio'];
      const completedFields = requiredFields.filter(field => 
        user[field as keyof User] && 
        (Array.isArray(user[field as keyof User]) ? 
          (user[field as keyof User] as any[]).length > 0 : 
          user[field as keyof User]
        )
      );
      setProfileCompletion((completedFields.length / requiredFields.length) * 100);
    }
  }, [user]);

  const submitApplicationMutation = useMutation({
    mutationFn: async (applicationData: any) => {
      return apiRequest('POST', `/api/events/${event.id}/register`, applicationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Application Submitted!",
        description: "Your application has been submitted successfully. You'll receive a confirmation email shortly.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Application Failed",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (questionId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const applicationData = {
      ...formData,
      teamId: selectedTeam || undefined,
      profileData: {
        skills: user?.skills || [],
        experience: formData.experience,
        motivation: formData.motivation
      }
    };

    submitApplicationMutation.mutate(applicationData);
  };

  const renderQuestion = (question: ApplicationQuestion) => {
    const value = formData[question.id] || '';

    switch (question.type) {
      case 'text':
        return (
          <Input
            placeholder="Enter your answer..."
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
          />
        );

      case 'textarea':
        return (
          <Textarea
            placeholder="Enter your detailed answer..."
            value={value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            rows={4}
          />
        );

      case 'select':
        return (
          <Select value={value} onValueChange={(v) => handleInputChange(question.id, v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {selectedValues.map((selected: string) => (
                <Badge key={selected} variant="default" className="flex items-center gap-1">
                  {selected}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => {
                      const newValues = selectedValues.filter(v => v !== selected);
                      handleInputChange(question.id, newValues);
                    }}
                  />
                </Badge>
              ))}
            </div>
            <Select onValueChange={(v) => {
              if (!selectedValues.includes(v)) {
                handleInputChange(question.id, [...selectedValues, v]);
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Add skills..." />
              </SelectTrigger>
              <SelectContent>
                {question.options?.filter(option => !selectedValues.includes(option)).map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'file':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, DOC, DOCX up to 10MB
            </p>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleInputChange(question.id, file);
                }
              }}
              className="hidden"
              id={`file-${question.id}`}
            />
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => document.getElementById(`file-${question.id}`)?.click()}
            >
              Choose File
            </Button>
            {value && (
              <p className="text-sm text-green-600 mt-2">
                File selected: {value.name}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Profile Review
        return (
          <div className="space-y-6">
            <div className="text-center">
              <UserIcon className="w-16 h-16 mx-auto text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Review Your Profile</h3>
              <p className="text-muted-foreground">
                Let's make sure your profile is complete for the best application experience
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Profile Completion
                  <Badge variant={profileCompletion === 100 ? 'default' : 'secondary'}>
                    {Math.round(profileCompletion)}% Complete
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={profileCompletion} className="mb-4" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <p className="text-sm text-muted-foreground">
                      {user?.firstName} {user?.lastName}
                      {(!user?.firstName || !user?.lastName) && (
                        <AlertCircle className="w-4 h-4 inline text-orange-500 ml-2" />
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <Label>Skills</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user?.skills && user.skills.length > 0 ? (
                        user.skills.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground flex items-center">
                          No skills added
                          <AlertCircle className="w-4 h-4 text-orange-500 ml-2" />
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label>Bio</Label>
                    <p className="text-sm text-muted-foreground">
                      {user?.bio || (
                        <span className="flex items-center">
                          No bio added
                          <AlertCircle className="w-4 h-4 text-orange-500 ml-2" />
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {profileCompletion < 100 && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-700">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Complete your profile to improve your application</span>
                    </div>
                    <p className="text-sm text-orange-600 mt-1">
                      A complete profile helps organizers understand your background and skills.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 1: // Application Questions
        return (
          <div className="space-y-6">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Application Questions</h3>
              <p className="text-muted-foreground">
                Please answer the following questions to complete your application
              </p>
            </div>

            <div className="space-y-6">
              {applicationQuestions.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span>
                        Question {index + 1}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                      <Badge variant="outline">
                        {question.type}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {question.question}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderQuestion(question)}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2: // Team Setup
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Team Setup</h3>
              <p className="text-muted-foreground">
                {event.allowTeams ? 
                  'Choose to join an existing team or participate individually' :
                  'This event is for individual participants only'
                }
              </p>
            </div>

            {event.allowTeams && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className={`cursor-pointer transition-colors ${selectedTeam === '' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setSelectedTeam('')}>
                    <CardContent className="p-6 text-center">
                      <UserIcon className="w-8 h-8 mx-auto mb-3 text-primary" />
                      <h4 className="font-semibold mb-2">Individual Participation</h4>
                      <p className="text-sm text-muted-foreground">
                        Participate on your own and get matched with other individuals
                      </p>
                    </CardContent>
                  </Card>

                  <Card className={`cursor-pointer transition-colors ${selectedTeam === 'create' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setSelectedTeam('create')}>
                    <CardContent className="p-6 text-center">
                      <Plus className="w-8 h-8 mx-auto mb-3 text-primary" />
                      <h4 className="font-semibold mb-2">Create New Team</h4>
                      <p className="text-sm text-muted-foreground">
                        Create a team and invite others to join
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {selectedTeam === 'create' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Team Details</CardTitle>
                      <CardDescription>
                        Set up your team information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="teamName">Team Name</Label>
                        <Input
                          id="teamName"
                          placeholder="Enter team name..."
                          value={formData.teamName || ''}
                          onChange={(e) => handleInputChange('teamName', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="teamDescription">Team Description (Optional)</Label>
                        <Textarea
                          id="teamDescription"
                          placeholder="Describe your team's goals and approach..."
                          value={formData.teamDescription || ''}
                          onChange={(e) => handleInputChange('teamDescription', e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        );

      case 3: // Confirmation
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Review & Submit</h3>
              <p className="text-muted-foreground">
                Please review your application before submitting
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Application Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">Event</h4>
                  <p className="text-sm text-muted-foreground">{event.title}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold">Participation Type</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedTeam === '' ? 'Individual' : 
                     selectedTeam === 'create' ? `Team: ${formData.teamName || 'New Team'}` : 
                     'Existing Team'}
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold">Application Responses</h4>
                  <div className="space-y-2 mt-2">
                    {applicationQuestions.map(question => (
                      <div key={question.id} className="text-sm">
                        <span className="font-medium">{question.question}</span>
                        <p className="text-muted-foreground">
                          {Array.isArray(formData[question.id]) ? 
                            formData[question.id].join(', ') :
                            formData[question.id] || 'Not answered'
                          }
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Apply to {event.title}
          </DialogTitle>
          <DialogDescription>
            Complete your application to participate in this {event.type}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted ? 'bg-green-500 border-green-500 text-white' :
                  isActive ? 'border-primary text-primary' :
                  'border-muted text-muted-foreground'
                }`}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-px mx-4 ${isCompleted ? 'bg-green-500' : 'bg-muted'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={submitApplicationMutation.isPending}
              >
                {submitApplicationMutation.isPending ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}