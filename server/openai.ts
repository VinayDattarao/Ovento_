// PROTOTYPE MODE: All OpenAI API calls replaced with hardcoded responses
// No external API dependencies - everything runs standalone

export async function generateEventRecommendations(userProfile: {
  skills: string[];
  interests: string[];
  pastEvents: string[];
}): Promise<{
  recommendations: Array<{
    type: string;
    score: number;
    reason: string;
    suggestedTags: string[];
  }>;
}> {
  console.log("🤖 PROTOTYPE: Using hardcoded AI recommendations");
  
  // Generate personalized recommendations based on user profile
  const recommendations = [];
  
  if (userProfile.skills.some(skill => skill.toLowerCase().includes('development') || skill.toLowerCase().includes('coding'))) {
    recommendations.push({
      type: "hackathon",
      score: 0.95,
      reason: `Perfect match for your ${userProfile.skills.join(', ')} skills`,
      suggestedTags: ["coding", "innovation", "competition"]
    });
  }
  
  if (userProfile.interests.some(interest => interest.toLowerCase().includes('learning') || interest.toLowerCase().includes('education'))) {
    recommendations.push({
      type: "workshop",
      score: 0.88,
      reason: `Aligns with your interest in ${userProfile.interests.join(', ')}`,
      suggestedTags: ["learning", "hands-on", "skills"]
    });
  }
  
  recommendations.push(
    {
      type: "networking",
      score: 0.82,
      reason: "Expand your professional network",
      suggestedTags: ["career", "connections", "community"]
    },
    {
      type: "conference",
      score: 0.75,
      reason: "Learn from industry experts",
      suggestedTags: ["knowledge", "inspiration", "trends"]
    },
    {
      type: "meetup",
      score: 0.70,
      reason: "Connect with local community",
      suggestedTags: ["local", "casual", "discussion"]
    }
  );
  
  return { recommendations: recommendations.slice(0, 5) };
}

export async function generateTeamMatches(userProfile: {
  skills: string[];
  interests: string[];
  workStyle: string;
}): Promise<{
  matches: Array<{
    compatibility: number;
    reason: string;
    recommendedRoles: string[];
  }>;
}> {
  console.log("🤖 PROTOTYPE: Using hardcoded team matching");
  
  const matches = [];
  
  // Generate matches based on work style and skills
  if (userProfile.workStyle.toLowerCase().includes('collaborative')) {
    matches.push({
      compatibility: 0.92,
      reason: "Excellent collaborative chemistry - both prefer teamwork",
      recommendedRoles: ["project manager", "team lead", "coordinator"]
    });
  }
  
  if (userProfile.skills.some(skill => skill.toLowerCase().includes('technical') || skill.toLowerCase().includes('development'))) {
    matches.push({
      compatibility: 0.88,
      reason: "Strong technical compatibility for complex projects",
      recommendedRoles: ["developer", "architect", "tech lead"]
    });
  }
  
  matches.push(
    {
      compatibility: 0.85,
      reason: "Complementary skill sets create strong team balance",
      recommendedRoles: ["designer", "developer", "product manager"]
    },
    {
      compatibility: 0.78,
      reason: "Shared interests in innovation and problem-solving",
      recommendedRoles: ["researcher", "analyst", "strategist"]
    },
    {
      compatibility: 0.72,
      reason: "Good foundation for cross-functional collaboration",
      recommendedRoles: ["generalist", "bridge builder", "communicator"]
    }
  );
  
  return { matches: matches.slice(0, 4) };
}

export async function analyzeImage(base64Image: string): Promise<string> {
  console.log("🤖 PROTOTYPE: Using hardcoded image analysis");
  
  // Simulate different responses based on image size/complexity
  const imageLength = base64Image.length;
  
  if (imageLength > 50000) {
    return "This appears to be a high-quality image showing a professional event space. I can see what looks like presentation areas, networking zones, and collaborative workspaces. The layout suggests this is well-suited for hackathons, workshops, or tech conferences. The lighting and setup indicate a modern, tech-friendly environment that would encourage innovation and team collaboration.";
  } else if (imageLength > 20000) {
    return "This image shows an event or meeting space with people collaborating. I notice elements that suggest team-building activities or project work. The setting appears conducive to creative problem-solving and group discussions, making it ideal for workshops, brainstorming sessions, or startup meetups.";
  } else {
    return "This appears to be an event-related image, possibly showing team collaboration or a meeting setup. The composition suggests a professional environment suitable for networking events, presentations, or group activities. The visual elements indicate a space designed for productive team interactions.";
  }
}

export async function analyzeSentiment(text: string): Promise<{
  rating: number;
  confidence: number;
  insights: string;
}> {
  console.log("🤖 PROTOTYPE: Using hardcoded sentiment analysis");
  
  // Simple sentiment analysis based on text characteristics
  const lowerText = text.toLowerCase();
  const words = text.split(/\s+/);
  const wordCount = words.length;
  
  // Positive indicators
  const positiveWords = ['great', 'awesome', 'excellent', 'amazing', 'fantastic', 'love', 'perfect', 'wonderful', 'good', 'best', 'outstanding', 'brilliant', 'superb'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointing', 'poor', 'useless', 'broken', 'failed', 'frustrating'];
  const neutralWords = ['okay', 'fine', 'average', 'normal', 'standard', 'typical', 'regular', 'moderate'];
  
  let sentiment = 3; // neutral baseline
  let confidence = 0.7;
  let insights = "Neutral sentiment detected. ";
  
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  const neutralCount = neutralWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount && positiveCount > 0) {
    sentiment = Math.min(5, 3 + positiveCount);
    confidence = Math.min(0.9, 0.6 + positiveCount * 0.1);
    insights = `Positive sentiment with ${positiveCount} positive indicators. `;
  } else if (negativeCount > positiveCount && negativeCount > 0) {
    sentiment = Math.max(1, 3 - negativeCount);
    confidence = Math.min(0.9, 0.6 + negativeCount * 0.1);
    insights = `Negative sentiment with ${negativeCount} negative indicators. `;
  } else if (neutralCount > 0) {
    sentiment = 3;
    confidence = 0.8;
    insights = "Neutral sentiment with balanced tone. ";
  }
  
  // Adjust based on text length
  if (wordCount < 5) {
    confidence = Math.max(0.3, confidence - 0.2);
    insights += "Limited text for comprehensive analysis.";
  } else if (wordCount > 50) {
    confidence = Math.min(0.9, confidence + 0.1);
    insights += "Detailed text provides reliable sentiment indicators.";
  } else {
    insights += "Good text length for sentiment analysis.";
  }
  
  return {
    rating: sentiment,
    confidence: Math.round(confidence * 100) / 100,
    insights
  };
}

