export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  role: 'organizer' | 'participant' | 'sponsor' | 'admin';
  skills: string[];
  interests: string[];
  bio?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  type: 'hackathon' | 'workshop' | 'quiz' | 'conference' | 'networking';
  status: 'draft' | 'published' | 'registration_open' | 'registration_closed' | 'live' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  location?: string;
  maxParticipants?: number;
  registrationFee: string;
  prizePool?: string;
  imageUrl?: string;
  tags: string[];
  requirements: string[];
  agenda?: any;
  organizerId: string;
  organizer?: User;
  isVirtual: boolean;
  isPublic: boolean;
  allowTeams: boolean;
  maxTeamSize: number;
  applicationQuestions?: EventQuestion[];
  registrationDeadline?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  industry?: string;
  views?: number;
  registrationCount?: number;
  popularityScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  eventId: string;
  leaderId: string;
  leader?: User;
  members?: User[];
  maxMembers: number;
  isOpen: boolean;
  skillsNeeded: string[];
  inviteCode?: string;
  githubRepo?: string;
  projectUrl?: string;
  submissionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  recipientId?: string;
  teamId?: string;
  eventId?: string;
  channelType: 'direct' | 'team' | 'event' | 'global';
  messageType: 'text' | 'file' | 'image' | 'code';
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
}

export interface AIRecommendation {
  id: string;
  userId: string;
  type: 'event' | 'team_member' | 'skill_development';
  targetId: string;
  confidence: number;
  reasoning: string;
  isViewed: boolean;
  isActedUpon: boolean;
  createdAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  teamId?: string;
  registrationDate: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentIntentId?: string;
  attendanceStatus: 'registered' | 'attended' | 'no_show';
  applicationStatus: 'pending' | 'approved' | 'rejected' | 'waitlisted';
  applicationAnswers?: Record<string, string>;
  feedback?: string;
  rating?: number;
}

export interface Analytics {
  id: string;
  eventId?: string;
  userId?: string;
  metricType: 'attendance' | 'engagement' | 'revenue' | 'rating';
  metricValue: number;
  metadata?: any;
  timestamp: string;
}

export interface WebSocketMessage {
  type: 'chat_message' | 'typing_indicator' | 'join_channel' | 'user_status' | 'notification';
  senderId?: string;
  recipientId?: string;
  teamId?: string;
  eventId?: string;
  channelType?: string;
  content?: string;
  messageType?: string;
  isTyping?: boolean;
  channelId?: string;
  userId?: string;
  timestamp?: string;
}

export interface TeamMatchingResult {
  recommendedUsers: {
    userId: string;
    matchScore: number;
    reasoning: string;
    complementarySkills: string[];
  }[];
  suggestedTeamComposition: {
    roles: string[];
    skillGaps: string[];
    recommendedSize: number;
  };
}

export interface EventRecommendationResult {
  recommendedEvents: {
    eventId: string;
    matchScore: number;
    reasoning: string;
    learningOutcomes: string[];
    careerBenefits: string[];
  }[];
  skillDevelopmentSuggestions: {
    skill: string;
    currentLevel: string;
    targetLevel: string;
    recommendedPath: string[];
  }[];
}

export interface EventQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'radio' | 'checkbox';
  options?: string[];
  required: boolean;
  order: number;
}
