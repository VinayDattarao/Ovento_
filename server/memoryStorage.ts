// In-Memory Storage Implementation for Prototype Mode
// Provides a fallback when DATABASE_URL is not available

import {
  type User,
  type UpsertUser,
  type Event,
  type InsertEvent,
  type Team,
  type InsertTeam,
  type EventRegistration,
  type ChatMessage,
  type InsertChatMessage,
  type AIRecommendation,
  type Notification,
  type InsertNotification,
  type EventAnalytic,
  type EventRsvp,
  type InsertEventRsvp,
  type ProjectSubmission,
  type InsertProjectSubmission,
  type SubmissionFile,
  type InsertSubmissionFile,
} from "@shared/schema";
import { IStorage } from "./storage";

export class InMemoryStorage implements IStorage {
  private users = new Map<string, User>();
  private events = new Map<string, Event>();
  private teams = new Map<string, Team>();
  private teamMembers = new Map<string, string[]>(); // teamId -> userId[]
  private eventRegistrations = new Map<string, EventRegistration>();
  private chatMessages = new Map<string, ChatMessage[]>(); // eventId -> messages[]
  private aiRecommendations = new Map<string, AIRecommendation[]>(); // userId -> recommendations[]
  private notifications = new Map<string, Notification[]>(); // userId -> notifications[]
  private eventAnalytics = new Map<string, EventAnalytic[]>(); // eventId -> analytics[]
  
  // New storage structures for advanced features
  private eventRsvps = new Map<string, EventRsvp>();
  private projectSubmissions = new Map<string, ProjectSubmission>();
  private submissionFiles = new Map<string, SubmissionFile[]>(); // submissionId -> files[]
  
  private initialized = false;

