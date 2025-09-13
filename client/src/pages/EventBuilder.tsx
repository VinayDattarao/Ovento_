import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import { formatCurrencyINR } from '@/lib/utils';
import { Event } from '@/types';
import { useLocation } from 'wouter';
import { 
  Calendar, 
  MapPin, 
  Users, 
  IndianRupee, 
  Clock, 
  Wand2, 
  Save, 
  Eye, 
  Plus,
  Trash2,
  GripVertical,
  Settings,
  Palette
} from 'lucide-react';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  type: z.enum(['hackathon', 'workshop', 'quiz', 'conference'], {
    required_error: 'Please select an event type',
  }),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  location: z.string().optional(),
  maxParticipants: z.coerce.number().int().positive().optional(),
  registrationFee: z.coerce.number().min(0, 'Fee cannot be negative').optional().default(0),
  prizePool: z.coerce.number().min(0, 'Prize pool cannot be negative').optional(),
  tags: z.array(z.string()).optional().default([]),
  requirements: z.array(z.string()).optional().default([]),
  isVirtual: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  allowTeams: z.boolean().default(true),
  maxTeamSize: z.coerce.number().int().positive().optional().default(4),
});

type EventFormData = z.infer<typeof eventSchema>;

interface BuilderComponent {
  id: string;
  type: 'header' | 'description' | 'registration' | 'schedule' | 'speakers' | 'sponsors';
  title: string;
  icon: string;
  required: boolean;
}

const builderComponents: BuilderComponent[] = [
  { id: 'header', type: 'header', title: 'Event Header', icon: '🏷️', required: true },
  { id: 'description', type: 'description', title: 'Description', icon: '📝', required: true },
  { id: 'registration', type: 'registration', title: 'Registration Form', icon: '📋', required: true },
  { id: 'schedule', type: 'schedule', title: 'Schedule', icon: '📅', required: false },
  { id: 'speakers', type: 'speakers', title: 'Speakers', icon: '🎤', required: false },
  { id: 'sponsors', type: 'sponsors', title: 'Sponsors', icon: '🤝', required: false },
];

const eventTypes = [
  { 
    value: 'hackathon', 
    label: 'Hackathon', 
    icon: '💻',
    description: 'Competitive coding event with teams building projects',
    suggestedDuration: '2-3 days',
    commonFeatures: ['Team formation', 'Judging', 'Prizes', 'Mentorship']
  },
  { 
    value: 'workshop', 
    label: 'Workshop', 
    icon: '🛠️',
    description: 'Educational session with hands-on learning',
    suggestedDuration: '2-4 hours',
    commonFeatures: ['Materials', 'Certification', 'Q&A', 'Follow-up resources']
  },
  { 
    value: 'conference', 
    label: 'Conference', 
    icon: '🎤',
    description: 'Professional gathering with multiple speakers',
    suggestedDuration: '1-3 days',
    commonFeatures: ['Multiple tracks', 'Networking', 'Recordings', 'Exhibition']
  },
  { 
    value: 'quiz', 
    label: 'Competition', 
    icon: '🏆',
    description: 'Competitive challenge or quiz event',
    suggestedDuration: '1-2 hours',
    commonFeatures: ['Leaderboard', 'Time limits', 'Rewards', 'Live scoring']
  },
];

