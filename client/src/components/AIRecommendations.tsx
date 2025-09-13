import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, RefreshCw, Code, Users, Trophy, ThumbsUp, X, Bookmark, Target, Award, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface AIRecommendation {
  id: string;
  type: 'event' | 'team' | 'opportunity' | 'achievement' | 'skill' | 'project';
  title: string;
  description: string;
  score: number;
  reason: string;
  createdAt: string;
  category: string;
  tags: string[];
  liked?: boolean;
  dismissed?: boolean;
  saved?: boolean;
}

// Mock AI recommendations generator with user context intelligence
const generateMockRecommendations = (userSkills: string[] = [], userInterests: string[] = []): AIRecommendation[] => {
  const eventRecommendations = [
    {
      id: 'rec-event-1',
      type: 'event' as const,
      title: 'AI Innovation Hackathon 2025',
      description: 'Build cutting-edge AI solutions in 48 hours with top industry mentors',
      score: 0.92,
      reason: 'Perfect match for your AI and machine learning interests',
      category: 'Hackathon',
      tags: ['AI', 'Machine Learning', 'Innovation'],
    },
    {
      id: 'rec-event-2', 
      type: 'event' as const,
      title: 'Web3 Developer Workshop',
      description: 'Learn blockchain development and smart contract programming',
      score: 0.78,
      reason: 'Aligns with your blockchain and cryptocurrency interests',
      category: 'Workshop',
      tags: ['Blockchain', 'Web3', 'Smart Contracts'],
    },
    {
      id: 'rec-event-3',
      type: 'event' as const,
      title: 'UX Design Thinking Bootcamp',
      description: 'Master user experience design principles and prototyping',
      score: 0.85,
      reason: 'Great for expanding your design and user experience skills',
      category: 'Bootcamp',
      tags: ['UX Design', 'Prototyping', 'User Research'],
    }
  ];

  const teamRecommendations = [
    {
      id: 'rec-team-1',
      type: 'team' as const,
      title: 'DataSci Warriors',
      description: 'Team specializing in data science and analytics projects',
      score: 0.88,
      reason: 'Your Python and data analysis skills complement their needs',
      category: 'Data Science',
      tags: ['Python', 'Analytics', 'Machine Learning'],
    },
    {
      id: 'rec-team-2',
      type: 'team' as const,
      title: 'FullStack Innovators',
      description: 'Building next-gen web applications with modern tech stack',
      score: 0.75,
      reason: 'Looking for developers with your JavaScript expertise',
      category: 'Web Development',
      tags: ['React', 'Node.js', 'TypeScript'],
    }
  ];

  const opportunityRecommendations = [
    {
      id: 'rec-opp-1',
      type: 'opportunity' as const,
      title: 'Startup Accelerator Program',
      description: 'Join an intensive 3-month program for tech entrepreneurs',
      score: 0.82,
      reason: 'Your leadership experience and technical skills are ideal',
      category: 'Accelerator',
      tags: ['Entrepreneurship', 'Startup', 'Leadership'],
    },
    {
      id: 'rec-opp-2',
      type: 'opportunity' as const,
      title: 'Open Source Contribution',
      description: 'Contribute to popular open source projects in your tech stack',
      score: 0.79,
      reason: 'Build your portfolio while helping the developer community',
      category: 'Open Source',
      tags: ['GitHub', 'Collaboration', 'Portfolio'],
    }
  ];

  const achievementRecommendations = [
    {
      id: 'rec-ach-1',
      type: 'achievement' as const,
      title: 'Complete 5 Hackathons',
      description: 'Challenge yourself to participate in 5 different hackathons',
      score: 0.73,
      reason: 'Build experience and expand your network',
      category: 'Challenge',
      tags: ['Hackathons', 'Networking', 'Experience'],
    }
  ];

  const skillRecommendations = [
    {
      id: 'rec-skill-1',
      type: 'skill' as const,
      title: 'Learn Kubernetes',
      description: 'Master container orchestration for scalable applications',
      score: 0.86,
      reason: 'High demand skill that complements your DevOps interest',
      category: 'Technical Skill',
      tags: ['DevOps', 'Containers', 'Cloud'],
    }
  ];

  const allRecommendations = [
    ...eventRecommendations,
    ...teamRecommendations, 
    ...opportunityRecommendations,
    ...achievementRecommendations,
    ...skillRecommendations
  ];

  // Apply user context intelligence to boost relevant recommendations
  return allRecommendations
    .map(rec => {
      let contextScore = rec.score;
      
      // Boost scores based on user skills and interests
      const relevantSkills = rec.tags.filter(tag => 
        userSkills.some(skill => skill.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(skill.toLowerCase()))
      );
      const relevantInterests = rec.tags.filter(tag => 
        userInterests.some(interest => interest.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(interest.toLowerCase()))
      );
      
      // Boost score for skill matches (up to +0.2)
      contextScore += relevantSkills.length * 0.05;
      
      // Boost score for interest matches (up to +0.15)
      contextScore += relevantInterests.length * 0.03;
      
      // Extra boost for exact matches
      if (relevantSkills.length > 0 || relevantInterests.length > 0) {
        contextScore += 0.1;
      }
      
      // Update reason to be more personalized
      let personalizedReason = rec.reason;
      if (relevantSkills.length > 0) {
        personalizedReason = `Perfect match for your ${relevantSkills.join(', ')} skills`;
      } else if (relevantInterests.length > 0) {
        personalizedReason = `Aligns with your interests in ${relevantInterests.join(', ')}`;
      }
      
      return {
        ...rec,
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(), // Random within last week
        score: Math.min(1.0, Math.max(0.5, contextScore + (Math.random() - 0.5) * 0.1)), // Cap at 1.0, add slight variation
        reason: personalizedReason,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8); // Show top 8 recommendations
};

export default function AIRecommendations() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load recommendations on component mount
  useEffect(() => {
    const loadRecommendations = () => {
      setIsLoading(true);
      
      // Simulate loading delay
      setTimeout(() => {
        const userSkills = user?.skills || [];
        const userInterests = user?.interests || [];
        
        // Check localStorage for existing recommendations and user actions
        const savedRecommendations = localStorage.getItem('aiRecommendations');
        const userActions = JSON.parse(localStorage.getItem('recommendationActions') || '{}');
        
        let newRecommendations = generateMockRecommendations(userSkills, userInterests);
        
        // Apply user actions (liked, dismissed, saved)
        newRecommendations = newRecommendations.map(rec => ({
          ...rec,
          liked: userActions[rec.id]?.liked || false,
          dismissed: userActions[rec.id]?.dismissed || false,
          saved: userActions[rec.id]?.saved || false,
        }));
        
        // Filter out dismissed recommendations
        newRecommendations = newRecommendations.filter(rec => !rec.dismissed);
        
        setRecommendations(newRecommendations);
        setIsLoading(false);
        
        // Save to localStorage
        localStorage.setItem('aiRecommendations', JSON.stringify(newRecommendations));
      }, 800);
    };

    loadRecommendations();
  }, [user]);

  const refreshRecommendations = () => {
    setIsRefreshing(true);
    
    setTimeout(() => {
      const userSkills = user?.skills || [];
      const userInterests = user?.interests || [];
      const userActions = JSON.parse(localStorage.getItem('recommendationActions') || '{}');
      
      let newRecommendations = generateMockRecommendations(userSkills, userInterests);
      
      // Apply user actions (liked, dismissed, saved) to maintain state
      newRecommendations = newRecommendations.map(rec => ({
        ...rec,
        liked: userActions[rec.id]?.liked || false,
        dismissed: userActions[rec.id]?.dismissed || false,
        saved: userActions[rec.id]?.saved || false,
      }));
      
      // Filter out dismissed recommendations
      newRecommendations = newRecommendations.filter(rec => !rec.dismissed);
      
      setRecommendations(newRecommendations);
      setIsRefreshing(false);
      
      localStorage.setItem('aiRecommendations', JSON.stringify(newRecommendations));
      
      toast({
        title: "Success",
        description: "AI recommendations refreshed with your preferences!",
      });
    }, 1200);
  };

  const handleRecommendationAction = (recId: string, action: 'liked' | 'dismissed' | 'saved') => {
    const userActions = JSON.parse(localStorage.getItem('recommendationActions') || '{}');
    
    if (!userActions[recId]) {
      userActions[recId] = {};
    }
    
    userActions[recId][action] = !userActions[recId][action];
    
    localStorage.setItem('recommendationActions', JSON.stringify(userActions));
    
    setRecommendations(prev => prev.map(rec => {
      if (rec.id === recId) {
        const updated = { ...rec, [action]: !(rec as any)[action] };
        
        // If dismissed, remove from view
        if (action === 'dismissed' && updated.dismissed) {
          toast({
            title: "Recommendation dismissed",
            description: "We'll show you different suggestions next time.",
          });
          return null;
        }
        
        return updated;
      }
      return rec;
    }).filter(Boolean) as AIRecommendation[]);
    
    if (action === 'liked') {
      toast({
        title: userActions[recId][action] ? "Liked!" : "Like removed",
        description: userActions[recId][action] ? "We'll show you more like this." : "",
      });
    } else if (action === 'saved') {
      toast({
        title: userActions[recId][action] ? "Saved!" : "Removed from saved",
        description: userActions[recId][action] ? "Find this in your saved recommendations." : "",
      });
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Code className="h-4 w-4" />;
      case 'team':
        return <Users className="h-4 w-4" />;
      case 'opportunity':
        return <Target className="h-4 w-4" />;
      case 'achievement':
        return <Award className="h-4 w-4" />;
      case 'skill':
        return <BookOpen className="h-4 w-4" />;
      case 'project':
        return <Code className="h-4 w-4" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'event':
        return 'bg-primary/20 text-primary';
      case 'team':
        return 'bg-accent/20 text-accent';
      case 'opportunity':
        return 'bg-blue-500/20 text-blue-500';
      case 'achievement':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'skill':
        return 'bg-green-500/20 text-green-500';
      case 'project':
        return 'bg-purple-500/20 text-purple-500';
      default:
        return 'bg-chart-4/20 text-chart-4';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-accent animate-pulse" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted animate-pulse">
                <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-accent" />
          AI Insights
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshRecommendations}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No AI recommendations yet</p>
              <Button
                onClick={refreshRecommendations}
                disabled={isRefreshing}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isRefreshing ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                Generate Recommendations
              </Button>
            </div>
          ) : (
            <>
              {recommendations.slice(0, 3).map((recommendation) => (
                <div
                  key={recommendation.id}
                  className="p-4 rounded-lg border border-border hover:border-primary/50 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className={getRecommendationColor(recommendation.type)}>
                      {getRecommendationIcon(recommendation.type)}
                      <span className="ml-1 capitalize">{recommendation.type}</span>
                    </Badge>
                    <Badge variant="outline">
                      {Math.round(recommendation.score * 100)}% match
                    </Badge>
                  </div>
                  
                  <h4 className="text-sm font-semibold mb-1">{recommendation.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{recommendation.description}</p>
                  <p className="text-xs font-medium text-primary mb-3">{recommendation.reason}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {recommendation.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRecommendationAction(recommendation.id, 'liked')}
                        className={`h-8 w-8 p-0 ${recommendation.liked ? 'text-red-500' : 'text-muted-foreground'}`}
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRecommendationAction(recommendation.id, 'saved')}
                        className={`h-8 w-8 p-0 ${recommendation.saved ? 'text-yellow-500' : 'text-muted-foreground'}`}
                      >
                        <Bookmark className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRecommendationAction(recommendation.id, 'dismissed')}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(recommendation.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
              
              {recommendations.length > 3 && (
                <Button variant="outline" className="w-full">
                  View All {recommendations.length} Recommendations
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