  private generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateInviteCode(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  // Initialize with comprehensive precomputed data
  private async initializeData(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    console.log('🎯 PROTOTYPE MODE - Initializing comprehensive precomputed data...');
    
    // Create diverse user profiles
    const userProfiles = [
      {
        id: 'user-sarah-chen',
        email: 'sarah.chen@techstartup.com',
        firstName: 'Sarah',
        lastName: 'Chen',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Machine Learning'],
        interests: ['AI/ML', 'Web Development', 'Startups', 'Innovation'],
        bio: 'Full-stack developer passionate about AI and creating innovative solutions. Love hackathons and building products that make a difference.',
        profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400'
      },
      {
        id: 'user-alex-rivera',
        email: 'alex.rivera@designstudio.co',
        firstName: 'Alex',
        lastName: 'Rivera',
        skills: ['UI/UX Design', 'Figma', 'Prototyping', 'User Research', 'Design Systems'],
        interests: ['Design', 'User Experience', 'Innovation', 'Creativity'],
        bio: 'UX/UI designer focused on creating intuitive and beautiful digital experiences. Always excited to collaborate on meaningful projects.',
        profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
      },
      {
        id: 'user-jamie-kim',
        email: 'jamie.kim@dataanalytics.org',
        firstName: 'Jamie',
        lastName: 'Kim',
        skills: ['Python', 'Data Science', 'Machine Learning', 'SQL', 'Tableau'],
        interests: ['Data Analytics', 'AI', 'Statistics', 'Business Intelligence'],
        bio: 'Data scientist with expertise in machine learning and analytics. Love turning data into actionable insights.',
        profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
      },
      {
        id: 'user-taylor-wright',
        email: 'taylor.wright@mobilestudio.dev',
        firstName: 'Taylor',
        lastName: 'Wright',
        skills: ['Swift', 'Kotlin', 'React Native', 'Mobile Development', 'App Store Optimization'],
        interests: ['Mobile Apps', 'Technology', 'Gaming', 'Innovation'],
        bio: 'Mobile app developer specializing in iOS and Android applications. Passionate about creating apps that improve daily life.',
        profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
      },
      {
        id: 'user-morgan-lee',
        email: 'morgan.lee@blockchain.tech',
        firstName: 'Morgan',
        lastName: 'Lee',
        skills: ['Blockchain', 'Solidity', 'Web3', 'Smart Contracts', 'DeFi'],
        interests: ['Cryptocurrency', 'Blockchain', 'DeFi', 'Innovation'],
        bio: 'Blockchain developer working on decentralized applications and smart contracts. Excited about the future of Web3.',
        profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'
      },
      {
        id: 'user-casey-martinez',
        email: 'casey.martinez@cloudtech.io',
        firstName: 'Casey',
        lastName: 'Martinez',
        skills: ['AWS', 'Docker', 'Kubernetes', 'DevOps', 'Cloud Architecture'],
        interests: ['Cloud Computing', 'DevOps', 'Automation', 'Scalability'],
        bio: 'DevOps engineer specializing in cloud infrastructure and automation. Love building scalable and reliable systems.',
        profileImageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400'
      }
    ];

    // Create comprehensive events - India focused
    const eventData = [
      {
        id: 'event-ai-hackathon-2025',
        title: 'AI Innovation Hackathon Mumbai 2025',
        description: 'Join India\'s most exciting AI hackathon! Build revolutionary AI applications, compete for ₹20,000 in prizes, and network with top Indian tech companies and startups. Perfect for both seasoned developers and newcomers to AI, featuring workshops, mentorship from industry experts, and the opportunity to create game-changing solutions for India.',
        type: 'hackathon' as const,
        status: 'published' as const,
        organizerId: 'user-sarah-chen',
        startDate: new Date('2025-01-15T09:00:00Z'),
        endDate: new Date('2025-01-17T18:00:00Z'),
        location: 'Bombay Convention & Exhibition Centre, Mumbai',
        isVirtual: false,
        maxParticipants: 500,
        registrationFee: '750.00',
        prizePool: '20000.00',
        requirements: ['Programming experience', 'Laptop required', 'Team of 2-4 members'],
        tags: ['AI', 'Machine Learning', 'Innovation', 'Competition'],
        imageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800'
      },
      {
        id: 'event-web3-workshop',
        title: 'Web3 & Blockchain Development Workshop Bangalore',
        description: 'Master blockchain development and Web3 technologies in India\'s Silicon Valley! This comprehensive workshop covers smart contract development, DeFi protocols, and building decentralized applications. Featuring expert instructors from leading Indian blockchain companies and perfect for developers entering the rapidly growing Indian Web3 ecosystem.',
        type: 'workshop' as const,
        status: 'published' as const,
        organizerId: 'user-morgan-lee',
        startDate: new Date('2025-01-20T10:00:00Z'),
        endDate: new Date('2025-01-20T17:00:00Z'),
        location: 'Microsoft Reactor, Bengaluru',
        isVirtual: false,
        maxParticipants: 100,
        registrationFee: '650.00',
        prizePool: '0.00',
        requirements: ['Basic programming knowledge', 'Laptop with development tools'],
        tags: ['Blockchain', 'Web3', 'Smart Contracts', 'Education'],
        imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800'
      },
      {
        id: 'event-startup-pitch-competition',
        title: 'India Startup Pitch Competition Delhi',
        description: 'Present your startup idea to top Indian VCs, angel investors, and government officials! Win funding, mentorship, and fast-track access to startup India programs. Open to early-stage Indian startups across all sectors including fintech, edtech, healthtech, and agritech. Features pitch sessions, networking with Shark Tank India judges, and expert feedback from industry leaders.',
        type: 'conference' as const,
        status: 'published' as const,
        organizerId: 'user-alex-rivera',
        startDate: new Date('2025-02-01T09:00:00Z'),
        endDate: new Date('2025-02-01T20:00:00Z'),
        location: 'India Habitat Centre, New Delhi',
        isVirtual: false,
        maxParticipants: 200,
        registrationFee: '900.00',
        prizePool: '25000.00',
        requirements: ['Functioning prototype or MVP', 'Pitch deck required', 'Early-stage Indian startup'],
        tags: ['Startups', 'Venture Capital', 'Pitch', 'Funding', 'India'],
        imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800'
      },
      {
        id: 'event-mobile-dev-bootcamp',
        title: 'Mobile App Development Bootcamp Hyderabad',
        description: 'Intensive 3-day mobile app development bootcamp in India\'s Cyberabad! Learn React Native, Flutter, Swift, and Kotlin from leading Indian app developers. Build and deploy your first app targeting the Indian market. Perfect for aspiring entrepreneurs and developers looking to tap into India\'s booming mobile-first economy.',
        type: 'workshop' as const,
        status: 'published' as const,
        organizerId: 'user-taylor-wright',
        startDate: new Date('2025-02-10T09:00:00Z'),
        endDate: new Date('2025-02-12T17:00:00Z'),
        location: 'T-Hub, Hyderabad',
        isVirtual: false,
        maxParticipants: 80,
        registrationFee: '850.00',
        prizePool: '0.00',
        requirements: ['Basic programming knowledge', 'Laptop with development tools', 'Android device recommended'],
        tags: ['Mobile Development', 'iOS', 'Android', 'React Native', 'Flutter'],
        imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800'
      },
      {
        id: 'event-data-science-challenge',
        title: 'Data Science Challenge: Smart India Solutions',
        description: 'Use data science and machine learning to solve pressing Indian challenges! Analyze datasets from agriculture, healthcare, education, and urban planning to build predictive models that can transform India. Sponsored by government initiatives and leading Indian tech companies. Focus areas include crop prediction, disease detection, traffic optimization, and financial inclusion.',
        type: 'hackathon' as const,
        status: 'published' as const,
        organizerId: 'user-jamie-kim',
        startDate: new Date('2025-02-15T08:00:00Z'),
        endDate: new Date('2025-02-16T20:00:00Z'),
        location: 'IIT Chennai, Tamil Nadu',
        isVirtual: false,
        maxParticipants: 300,
        registrationFee: '0.00',
        prizePool: '15000.00',
        requirements: ['Data science/ML experience', 'Python or R knowledge', 'Passion for solving Indian problems'],
        tags: ['Data Science', 'Smart India', 'Machine Learning', 'Social Impact'],
        imageUrl: 'https://images.unsplash.com/photo-1551808525-51a94da548ce?w=800'
      },
      {
        id: 'event-devops-summit',
        title: 'Cloud & DevOps Summit Pune 2025',
        description: 'India\'s premier conference for DevOps professionals and cloud architects! Learn about the latest trends in containerization, microservices, and cloud-native technologies from leading Indian IT companies like TCS, Infosys, and Wipro. Network with industry leaders, discover cutting-edge tools, and explore how Indian enterprises are transforming through DevOps and cloud adoption.',
        type: 'conference' as const,
        status: 'published' as const,
        organizerId: 'user-casey-martinez',
        startDate: new Date('2025-03-01T08:00:00Z'),
        endDate: new Date('2025-03-03T18:00:00Z'),
        location: 'Pune IT Park, Maharashtra',
        isVirtual: false,
        maxParticipants: 1000,
        registrationFee: '1000.00',
        prizePool: '0.00',
        requirements: ['DevOps or cloud experience', 'Professional role in tech', '2+ years experience'],
        tags: ['DevOps', 'Cloud Computing', 'Kubernetes', 'AWS', 'Azure', 'India IT'],
        imageUrl: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800'
      },
      {
        id: 'event-ux-design-thinking',
        title: 'UX Design Thinking Workshop Kolkata',
        description: 'Master user-centered design for the Indian market! Learn hands-on design thinking methodologies, create intuitive user experiences for diverse Indian audiences, conduct user research, and prototype innovative solutions. Focus on designing for multilingual users, varied digital literacy levels, and India\'s unique cultural contexts.',
        type: 'workshop' as const,
        status: 'published' as const,
        organizerId: 'user-alex-rivera',
        startDate: new Date('2025-03-10T10:00:00Z'),
        endDate: new Date('2025-03-10T18:00:00Z'),
        location: 'Webel IT Park, Kolkata',
        isVirtual: false,
        maxParticipants: 50,
        registrationFee: '700.00',
        prizePool: '0.00',
        requirements: ['Design interest', 'Laptop recommended', 'Creativity mindset', 'Basic Hindi/English knowledge'],
        tags: ['UX Design', 'Design Thinking', 'User Research', 'India UX'],
        imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800'
      },
      {
        id: 'event-cybersec-quiz',
        title: 'Cybersecurity Knowledge Challenge India',
        description: 'Test your cybersecurity knowledge in this exciting online quiz competition focused on Indian cyber threats and security frameworks! Covering ethical hacking, network security, cryptography, incident response, and Indian cyber laws. Perfect for security professionals, students, and anyone interested in India\'s growing cybersecurity sector.',
        type: 'quiz' as const,
        status: 'published' as const,
        organizerId: 'user-casey-martinez',
        startDate: new Date('2025-03-15T19:00:00Z'),
        endDate: new Date('2025-03-15T21:00:00Z'),
        location: 'Virtual Event (India)',
        isVirtual: true,
        maxParticipants: 500,
        registrationFee: '500.00',
        prizePool: '12000.00',
        requirements: ['Basic cybersecurity knowledge', 'Internet connection', 'India residence preferred'],
        tags: ['Cybersecurity', 'Quiz', 'Network Security', 'Ethical Hacking', 'India'],
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800'
      }
    ];

    // Initialize users
    for (const userData of userProfiles) {
      const user = await this.upsertUser(userData);
      console.log(`✅ Created user: ${user.firstName} ${user.lastName}`);
    }

    // Initialize events
    for (const eventItem of eventData) {
      const event = await this.createEvent(eventItem);
      console.log(`✅ Created event: ${event.title}`);
      
      // Add analytics for each event
      await this.recordEventMetric(event.id, 'views', Math.floor(Math.random() * 1000) + 100);
      await this.recordEventMetric(event.id, 'registrations', Math.floor(Math.random() * 50) + 10);
      await this.recordEventMetric(event.id, 'engagement_score', Math.floor(Math.random() * 100) + 50);
    }

    await this.initializeRegistrationsAndTeams();
    await this.initializeChatMessages();
    await this.initializeNotifications();
    await this.initializeAIRecommendations();
    
    console.log('🎉 Prototype data initialization complete! Platform is ready.');
  }

  private async initializeRegistrationsAndTeams(): Promise<void> {
    const userIds = Array.from(this.users.keys());
    const eventIds = Array.from(this.events.keys());
    
    // Create realistic registrations
    for (const eventId of eventIds) {
      const registrationCount = Math.floor(Math.random() * 8) + 3; // 3-10 registrations per event
      const selectedUsers = userIds.sort(() => 0.5 - Math.random()).slice(0, registrationCount);
      
      for (const userId of selectedUsers) {
        const registration = await this.registerForEvent(eventId, userId);
        // Simulate successful payments for most registrations
        if (Math.random() > 0.2) {
          await this.updateRegistrationPaymentStatus(registration.id, 'completed', 'pi_' + Math.random().toString(36));
        }
      }
    }
    
    // Create teams for hackathon events
    const hackathonEvents = Array.from(this.events.values()).filter(e => e.type === 'hackathon');
    for (const event of hackathonEvents) {
      const teamCount = Math.floor(Math.random() * 5) + 2; // 2-6 teams per hackathon
      const registrations = await this.getEventRegistrations(event.id);
      
      for (let i = 0; i < teamCount && i < registrations.length; i++) {
        const teamNames = ['Code Crusaders', 'Innovation Squad', 'Tech Titans', 'Data Dynamos', 'AI Avengers', 'Cloud Climbers'];
        const teamName = teamNames[Math.floor(Math.random() * teamNames.length)];
        
        const team = await this.createTeam({
          name: `${teamName} ${i + 1}`,
          description: 'Passionate team ready to build something amazing!',
          eventId: event.id,
          leaderId: registrations[i].userId,
          maxMembers: 4,
          skills: ['JavaScript', 'Python', 'Design', 'Machine Learning'].slice(0, Math.floor(Math.random() * 3) + 2),
          isOpen: Math.random() > 0.3
        });
        
        // Add team members
        const memberCount = Math.floor(Math.random() * 3) + 1; // 1-3 additional members
        for (let j = 1; j <= memberCount && (i + j) < registrations.length; j++) {
          await this.joinTeam(team.id, registrations[i + j].userId || '');
        }
      }
    }
  }

  private async initializeChatMessages(): Promise<void> {
    const eventIds = Array.from(this.events.keys());
    const userIds = Array.from(this.users.keys());
    
    const sampleMessages = [
      'Hey everyone! Really excited for this event 🎉',
      'Looking forward to meeting you all and building something awesome!',
      'Anyone interested in forming a team? I have experience with React and Node.js',
      'This is going to be an amazing learning experience',
      'Can\'t wait to see what innovative solutions we come up with!',
      'First time at this type of event - any tips for newcomers?',
      'The agenda looks fantastic. Especially excited about the AI workshops!',
      'Who else is working on climate tech solutions?',
      'Anyone want to grab coffee during the break?',
      'Thanks to the organizers for putting together such a great event!'
    ];
    
    for (const eventId of eventIds) {
      const messageCount = Math.floor(Math.random() * 8) + 3; // 3-10 messages per event
      
      for (let i = 0; i < messageCount; i++) {
        const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
        const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
        
        await this.createChatMessage({
          eventId,
          userId: randomUser,
          message: randomMessage,
          messageType: 'text'
        });
      }
    }
  }

  private async initializeNotifications(): Promise<void> {
    const userIds = Array.from(this.users.keys());
    const events = Array.from(this.events.values());
    
    for (const userId of userIds) {
      // Event recommendations
      await this.createNotification({
        userId,
        title: 'New Events You Might Like',
        message: 'Check out these upcoming events that match your interests!',
        type: 'event_recommendation'
      });
      
      // Registration confirmations
      const userRegistrations = await this.getUserRegistrations(userId);
      if (userRegistrations.length > 0) {
        const event = events.find(e => e.id === userRegistrations[0].eventId);
        if (event) {
          await this.createNotification({
            userId,
            title: 'Registration Confirmed',
            message: `You're all set for ${event.title}! Event starts ${event.startDate.toLocaleDateString()}.`,
            type: 'registration_confirmed'
          });
        }
      }
      
      // Platform welcome
      await this.createNotification({
        userId,
        title: 'Welcome to Ovento!',
        message: 'Discover amazing events, connect with like-minded people, and build something incredible.',
        type: 'welcome'
      });
    }
  }

  private async initializeAIRecommendations(): Promise<void> {
    const userIds = Array.from(this.users.keys());
    const events = Array.from(this.events.values());
    
    for (const userId of userIds) {
      const user = await this.getUser(userId);
      if (!user) continue;
      
      // Smart event recommendations based on user skills and interests
      for (const event of events) {
        let score = 0.5; // Base score
        let reasons: string[] = [];
        
        // Match skills
        if (user.skills && event.tags) {
          const skillMatches = user.skills.filter(skill => 
            event.tags?.some(tag => tag.toLowerCase().includes(skill.toLowerCase()))
          );
          if (skillMatches.length > 0) {
            score += 0.3;
            reasons.push(`Matches your skills: ${skillMatches.join(', ')}`);
          }
        }
        
        // Match interests
        if (user.interests && event.tags) {
          const interestMatches = user.interests.filter(interest => 
            event.tags?.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))
          );
          if (interestMatches.length > 0) {
            score += 0.2;
            reasons.push(`Aligns with your interests: ${interestMatches.join(', ')}`);
          }
        }
        
        // Bonus for virtual events (more accessible)
        if (event.isVirtual) {
          score += 0.1;
          reasons.push('Virtual event - join from anywhere');
        }
        
        // Only recommend if score is above threshold
        if (score > 0.6) {
          await this.createAIRecommendation(
            userId, 
            'event', 
            event.id, 
            Math.min(score, 0.99), 
            reasons.join('; ')
          );
        }
      }
      
      // Team recommendations
      const teams = Array.from(this.teams.values()).filter(t => t.isOpen);
      for (const team of teams.slice(0, 3)) { // Limit recommendations
        if (team.skills && user.skills) {
          const skillOverlap = team.skills.filter(skill => user.skills?.includes(skill));
          if (skillOverlap.length > 0) {
            await this.createAIRecommendation(
              userId,
              'team',
              team.id,
              0.8,
              `Great skill match: ${skillOverlap.join(', ')}`
            );
          }
        }
      }
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    await this.initializeData();
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const now = new Date();
    const id = userData.id || this.generateId();
    const user: User = {
      id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      stripeCustomerId: userData.stripeCustomerId || null,
      stripeSubscriptionId: userData.stripeSubscriptionId || null,
      skills: userData.skills || null,
      interests: userData.interests || null,
      bio: userData.bio || null,
      createdAt: this.users.get(id)?.createdAt || now,
      updatedAt: now,
    };
    
    this.users.set(id, user);
    console.log(`💾 IN-MEMORY: Upserted user ${id}`);
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = {
      ...user,
      stripeCustomerId,
      stripeSubscriptionId: stripeSubscriptionId || null,
      updatedAt: new Date(),
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Event operations
  async createEvent(event: InsertEvent): Promise<Event> {
    await this.initializeData();
    const now = new Date();
    const newEvent: Event = {
      id: this.generateId(),
      title: event.title,
      description: event.description || null,
      type: event.type,
      status: event.status || 'draft',
      organizerId: event.organizerId || null,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location || null,
      isVirtual: event.isVirtual || false,
      maxParticipants: event.maxParticipants || null,
      registrationFee: event.registrationFee || '0',
      prizePool: event.prizePool || '0',
      requirements: event.requirements || null,
      tags: event.tags || null,
      imageUrl: event.imageUrl || null,
      createdAt: now,
      updatedAt: now,
    };
    
    this.events.set(newEvent.id, newEvent);
    console.log(`💾 IN-MEMORY: Created event ${newEvent.id}`);
    return newEvent;
  }

  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getEvents(filters?: { type?: string; status?: string; search?: string }): Promise<Event[]> {
    await this.initializeData();
    let events = Array.from(this.events.values());
    
    if (filters?.type) {
      events = events.filter(e => e.type === filters.type);
    }
    
    if (filters?.status) {
      events = events.filter(e => e.status === filters.status);
    }
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      events = events.filter(e => e.title.toLowerCase().includes(searchLower));
    }
    
    return events.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  async updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event> {
    const event = this.events.get(id);
    if (!event) {
      throw new Error("Event not found");
    }
    
    const updatedEvent = {
      ...event,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    this.events.delete(id);
    console.log(`💾 IN-MEMORY: Deleted event ${id}`);
  }

  async getUserEvents(userId: string): Promise<Event[]> {
    await this.initializeData();
    const registrations = Array.from(this.eventRegistrations.values())
      .filter(reg => reg.userId === userId);
    
    const eventIds = registrations.map(reg => reg.eventId).filter((id): id is string => id !== null);
    return eventIds.map(id => this.events.get(id)).filter((e): e is Event => !!e)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    return Array.from(this.events.values())
      .filter(event => event.organizerId === organizerId)
      .sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      });
  }

  // Registration operations
  async registerForEvent(eventId: string, userId: string, teamId?: string): Promise<EventRegistration> {
    const registration: EventRegistration = {
      id: this.generateId(),
      eventId,
      userId,
      teamId: teamId || null,
      paymentStatus: 'pending',
      paymentIntentId: null,
      registeredAt: new Date(),
    };
    
    this.eventRegistrations.set(registration.id, registration);
    console.log(`💾 IN-MEMORY: Registered user ${userId} for event ${eventId}`);
    return registration;
  }

  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    return Array.from(this.eventRegistrations.values())
      .filter(reg => reg.eventId === eventId);
  }