export default function EventBuilder() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [activeComponents, setActiveComponents] = useState<string[]>(['header', 'description', 'registration']);
  const [currentStep, setCurrentStep] = useState<'basic' | 'builder' | 'preview'>('basic');
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      type: undefined,
      startDate: '',
      endDate: '',
      location: '',
      registrationFee: 0,
      tags: [],
      requirements: [],
      isVirtual: false,
      isPublic: true,
      allowTeams: true,
      maxTeamSize: 4,
    },
  });

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

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      return apiRequest('POST', '/api/events', {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Event Created Successfully",
        description: "Your event has been published and is now live!",
      });
      setLocation('/events');
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Creation Failed",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateWithAIMutation = useMutation({
    mutationFn: async ({ eventType, topic, duration }: { eventType: string; topic: string; duration: string }) => {
      const response = await apiRequest('POST', '/api/ai/generate-event', {
        eventType,
        topic,
        duration,
      });
      return response.json();
    },
    onSuccess: (data) => {
      form.setValue('title', data.title);
      form.setValue('description', data.description);
      form.setValue('requirements', data.requirements || []);
      setIsAIGenerating(false);
      toast({
        title: "AI Content Generated",
        description: "Event details have been generated based on your inputs!",
      });
    },
    onError: (error) => {
      setIsAIGenerating(false);
      toast({
        title: "AI Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAIGenerate = () => {
    const eventType = form.getValues('type');
    if (!eventType) {
      toast({
        title: "Select Event Type",
        description: "Please select an event type before using AI generation.",
        variant: "destructive",
      });
      return;
    }

    setIsAIGenerating(true);
    generateWithAIMutation.mutate({
      eventType,
      topic: form.getValues('title') || `${eventType} event`,
      duration: '1 day',
    });
  };

  const onSubmit = (data: EventFormData) => {
    createEventMutation.mutate(data);
  };

  const addComponent = (componentId: string) => {
    if (!activeComponents.includes(componentId)) {
      setActiveComponents([...activeComponents, componentId]);
    }
  };

  const removeComponent = (componentId: string) => {
    const component = builderComponents.find(c => c.id === componentId);
    if (component?.required) {
      toast({
        title: "Cannot Remove Component",
        description: "This component is required for the event.",
        variant: "destructive",
      });
      return;
    }
    setActiveComponents(activeComponents.filter(id => id !== componentId));
  };

  const selectedEventType = form.watch('type');
  const eventTypeInfo = eventTypes.find(t => t.value === selectedEventType);

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
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Create <span className="gradient-text">Amazing Event</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Build your event with our AI-powered drag-and-drop builder
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {currentStep !== 'basic' && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep('basic')}
                    data-testid="button-back-to-basic"
                  >
                    ← Back to Basics
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentStep('preview')}
                    data-testid="button-preview"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${currentStep === 'basic' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  currentStep === 'basic' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                }`}>
                  1
                </div>
                <span className="font-medium">Basic Info</span>
              </div>
              <div className="w-8 h-0.5 bg-border"></div>
              <div className={`flex items-center space-x-2 ${currentStep === 'builder' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  currentStep === 'builder' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                }`}>
                  2
                </div>
                <span className="font-medium">Page Builder</span>
              </div>
              <div className="w-8 h-0.5 bg-border"></div>
              <div className={`flex items-center space-x-2 ${currentStep === 'preview' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                  currentStep === 'preview' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                }`}>
                  3
                </div>
                <span className="font-medium">Preview & Publish</span>
              </div>
            </div>
          </div>

          {/* Basic Info Step */}
          {currentStep === 'basic' && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(() => setCurrentStep('builder'))} className="space-y-8">
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Main Form */}
                  <div className="lg:col-span-2 space-y-8">
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-primary" />
                          Event Details
                        </CardTitle>
                        <CardDescription>
                          Basic information about your event
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Title *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your event title..." 
                                  {...field} 
                                  data-testid="input-event-title"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Type *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-event-type">
                                    <SelectValue placeholder="Select event type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {eventTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      <div className="flex items-center gap-2">
                                        <span>{type.icon}</span>
                                        <span>{type.label}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe your event..."
                                  rows={4}
                                  {...field}
                                  data-testid="textarea-event-description"
                                />
                              </FormControl>
                              <FormDescription>
                                Tell attendees what to expect from your event
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Date & Time *</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="datetime-local" 
                                    {...field} 
                                    data-testid="input-start-date"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Date & Time *</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="datetime-local" 
                                    {...field} 
                                    data-testid="input-end-date"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Virtual, City name, or venue address..."
                                  {...field}
                                  data-testid="input-event-location"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid md:grid-cols-3 gap-6">
                          <FormField
                            control={form.control}
                            name="maxParticipants"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Max Participants</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Unlimited"
                                    {...field}
                                    data-testid="input-max-participants"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="registrationFee"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Registration Fee ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01"
                                    placeholder="0.00"
                                    {...field}
                                    data-testid="input-registration-fee"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="prizePool"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Prize Pool ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01"
                                    placeholder="0.00"
                                    {...field}
                                    data-testid="input-prize-pool"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Generator */}
                    <Card className="glass-card border-primary/50 bg-primary/5">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Wand2 className="w-5 h-5 text-accent" />
                          AI Event Generator
                        </CardTitle>
                        <CardDescription>
                          Let AI help you create compelling event content
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center space-y-4">
                          <div className="text-4xl mb-4">🤖</div>
                          <h3 className="font-semibold text-lg">Supercharge Your Event Creation</h3>
                          <p className="text-muted-foreground">
                            Our AI will generate a compelling title, description, and requirements based on your event type and goals.
                          </p>
                          <Button
                            type="button"
                            onClick={handleAIGenerate}
                            disabled={isAIGenerating || !selectedEventType}
                            className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
                            data-testid="button-ai-generate"
                          >
                            {isAIGenerating ? (
                              <>
                                <div className="spinner w-4 h-4 mr-2"></div>
                                Generating...
                              </>
                            ) : (
                              <>
                                <Wand2 className="w-4 h-4 mr-2" />
                                Generate with AI
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Event Type Info */}
                    {eventTypeInfo && (
                      <Card className="glass-card">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <span className="text-2xl">{eventTypeInfo.icon}</span>
                            {eventTypeInfo.label}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            {eventTypeInfo.description}
                          </p>
                          
                          <div>
                            <div className="text-sm font-medium mb-2">Suggested Duration:</div>
                            <div className="text-sm text-muted-foreground">{eventTypeInfo.suggestedDuration}</div>
                          </div>

                          <div>
                            <div className="text-sm font-medium mb-2">Common Features:</div>
                            <div className="flex flex-wrap gap-2">
                              {eventTypeInfo.commonFeatures.map((feature) => (
                                <Badge key={feature} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Quick Tips */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="text-lg">💡 Quick Tips</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm">
                          <div className="font-medium mb-1">Clear Title</div>
                          <div className="text-muted-foreground">Use action words and be specific about what attendees will learn or build.</div>
                        </div>
                        
                        <Separator />
                        
                        <div className="text-sm">
                          <div className="font-medium mb-1">Optimal Duration</div>
                          <div className="text-muted-foreground">Match your event length to the content depth and audience attention span.</div>
                        </div>
                        
                        <Separator />
                        
                        <div className="text-sm">
                          <div className="font-medium mb-1">Pricing Strategy</div>
                          <div className="text-muted-foreground">Free events get more signups, but paid events tend to have better attendance.</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-primary text-primary-foreground px-8"
                    data-testid="button-continue-to-builder"
                  >
                    Continue to Builder
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {/* Page Builder Step */}
          {currentStep === 'builder' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Component Library */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" />
                    Component Library
                  </CardTitle>
                  <CardDescription>
                    Drag components to build your event page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {builderComponents.map((component) => (
                    <div
                      key={component.id}
                      className={`p-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                        activeComponents.includes(component.id)
                          ? 'border-primary bg-primary/10 opacity-50'
                          : 'border-border hover:border-primary hover:bg-primary/5'
                      }`}
                      onClick={() => addComponent(component.id)}
                      data-testid={`component-${component.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{component.icon}</span>
                        <div>
                          <div className="font-medium text-sm">{component.title}</div>
                          {component.required && (
                            <div className="text-xs text-primary">Required</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">AI Templates</h4>
                    <div className="space-y-2">
                      <button
                        type="button"
                        className="w-full p-3 text-left rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
                        data-testid="template-hackathon"
                      >
                        <div className="font-medium text-primary text-sm">Hackathon Template</div>
                        <div className="text-xs text-muted-foreground">Registration, teams, submissions</div>
                      </button>
                      
                      <button
                        type="button"
                        className="w-full p-3 text-left rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors"
                        data-testid="template-workshop"
                      >
                        <div className="font-medium text-accent text-sm">Workshop Template</div>
                        <div className="text-xs text-muted-foreground">Sessions, materials, certificates</div>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Canvas */}
              <div className="lg:col-span-2">
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-accent" />
                        Event Page Builder
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" data-testid="button-preview-page">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" data-testid="button-reset-builder">
                          Reset
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-96 border-2 border-dashed border-border rounded-xl p-6 bg-secondary/5">
                      {activeComponents.length === 0 ? (
                        <div className="text-center text-muted-foreground py-16">
                          <div className="text-6xl mb-4">🏗️</div>
                          <h3 className="text-xl font-semibold mb-2">Start Building Your Event Page</h3>
                          <p className="mb-6">Drag components from the library to create your event page</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {activeComponents.map((componentId, index) => {
                            const component = builderComponents.find(c => c.id === componentId);
                            if (!component) return null;
                            
                            return (
                              <div
                                key={`${componentId}-${index}`}
                                className="group p-4 bg-card rounded-lg border border-border relative"
                                data-testid={`active-component-${componentId}`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                                    <span className="text-lg">{component.icon}</span>
                                    <h4 className="font-semibold">{component.title}</h4>
                                  </div>
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="sm" data-testid={`button-edit-${componentId}`}>
                                      <Settings className="w-4 h-4" />
                                    </Button>
                                    {!component.required && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeComponent(componentId)}
                                        data-testid={`button-remove-${componentId}`}
                                      >
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Component Preview */}
                                <div className="mt-4 p-4 bg-background rounded border-2 border-dashed border-muted">
                                  {componentId === 'header' && (
                                    <div className="text-center">
                                      <h1 className="text-2xl font-bold mb-2">{form.getValues('title') || 'Event Title'}</h1>
                                      <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-4 h-4" />
                                          {form.getValues('startDate') ? new Date(form.getValues('startDate')).toLocaleDateString() : 'Date TBD'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <MapPin className="w-4 h-4" />
                                          {form.getValues('location') || 'Location TBD'}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {componentId === 'description' && (
                                    <div className="space-y-2">
                                      <h3 className="font-semibold">About This Event</h3>
                                      <p className="text-muted-foreground">
                                        {form.getValues('description') || 'Event description will appear here...'}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {componentId === 'registration' && (
                                    <div className="space-y-4">
                                      <h3 className="font-semibold">Registration</h3>
                                      <div className="space-y-2">
                                        <Input placeholder="Full Name" />
                                        <Input placeholder="Email Address" />
                                        <Button className="w-full">
                                          Register {form.getValues('registrationFee') > 0 && `- ${formatCurrencyINR(form.getValues('registrationFee'))}`}
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {componentId === 'schedule' && (
                                    <div className="space-y-4">
                                      <h3 className="font-semibold">Event Schedule</h3>
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-3 p-2 border rounded">
                                          <Clock className="w-4 h-4" />
                                          <div>
                                            <div className="font-medium">Opening Ceremony</div>
                                            <div className="text-sm text-muted-foreground">9:00 AM - 9:30 AM</div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-2 border rounded">
                                          <Clock className="w-4 h-4" />
                                          <div>
                                            <div className="font-medium">Main Event</div>
                                            <div className="text-sm text-muted-foreground">9:30 AM - 5:00 PM</div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {(componentId === 'speakers' || componentId === 'sponsors') && (
                                    <div className="text-center py-8 text-muted-foreground">
                                      <span className="text-4xl mb-2 block">{component.icon}</span>
                                      <p>Configure {component.title.toLowerCase()} in the next step</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between mt-6">
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentStep('basic')}
                    data-testid="button-back-to-basic"
                  >
                    ← Back to Basic Info
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep('preview')}
                    className="bg-primary text-primary-foreground"
                    data-testid="button-continue-to-preview"
                  >
                    Continue to Preview
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Preview Step */}
          {currentStep === 'preview' && (
            <div className="space-y-8">
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-primary" />
                      Event Preview
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep('builder')}
                        data-testid="button-back-to-builder"
                      >
                        ← Edit Page
                      </Button>
                      <Button
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={createEventMutation.isPending}
                        className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
                        data-testid="button-publish-event"
                      >
                        {createEventMutation.isPending ? (
                          <>
                            <div className="spinner w-4 h-4 mr-2"></div>
                            Publishing...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Publish Event
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-background border rounded-xl p-8 min-h-96">
                    <div className="max-w-4xl mx-auto space-y-12">
                      {/* Header Preview */}
                      <div className="text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                          <span className="text-2xl">{eventTypes.find(t => t.value === form.getValues('type'))?.icon}</span>
                          <span className="font-medium capitalize">{form.getValues('type')}</span>
                        </div>
                        
                        <h1 className="text-4xl font-bold">{form.getValues('title')}</h1>
                        
                        <div className="flex flex-wrap justify-center items-center gap-6 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            <span>
                              {form.getValues('startDate') && new Date(form.getValues('startDate')).toLocaleDateString()}
                              {form.getValues('endDate') && form.getValues('startDate') !== form.getValues('endDate') && 
                                ` - ${new Date(form.getValues('endDate')).toLocaleDateString()}`
                              }
                            </span>
                          </div>
                          {form.getValues('location') && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-5 h-5" />
                              <span>{form.getValues('location')}</span>
                            </div>
                          )}
                          {form.getValues('maxParticipants') && (
                            <div className="flex items-center gap-2">
                              <Users className="w-5 h-5" />
                              <span>Up to {form.getValues('maxParticipants')} participants</span>
                            </div>
                          )}
                          {form.getValues('prizePool') && parseFloat((form.getValues('prizePool') || '0').toString()) > 0 && (
                            <div className="flex items-center gap-2">
                              <IndianRupee className="w-5 h-5" />
                              <span>{formatCurrencyINR(parseFloat((form.getValues('prizePool') || '0').toString()))} prize pool</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {form.getValues('description') && (
                        <div className="prose prose-invert max-w-none">
                          <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                          <p className="text-muted-foreground leading-relaxed">
                            {form.getValues('description')}
                          </p>
                        </div>
                      )}

                      {/* Registration Section */}
                      <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-8">
                          <h2 className="text-2xl font-bold mb-6 text-center">Ready to Join?</h2>
                          <div className="max-w-md mx-auto space-y-4">
                            <div className="text-center mb-6">
                              {form.getValues('registrationFee') > 0 ? (
                                <div className="text-2xl font-bold text-primary">
                                  {formatCurrencyINR(form.getValues('registrationFee'))}
                                </div>
                              ) : (
                                <div className="text-3xl font-bold text-chart-4">
                                  FREE
                                </div>
                              )}
                            </div>
                            <Button className="w-full bg-primary text-primary-foreground py-3 text-lg" data-testid="button-register-preview">
                              Register Now
                            </Button>
                            <p className="text-center text-sm text-muted-foreground">
                              Join hundreds of other participants
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Requirements */}
                      {form.getValues('requirements').length > 0 && (
                        <div>
                          <h2 className="text-2xl font-bold mb-4">Requirements</h2>
                          <ul className="space-y-2">
                            {form.getValues('requirements').map((req, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                                <span className="text-muted-foreground">{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
