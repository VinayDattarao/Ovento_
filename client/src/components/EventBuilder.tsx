import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

// Local event schema for validation
const insertEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  type: z.enum(['hackathon', 'workshop', 'quiz', 'conference', 'networking'], {
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
});
import { 
  Wand2, 
  Palette, 
  Eye, 
  Save, 
  Code, 
  Users, 
  Trophy, 
  Calendar,
  MapPin,
  IndianRupee,
  Tag,
  Upload,
  Settings,
  Trash2,
  Copy,
  Layout,
  Type,
  Image,
  Video
} from "lucide-react";

// Client-side form schema with string dates for datetime-local inputs
const eventBuilderFormSchema = insertEventSchema.omit({ startDate: true, endDate: true }).extend({
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  tags: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
});

type EventBuilderForm = z.infer<typeof eventBuilderFormSchema>;


export default function EventBuilder() {
  const [activeTab, setActiveTab] = useState("details");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EventBuilderForm>({
    resolver: zodResolver(eventBuilderFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "hackathon",
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date().toISOString().slice(0, 16),
      location: "",
      isVirtual: false,
      maxParticipants: 100,
      registrationFee: "0",
      prizePool: "0",
      tags: [],
      requirements: [],
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventBuilderForm) => {
      // Convert string dates to Date objects for the API
      const apiPayload = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      };
      await apiRequest("POST", "/api/events", apiPayload);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Event created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateAIContentMutation = useMutation({
    mutationFn: async (eventType: string) => {
      // This would call the AI content generation API
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        title: `AI-Generated ${eventType} Event`,
        description: `An exciting ${eventType} event designed to bring together innovators and creators.`,
        schedule: [
          { time: "09:00", activity: "Registration & Welcome", duration: "1 hour" },
          { time: "10:00", activity: "Opening Keynote", duration: "1 hour" },
          { time: "11:00", activity: "Main Activity", duration: "6 hours" },
          { time: "17:00", activity: "Closing Ceremony", duration: "1 hour" },
        ],
        requirements: ["Laptop", "Enthusiasm", "Team spirit"],
        tags: [eventType, "Innovation", "Technology"],
      };
    },
    onSuccess: (data) => {
      form.setValue("title", data.title);
      form.setValue("description", data.description);
      form.setValue("requirements", data.requirements);
      form.setValue("tags", data.tags);
      toast({
        title: "AI Content Generated",
        description: "Event content has been generated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate AI content",
        variant: "destructive",
      });
    },
  });

  const eventTemplates = [
    {
      id: "hackathon",
      name: "Hackathon Template",
      icon: <Code className="h-6 w-6" />,
      description: "Perfect for coding competitions and innovation challenges",
      color: "bg-primary/20 text-primary border-primary/30"
    },
    {
      id: "workshop",
      name: "Workshop Template",
      icon: <Users className="h-6 w-6" />,
      description: "Interactive learning sessions and skill development",
      color: "bg-accent/20 text-accent border-accent/30"
    },
    {
      id: "conference",
      name: "Conference Template",
      icon: <Calendar className="h-6 w-6" />,
      description: "Professional conferences and networking events",
      color: "bg-chart-3/20 text-chart-3 border-chart-3/30"
    },
    {
      id: "competition",
      name: "Competition Template",
      icon: <Trophy className="h-6 w-6" />,
      description: "Competitive events with prizes and recognition",
      color: "bg-chart-5/20 text-chart-5 border-chart-5/30"
    }
  ];


  const onSubmit = (data: EventBuilderForm) => {
    createEventMutation.mutate(data);
  };

  if (previewMode) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Event Preview</h2>
          <Button onClick={() => setPreviewMode(false)} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Edit Mode
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-8">
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">{form.watch("title") || "Event Title"}</h1>
                <p className="text-xl text-muted-foreground">{form.watch("description") || "Event description"}</p>
              </div>
              
              {/* Event components preview would go here */}
              {[].map((component: any) => (
                <div key={component.id} className="border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-2">{component.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {component.type} component preview would render here
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">AI-Powered Event Builder</h2>
        <div className="flex items-center gap-2">
          <Button onClick={() => setPreviewMode(true)} variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            onClick={() => generateAIContentMutation.mutate(form.watch("type"))}
            disabled={generateAIContentMutation.isPending}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {generateAIContentMutation.isPending ? (
              <div className="animate-spin w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <Wand2 className="h-4 w-4 mr-2" />
            )}
            AI Generate
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="details">Event Details</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Choose a Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {eventTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      selectedTemplate === template.id
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      form.setValue("type", template.id as any);
                      
                      // Auto-fill form based on template
                      switch(template.id) {
                        case "hackathon":
                          form.setValue("title", "AI Hackathon 2024");
                          form.setValue("description", "Join us for an exciting 48-hour coding challenge where innovation meets technology.");
                          form.setValue("maxParticipants", 100);
                          break;
                        case "workshop":
                          form.setValue("title", "Interactive Workshop");
                          form.setValue("description", "Learn new skills through hands-on activities and expert guidance.");
                          form.setValue("maxParticipants", 50);
                          break;
                        case "conference":
                          form.setValue("title", "Professional Conference");
                          form.setValue("description", "Connect with industry leaders and explore the latest trends and innovations.");
                          form.setValue("maxParticipants", 200);
                          break;
                        case "competition":
                          form.setValue("title", "Competitive Challenge");
                          form.setValue("description", "Test your skills against the best in a thrilling competitive environment.");
                          form.setValue("maxParticipants", 75);
                          break;
                      }
                      
                      // Navigate to details tab after selection
                      setActiveTab("details");
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-lg ${template.color} flex items-center justify-center`}>
                          {template.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                      </div>
                      {selectedTemplate === template.id && (
                        <Badge className="bg-primary text-primary-foreground">Selected</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter event title..." {...field} data-testid="input-event-title" />
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
                          <FormLabel>Event Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-event-type">
                                <SelectValue placeholder="Select event type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hackathon">Hackathon</SelectItem>
                              <SelectItem value="workshop">Workshop</SelectItem>
                              <SelectItem value="quiz">Quiz</SelectItem>
                              <SelectItem value="conference">Conference</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your event..." 
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-event-description"
                          />
                        </FormControl>
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
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local" 
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value)}
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
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local" 
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value)}
                              data-testid="input-end-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Event location..." {...field} data-testid="input-location" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isVirtual"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Virtual Event</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-virtual-event"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

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
                              placeholder="100" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                              placeholder="0.00" 
                              step="0.01"
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
                              placeholder="0.00" 
                              step="0.01"
                              {...field}
                              data-testid="input-prize-pool"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => form.reset()}>
                      Reset
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createEventMutation.isPending}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      data-testid="button-create-event"
                    >
                      {createEventMutation.isPending ? (
                        <div className="animate-spin w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Create Event
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="theme">Event Theme</Label>
                  <Select defaultValue="default">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="tech">Tech Blue</SelectItem>
                      <SelectItem value="creative">Creative Purple</SelectItem>
                      <SelectItem value="business">Business Green</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="seo-title">SEO Title</Label>
                  <Input 
                    id="seo-title" 
                    placeholder="Event title for search engines..." 
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="seo-description">SEO Description</Label>
                  <Textarea 
                    id="seo-description" 
                    placeholder="Event description for search engines..." 
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