  async getUserRegistrations(userId: string): Promise<EventRegistration[]> {
    return Array.from(this.eventRegistrations.values())
      .filter(reg => reg.userId === userId)
      .sort((a, b) => {
        const aDate = a.registeredAt ? new Date(a.registeredAt).getTime() : 0;
        const bDate = b.registeredAt ? new Date(b.registeredAt).getTime() : 0;
        return bDate - aDate;
      });
  }

  async updateRegistrationPaymentStatus(id: string, status: string, paymentIntentId?: string): Promise<EventRegistration> {
    const registration = this.eventRegistrations.get(id);
    if (!registration) {
      throw new Error("Registration not found");
    }
    
    const updatedRegistration = {
      ...registration,
      paymentStatus: status,
      paymentIntentId: paymentIntentId || null,
    };
    
    this.eventRegistrations.set(id, updatedRegistration);
    return updatedRegistration;
  }

  // Team operations (enhanced with invite codes)
  async createTeam(team: InsertTeam): Promise<Team> {
    const now = new Date();
    const newTeam: Team = {
      id: this.generateId(),
      name: team.name,
      description: team.description || null,
      eventId: team.eventId || null,
      leaderId: team.leaderId || null,
      maxMembers: team.maxMembers || 4,
      skills: team.skills || null,
      isOpen: team.isOpen ?? true,
      inviteCode: this.generateInviteCode(),
      createdAt: now,
      updatedAt: now,
    };
    
    this.teams.set(newTeam.id, newTeam);
    
    // Add leader as team member
    if (team.leaderId) {
      this.teamMembers.set(newTeam.id, [team.leaderId]);
    }
    
    console.log(`💾 IN-MEMORY: Created team ${newTeam.id} with invite code ${newTeam.inviteCode}`);
    return newTeam;
  }