export async function generateEventContent(eventType: string, theme: string): Promise<{
  title: string;
  description: string;
  suggestedSchedule: Array<{
    time: string;
    activity: string;
    duration: string;
  }>;
  requirements: string[];
  tags: string[];
}> {
  console.log("🤖 PROTOTYPE: Using hardcoded event content generation");
  
  // Generate specialized content based on event type
  const content = {
    hackathon: {
      title: `${theme} Innovation Hackathon`,
      description: `Join us for an intensive 24-hour hackathon focused on ${theme}. Teams will collaborate to build innovative solutions, compete for prizes, and showcase their creativity. This event brings together developers, designers, and entrepreneurs to tackle real-world challenges through technology and innovation.`,
      schedule: [
        { time: "6:00 PM", activity: "Registration & Networking", duration: "1 hour" },
        { time: "7:00 PM", activity: "Opening Keynote & Challenge Reveal", duration: "1 hour" },
        { time: "8:00 PM", activity: "Team Formation & Brainstorming", duration: "1 hour" },
        { time: "9:00 PM", activity: "Development Phase Begins", duration: "12 hours" },
        { time: "9:00 AM", activity: "Breakfast & Check-in", duration: "1 hour" },
        { time: "10:00 AM", activity: "Continued Development", duration: "8 hours" },
        { time: "6:00 PM", activity: "Final Presentations", duration: "2 hours" },
        { time: "8:00 PM", activity: "Judging & Awards Ceremony", duration: "1 hour" }
      ],
      requirements: [
        "Laptop with development environment",
        "Programming experience (any language)",
        "Collaborative mindset and team spirit",
        "Ability to work under time pressure"
      ]
    },
    workshop: {
      title: `${theme} Skills Workshop`,
      description: `An interactive hands-on workshop focusing on ${theme}. Learn from industry experts, practice new skills, and connect with peers. This workshop combines theoretical knowledge with practical exercises to ensure you leave with actionable skills and confidence.`,
      schedule: [
        { time: "9:00 AM", activity: "Welcome & Introductions", duration: "30 mins" },
        { time: "9:30 AM", activity: "Fundamentals Overview", duration: "1 hour" },
        { time: "10:30 AM", activity: "Coffee Break", duration: "15 mins" },
        { time: "10:45 AM", activity: "Hands-on Exercise 1", duration: "1.5 hours" },
        { time: "12:15 PM", activity: "Lunch Break", duration: "1 hour" },
        { time: "1:15 PM", activity: "Advanced Techniques", duration: "1 hour" },
        { time: "2:15 PM", activity: "Hands-on Exercise 2", duration: "1.5 hours" },
        { time: "3:45 PM", activity: "Q&A & Wrap-up", duration: "30 mins" }
      ],
      requirements: [
        "Basic understanding of the topic",
        "Notebook for taking notes",
        "Laptop if practical exercises require it",
        "Enthusiasm for learning"
      ]
    },
    conference: {
      title: `${theme} Annual Conference`,
      description: `The premier conference for ${theme} professionals. Featuring keynote speakers, panel discussions, and networking opportunities. Stay ahead of industry trends, learn from thought leaders, and expand your professional network in an engaging full-day event.`,
      schedule: [
        { time: "8:00 AM", activity: "Registration & Continental Breakfast", duration: "1 hour" },
        { time: "9:00 AM", activity: "Opening Keynote", duration: "1 hour" },
        { time: "10:00 AM", activity: "Panel Discussion 1", duration: "1 hour" },
        { time: "11:00 AM", activity: "Networking Break", duration: "30 mins" },
        { time: "11:30 AM", activity: "Technical Sessions (Track A & B)", duration: "1.5 hours" },
        { time: "1:00 PM", activity: "Lunch & Networking", duration: "1.5 hours" },
        { time: "2:30 PM", activity: "Innovation Showcase", duration: "1 hour" },
        { time: "3:30 PM", activity: "Panel Discussion 2", duration: "1 hour" },
        { time: "4:30 PM", activity: "Closing Keynote & Awards", duration: "1 hour" }
      ],
      requirements: [
        "Professional interest in the field",
        "Business cards for networking",
        "Note-taking materials",
        "Professional attire"
      ]
    }
  };
  
  // Get event-specific content or use default
  const eventContent = content[eventType.toLowerCase() as keyof typeof content] || content.workshop;
  
  return {
    title: eventContent.title,
    description: eventContent.description,
    suggestedSchedule: eventContent.schedule,
    requirements: eventContent.requirements,
    tags: [
      eventType.toLowerCase(),
      theme.toLowerCase(),
      "professional",
      "networking",
      "learning",
      "innovation"
    ]
  };
}