  async getTeam(id: string): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async getEventTeams(eventId: string): Promise<Team[]> {
    const teams = Array.from(this.teams.values())
      .filter(team => team.eventId === eventId)
      .sort((a, b) => a.name.localeCompare(b.name));
    
    // Populate team members for each team
    for (const team of teams) {
      const memberIds = this.teamMembers.get(team.id) || [];
      const members = memberIds.map(id => this.users.get(id)).filter((u): u is User => !!u);
      const leader = team.leaderId ? this.users.get(team.leaderId) : undefined;
      
      (team as any).members = members;
      (team as any).leader = leader;
    }
    
    return teams;
  }

  async joinTeam(teamId: string, userId: string): Promise<void> {
    const members = this.teamMembers.get(teamId) || [];
    if (!members.includes(userId)) {
      members.push(userId);
      this.teamMembers.set(teamId, members);
    }
  }

  async leaveTeam(teamId: string, userId: string): Promise<void> {
    const members = this.teamMembers.get(teamId) || [];
    this.teamMembers.set(teamId, members.filter(id => id !== userId));
  }

  async getTeamMembers(teamId: string): Promise<User[]> {
    const memberIds = this.teamMembers.get(teamId) || [];
    return memberIds.map(id => this.users.get(id)).filter((u): u is User => !!u);
  }

  async joinTeamByInviteCode(inviteCode: string, userId: string): Promise<Team> {
    const team = Array.from(this.teams.values())
      .find(t => t.inviteCode === inviteCode);
    
    if (!team) {
      throw new Error('Invalid invite code');
    }
    
    const currentMembers = this.teamMembers.get(team.id) || [];
    if (currentMembers.length >= team.maxMembers) {
      throw new Error('Team is full');
    }
    
    if (currentMembers.includes(userId)) {
      throw new Error('User is already a member');
    }
    
    currentMembers.push(userId);
    this.teamMembers.set(team.id, currentMembers);
    
    console.log(`💾 IN-MEMORY: User ${userId} joined team ${team.id} via invite code`);
    return team;
  }

  async getTrendingEvents(): Promise<Event[]> {
    await this.initializeData();
    
    // Mock trending logic - in real app would be based on metrics
    const events = Array.from(this.events.values())
      .filter(event => ['published', 'registration_open', 'live'].includes(event.status))
      .sort((a, b) => {
        // Sort by recent creation and high prize pools
        const aScore = (a.prizePool ? parseFloat(a.prizePool) : 0) + 
                      (new Date(a.createdAt || 0).getTime() / 1000000);
        const bScore = (b.prizePool ? parseFloat(b.prizePool) : 0) + 
                      (new Date(b.createdAt || 0).getTime() / 1000000);
        return bScore - aScore;
      })
      .slice(0, 10);
    
    return events;
  }

  // Chat operations (simplified)
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const chatMessage: ChatMessage = {
      id: this.generateId(),
      eventId: message.eventId || null,
      teamId: message.teamId || null,
      userId: message.userId || null,
      message: message.message,
      messageType: message.messageType || 'text',
      fileUrl: message.fileUrl || null,
      createdAt: new Date(),
    };
    
    const eventKey = message.eventId || 'general';
    const eventMessages = this.chatMessages.get(eventKey) || [];
    eventMessages.push(chatMessage);
    this.chatMessages.set(eventKey, eventMessages);
    
    return chatMessage;
  }

  async getEventChatMessages(eventId: string, limit = 50): Promise<ChatMessage[]> {
    const messages = this.chatMessages.get(eventId) || [];
    return messages
      .sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      })
      .slice(0, limit);
  }

  async getTeamChatMessages(teamId: string, limit = 50): Promise<ChatMessage[]> {
    // Simplified - in real implementation would filter by teamId
    return [];
  }

  // AI recommendations (mock implementation)
  async createAIRecommendation(userId: string, type: string, entityId: string, score: number, reason: string): Promise<AIRecommendation> {
    const recommendation: AIRecommendation = {
      id: this.generateId(),
      userId,
      type,
      entityId,
      score: score.toString(),
      reason,
      createdAt: new Date(),
    };
    
    const userRecs = this.aiRecommendations.get(userId) || [];
    userRecs.push(recommendation);
    this.aiRecommendations.set(userId, userRecs);
    
    return recommendation;
  }

  async getUserRecommendations(userId: string, type?: string): Promise<AIRecommendation[]> {
    await this.initializeData();
    let recommendations = this.aiRecommendations.get(userId) || [];
    
    if (type) {
      recommendations = recommendations.filter(rec => rec.type === type);
    }
    
    return recommendations.sort((a, b) => {
      const aScore = a.score ? parseFloat(a.score) : 0;
      const bScore = b.score ? parseFloat(b.score) : 0;
      return bScore - aScore;
    });
  }

  // Notifications (mock implementation)
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const newNotification: Notification = {
      id: this.generateId(),
      userId: notification.userId || null,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: false,
      data: notification.data || null,
      createdAt: new Date(),
    };
    
    const userKey = notification.userId || 'general';
    const userNotifications = this.notifications.get(userKey) || [];
    userNotifications.push(newNotification);
    this.notifications.set(userKey, userNotifications);
    
    return newNotification;
  }

  async getUserNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
    let notifications = this.notifications.get(userId) || [];
    
    if (unreadOnly) {
      notifications = notifications.filter(notif => !notif.read);
    }
    
    return notifications.sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });
  }

  async markNotificationRead(id: string): Promise<void> {
    // Find and update notification across all users
    for (const [userId, notifications] of Array.from(this.notifications.entries())) {
      const notification = notifications.find((n: Notification) => n.id === id);
      if (notification) {
        notification.read = true;
        break;
      }
    }
  }

  // Analytics (mock implementation)
  async recordEventMetric(eventId: string, metric: string, value: number): Promise<void> {
    const analytic: EventAnalytic = {
      id: this.generateId(),
      eventId,
      metric,
      value: value.toString(),
      date: new Date(),
    };
    
    const eventAnalytics = this.eventAnalytics.get(eventId) || [];
    eventAnalytics.push(analytic);
    this.eventAnalytics.set(eventId, eventAnalytics);
  }

  async getEventAnalytics(eventId: string, metric?: string): Promise<EventAnalytic[]> {
    let analytics = this.eventAnalytics.get(eventId) || [];
    
    if (metric) {
      analytics = analytics.filter(a => a.metric === metric);
    }
    
    return analytics.sort((a, b) => {
      const aDate = a.date ? new Date(a.date).getTime() : 0;
      const bDate = b.date ? new Date(b.date).getTime() : 0;
      return bDate - aDate;
    });
  }

  // Search and discovery (simplified)
  async searchEvents(query: string): Promise<Event[]> {
    const searchLower = query.toLowerCase();
    return Array.from(this.events.values())
      .filter(event => event.title.toLowerCase().includes(searchLower))
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 20);
  }

  async getRecommendedEvents(userId: string): Promise<Event[]> {
    const recommendations = await this.getUserRecommendations(userId, 'event');
    const eventIds = recommendations.map(r => r.entityId).filter(Boolean) as string[];
    
    return eventIds.map(id => this.events.get(id)).filter((e): e is Event => !!e)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  async findTeammates(userId: string, skills: string[]): Promise<User[]> {
    if (skills.length === 0) {
      return [];
    }
    
    return Array.from(this.users.values())
      .filter(user => 
        user.id !== userId && 
        user.skills && 
        skills.some(skill => user.skills?.includes(skill))
      )
      .slice(0, 20);
  }

  // Enhanced registration management
  async updateRegistrationStatus(id: string, status: string, organizerNotes?: string): Promise<EventRegistration> {
    const registration = this.eventRegistrations.get(id);
    if (!registration) {
      throw new Error('Registration not found');
    }

    const updatedRegistration = {
      ...registration,
      status: status as any,
      organizerNotes: organizerNotes || registration.organizerNotes,
      updatedAt: new Date(),
    };

    this.eventRegistrations.set(id, updatedRegistration);
    return updatedRegistration;
  }

  async withdrawFromEvent(registrationId: string, reason?: string): Promise<EventRegistration> {
    const registration = this.eventRegistrations.get(registrationId);
    if (!registration) {
      throw new Error('Registration not found');
    }

    const updatedRegistration = {
      ...registration,
      status: 'withdrawn' as any,
      withdrawnAt: new Date(),
      withdrawalReason: reason,
      updatedAt: new Date(),
    };

    this.eventRegistrations.set(registrationId, updatedRegistration);
    return updatedRegistration;
  }

  async bulkUpdateRegistrations(registrationIds: string[], status: string, organizerNotes?: string): Promise<EventRegistration[]> {
    const results: EventRegistration[] = [];
    
    for (const id of registrationIds) {
      try {
        const updated = await this.updateRegistrationStatus(id, status, organizerNotes);
        results.push(updated);
      } catch (error) {
        // Continue with other registrations
      }
    }
    
    return results;
  }

  async checkInParticipant(registrationId: string): Promise<EventRegistration> {
    const registration = this.eventRegistrations.get(registrationId);
    if (!registration) {
      throw new Error('Registration not found');
    }

    const updatedRegistration = {
      ...registration,
      checkedInAt: new Date(),
      updatedAt: new Date(),
    };

    this.eventRegistrations.set(registrationId, updatedRegistration);
    return updatedRegistration;
  }

  // RSVP operations
  async createRsvp(rsvpData: InsertEventRsvp): Promise<EventRsvp> {
    const rsvp: EventRsvp = {
      id: this.generateId(),
      ...rsvpData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.eventRsvps.set(rsvp.id, rsvp);
    return rsvp;
  }

  async updateRsvp(rsvpId: string, status: string, data?: any): Promise<EventRsvp> {
    const rsvp = this.eventRsvps.get(rsvpId);
    if (!rsvp) {
      throw new Error('RSVP not found');
    }

    const updatedRsvp = {
      ...rsvp,
      status: status as any,
      respondedAt: new Date(),
      dietary_restrictions: data?.dietary_restrictions || rsvp.dietary_restrictions,
      accessibility_needs: data?.accessibility_needs || rsvp.accessibility_needs,
      emergency_contact: data?.emergency_contact || rsvp.emergency_contact,
      notes: data?.notes || rsvp.notes,
      updatedAt: new Date(),
    };

    this.eventRsvps.set(rsvpId, updatedRsvp);
    return updatedRsvp;
  }

  async getRsvpsByEvent(eventId: string): Promise<EventRsvp[]> {
    return Array.from(this.eventRsvps.values())
      .filter(rsvp => rsvp.eventId === eventId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getRsvpByUser(eventId: string, userId: string): Promise<EventRsvp | undefined> {
    return Array.from(this.eventRsvps.values())
      .find(rsvp => rsvp.eventId === eventId && rsvp.userId === userId);
  }

  async getRsvpsNeedingReminder(eventId: string): Promise<EventRsvp[]> {
    const event = this.events.get(eventId);
    if (!event || !event.rsvpDeadline) return [];

    const reminderThreshold = new Date();
    reminderThreshold.setHours(reminderThreshold.getHours() + 24); // Send reminders 24h before deadline

    return Array.from(this.eventRsvps.values())
      .filter(rsvp => 
        rsvp.eventId === eventId && 
        rsvp.status === 'pending' &&
        (!rsvp.lastReminderAt || 
         new Date(rsvp.lastReminderAt).getTime() < new Date().getTime() - 24 * 60 * 60 * 1000)
      );
  }

  async sendRsvpReminder(rsvpId: string): Promise<void> {
    const rsvp = this.eventRsvps.get(rsvpId);
    if (!rsvp) return;

    const updatedRsvp = {
      ...rsvp,
      remindersSent: (rsvp.remindersSent || 0) + 1,
      lastReminderAt: new Date(),
      updatedAt: new Date(),
    };

    this.eventRsvps.set(rsvpId, updatedRsvp);
    console.log(`📧 RSVP reminder sent for event ${rsvp.eventId} to user ${rsvp.userId}`);
  }

  // Project submission operations
  async createProjectSubmission(submissionData: InsertProjectSubmission): Promise<ProjectSubmission> {
    const submission: ProjectSubmission = {
      id: this.generateId(),
      ...submissionData,
      status: 'draft' as any,
      isPublic: submissionData.isPublic ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.projectSubmissions.set(submission.id, submission);
    return submission;
  }

  async updateProjectSubmission(id: string, updates: Partial<InsertProjectSubmission>): Promise<ProjectSubmission> {
    const submission = this.projectSubmissions.get(id);
    if (!submission) {
      throw new Error('Project submission not found');
    }

    const updatedSubmission = {
      ...submission,
      ...updates,
      updatedAt: new Date(),
    };

    this.projectSubmissions.set(id, updatedSubmission);
    return updatedSubmission;
  }

  async getProjectSubmission(id: string): Promise<ProjectSubmission | undefined> {
    return this.projectSubmissions.get(id);
  }

  async getEventSubmissions(eventId: string): Promise<ProjectSubmission[]> {
    return Array.from(this.projectSubmissions.values())
      .filter(submission => submission.eventId === eventId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getTeamSubmission(eventId: string, teamId: string): Promise<ProjectSubmission | undefined> {
    return Array.from(this.projectSubmissions.values())
      .find(submission => submission.eventId === eventId && submission.teamId === teamId);
  }

  async getUserSubmission(eventId: string, userId: string): Promise<ProjectSubmission | undefined> {
    return Array.from(this.projectSubmissions.values())
      .find(submission => submission.eventId === eventId && submission.userId === userId);
  }

  async submitProject(submissionId: string): Promise<ProjectSubmission> {
    const submission = this.projectSubmissions.get(submissionId);
    if (!submission) {
      throw new Error('Project submission not found');
    }

    const updatedSubmission = {
      ...submission,
      status: 'submitted' as any,
      submittedAt: new Date(),
      updatedAt: new Date(),
    };

    this.projectSubmissions.set(submissionId, updatedSubmission);
    return updatedSubmission;
  }

  async reviewSubmission(submissionId: string, reviewerId: string, score: number, notes: string): Promise<ProjectSubmission> {
    const submission = this.projectSubmissions.get(submissionId);
    if (!submission) {
      throw new Error('Project submission not found');
    }

    const updatedSubmission = {
      ...submission,
      status: 'approved' as any,
      reviewerId,
      reviewNotes: notes,
      score: score.toString(),
      reviewedAt: new Date(),
      updatedAt: new Date(),
    };

    this.projectSubmissions.set(submissionId, updatedSubmission);
    return updatedSubmission;
  }

  // File upload operations
  async createSubmissionFile(fileData: InsertSubmissionFile): Promise<SubmissionFile> {
    const file: SubmissionFile = {
      id: this.generateId(),
      ...fileData,
      uploadedAt: new Date(),
    };

    const files = this.submissionFiles.get(fileData.submissionId) || [];
    files.push(file);
    this.submissionFiles.set(fileData.submissionId, files);
    
    return file;
  }

  async getSubmissionFiles(submissionId: string): Promise<SubmissionFile[]> {
    return this.submissionFiles.get(submissionId) || [];
  }

  async deleteSubmissionFile(fileId: string): Promise<void> {
    for (const [submissionId, files] of this.submissionFiles.entries()) {
      const fileIndex = files.findIndex(f => f.id === fileId);
      if (fileIndex !== -1) {
        files.splice(fileIndex, 1);
        this.submissionFiles.set(submissionId, files);
        break;
      }
    }
  }

  // Organizer dashboard operations
  async getEventDashboardStats(eventId: string, organizerId: string): Promise<any> {
    const event = this.events.get(eventId);
    if (!event || event.organizerId !== organizerId) {
      throw new Error('Event not found or access denied');
    }

    const registrations = Array.from(this.eventRegistrations.values())
      .filter(reg => reg.eventId === eventId);
    
    const rsvps = Array.from(this.eventRsvps.values())
      .filter(rsvp => rsvp.eventId === eventId);
    
    const submissions = Array.from(this.projectSubmissions.values())
      .filter(sub => sub.eventId === eventId);

    return {
      totalRegistrations: registrations.length,
      acceptedRegistrations: registrations.filter(r => r.status === 'accepted').length,
      pendingRegistrations: registrations.filter(r => r.status === 'pending').length,
      withdrawnRegistrations: registrations.filter(r => r.status === 'withdrawn').length,
      checkedInCount: registrations.filter(r => r.checkedInAt).length,
      totalRsvps: rsvps.length,
      confirmedRsvps: rsvps.filter(r => r.status === 'confirmed').length,
      pendingRsvps: rsvps.filter(r => r.status === 'pending').length,
      totalSubmissions: submissions.length,
      submittedProjects: submissions.filter(s => s.status === 'submitted').length,
      approvedSubmissions: submissions.filter(s => s.status === 'approved').length,
    };
  }

  async getEventParticipants(eventId: string, organizerId: string): Promise<any[]> {
    const event = this.events.get(eventId);
    if (!event || event.organizerId !== organizerId) {
      throw new Error('Event not found or access denied');
    }

    const registrations = Array.from(this.eventRegistrations.values())
      .filter(reg => reg.eventId === eventId);

    const participants = [];
    
    for (const registration of registrations) {
      if (!registration.userId) continue;
      
      const user = this.users.get(registration.userId);
      const rsvp = Array.from(this.eventRsvps.values())
        .find(r => r.eventId === eventId && r.userId === registration.userId);
      
      participants.push({
        ...user,
        registration,
        rsvp,
      });
    }

    return participants;
  }

  async sendBulkAnnouncement(eventId: string, organizerId: string, subject: string, message: string, recipientType: string): Promise<void> {
    const event = this.events.get(eventId);
    if (!event || event.organizerId !== organizerId) {
      throw new Error('Event not found or access denied');
    }

    const registrations = Array.from(this.eventRegistrations.values())
      .filter(reg => {
        if (reg.eventId !== eventId) return false;
        if (recipientType === 'all') return true;
        if (recipientType === 'accepted') return reg.status === 'accepted';
        if (recipientType === 'pending') return reg.status === 'pending';
        return false;
      });

    // Create notifications for all recipients
    for (const registration of registrations) {
      if (!registration.userId) continue;
      
      const notification: Notification = {
        id: this.generateId(),
        userId: registration.userId,
        title: subject,
        message: message,
        type: 'event_announcement',
        read: false,
        data: { eventId, announcementType: 'bulk' },
        createdAt: new Date(),
      };

      const userNotifications = this.notifications.get(registration.userId) || [];
      userNotifications.push(notification);
      this.notifications.set(registration.userId, userNotifications);
    }

    console.log(`📢 Bulk announcement sent to ${registrations.length} participants for event ${eventId}`);
  }

  async getTrendingEvents(): Promise<Event[]> {
    const now = new Date();
    const events = Array.from(this.events.values())
      .filter(event => 
        event.status === 'published' && 
        new Date(event.startDate) > now
      )
      .map(event => {
        const registrationCount = Array.from(this.eventRegistrations.values())
          .filter(reg => reg.eventId === event.id).length;
        return { event, registrationCount };
      })
      .sort((a, b) => b.registrationCount - a.registrationCount)
      .slice(0, 10)
      .map(item => item.event);

    return events;
  }
}