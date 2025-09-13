import {
  users,
  events,
  teams,
  teamMembers,
  eventRegistrations,
  chatMessages,
  aiRecommendations,
  notifications,
  eventAnalytics,
  eventRsvps,
  projectSubmissions,
  submissionFiles,
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
import { db } from "./db";
import { eq, and, desc, asc, sql, ilike, inArray } from "drizzle-orm";
import { config } from "./config";
import { InMemoryStorage } from "./memoryStorage";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User>;
  
  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: string): Promise<Event | undefined>;
  getEvents(filters?: { type?: string; status?: string; search?: string }): Promise<Event[]>;
  updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  getUserEvents(userId: string): Promise<Event[]>;
  getEventsByOrganizer(organizerId: string): Promise<Event[]>;
  
  // Registration operations
  registerForEvent(eventId: string, userId: string, teamId?: string): Promise<EventRegistration>;
  getEventRegistrations(eventId: string): Promise<EventRegistration[]>;
  getUserRegistrations(userId: string): Promise<EventRegistration[]>;
  updateRegistrationPaymentStatus(id: string, status: string, paymentIntentId?: string): Promise<EventRegistration>;
  
  // Team operations
  createTeam(team: InsertTeam): Promise<Team>;
  getTeam(id: string): Promise<Team | undefined>;
  getEventTeams(eventId: string): Promise<Team[]>;
  joinTeam(teamId: string, userId: string): Promise<void>;
  joinTeamByInviteCode(inviteCode: string, userId: string): Promise<Team>;
  leaveTeam(teamId: string, userId: string): Promise<void>;
  getTeamMembers(teamId: string): Promise<User[]>;
  
  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getEventChatMessages(eventId: string, limit?: number): Promise<ChatMessage[]>;
  getTeamChatMessages(teamId: string, limit?: number): Promise<ChatMessage[]>;
  
  // AI recommendations
  createAIRecommendation(userId: string, type: string, entityId: string, score: number, reason: string): Promise<AIRecommendation>;
  getUserRecommendations(userId: string, type?: string): Promise<AIRecommendation[]>;
  
  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
  
  // Analytics
  recordEventMetric(eventId: string, metric: string, value: number): Promise<void>;
  getEventAnalytics(eventId: string, metric?: string): Promise<EventAnalytic[]>;
  
  // Search and discovery
  searchEvents(query: string): Promise<Event[]>;
  getRecommendedEvents(userId: string): Promise<Event[]>;
  getTrendingEvents(): Promise<Event[]>;
  findTeammates(userId: string, skills: string[]): Promise<User[]>;

  // Enhanced registration management
  updateRegistrationStatus(id: string, status: string, organizerNotes?: string): Promise<EventRegistration>;
  withdrawFromEvent(registrationId: string, reason?: string): Promise<EventRegistration>;
  bulkUpdateRegistrations(registrationIds: string[], status: string, organizerNotes?: string): Promise<EventRegistration[]>;
  checkInParticipant(registrationId: string): Promise<EventRegistration>;

  // RSVP operations
  createRsvp(rsvp: InsertEventRsvp): Promise<EventRsvp>;
  updateRsvp(rsvpId: string, status: string, data?: any): Promise<EventRsvp>;
  getRsvpsByEvent(eventId: string): Promise<EventRsvp[]>;
  getRsvpByUser(eventId: string, userId: string): Promise<EventRsvp | undefined>;
  getRsvpsNeedingReminder(eventId: string): Promise<EventRsvp[]>;
  sendRsvpReminder(rsvpId: string): Promise<void>;

  // Project submission operations
  createProjectSubmission(submission: InsertProjectSubmission): Promise<ProjectSubmission>;
  updateProjectSubmission(id: string, updates: Partial<InsertProjectSubmission>): Promise<ProjectSubmission>;
  getProjectSubmission(id: string): Promise<ProjectSubmission | undefined>;
  getEventSubmissions(eventId: string): Promise<ProjectSubmission[]>;
  getTeamSubmission(eventId: string, teamId: string): Promise<ProjectSubmission | undefined>;
  getUserSubmission(eventId: string, userId: string): Promise<ProjectSubmission | undefined>;
  submitProject(submissionId: string): Promise<ProjectSubmission>;
  reviewSubmission(submissionId: string, reviewerId: string, score: number, notes: string): Promise<ProjectSubmission>;

  // File upload operations
  createSubmissionFile(file: InsertSubmissionFile): Promise<SubmissionFile>;
  getSubmissionFiles(submissionId: string): Promise<SubmissionFile[]>;
  deleteSubmissionFile(fileId: string): Promise<void>;

  // Organizer dashboard operations
  getEventDashboardStats(eventId: string, organizerId: string): Promise<any>;
  getEventParticipants(eventId: string, organizerId: string): Promise<any[]>;
  sendBulkAnnouncement(eventId: string, organizerId: string, subject: string, message: string, recipientType: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Event operations
  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getEvents(filters?: { type?: string; status?: string; search?: string }): Promise<Event[]> {
    const conditions = [];
    
    if (filters?.type) {
      conditions.push(eq(events.type, filters.type as any));
    }
    
    if (filters?.status) {
      conditions.push(eq(events.status, filters.status as any));
    }
    
    if (filters?.search) {
      conditions.push(ilike(events.title, `%${filters.search}%`));
    }
    
    let query = db.select().from(events);
    
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }
    
    return await query.orderBy(desc(events.startDate));
  }

  async updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event> {
    const [event] = await db
      .update(events)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return event;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  async getUserEvents(userId: string): Promise<Event[]> {
    return await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        type: events.type,
        status: events.status,
        organizerId: events.organizerId,
        startDate: events.startDate,
        endDate: events.endDate,
        location: events.location,
        isVirtual: events.isVirtual,
        maxParticipants: events.maxParticipants,
        registrationFee: events.registrationFee,
        prizePool: events.prizePool,
        requirements: events.requirements,
        tags: events.tags,
        imageUrl: events.imageUrl,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
      })
      .from(events)
      .innerJoin(eventRegistrations, eq(events.id, eventRegistrations.eventId))
      .where(eq(eventRegistrations.userId, userId))
      .orderBy(desc(events.startDate));
  }

  async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.organizerId, organizerId))
      .orderBy(desc(events.createdAt));
  }

  // Registration operations
  async registerForEvent(eventId: string, userId: string, teamId?: string): Promise<EventRegistration> {
    const [registration] = await db
      .insert(eventRegistrations)
      .values({ eventId, userId, teamId })
      .returning();
    return registration;
  }

  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    return await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId));
  }

  async getUserRegistrations(userId: string): Promise<EventRegistration[]> {
    return await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.userId, userId))
      .orderBy(desc(eventRegistrations.registeredAt));
  }

  async updateRegistrationPaymentStatus(id: string, status: string, paymentIntentId?: string): Promise<EventRegistration> {
    const [registration] = await db
      .update(eventRegistrations)
      .set({ paymentStatus: status, paymentIntentId })
      .where(eq(eventRegistrations.id, id))
      .returning();
    return registration;
  }

  // Team operations
  async createTeam(team: InsertTeam): Promise<Team> {
    const [newTeam] = await db.insert(teams).values(team).returning();
    
    // Add the leader as a team member
    if (team.leaderId) {
      await db.insert(teamMembers).values({
        teamId: newTeam.id,
        userId: team.leaderId,
        role: 'leader',
      });
    }
    
    return newTeam;
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async getEventTeams(eventId: string): Promise<Team[]> {
    return await db
      .select()
      .from(teams)
      .where(eq(teams.eventId, eventId))
      .orderBy(asc(teams.name));
  }

  async joinTeam(teamId: string, userId: string): Promise<void> {
    await db.insert(teamMembers).values({
      teamId,
      userId,
      role: 'member',
    });
  }

  async leaveTeam(teamId: string, userId: string): Promise<void> {
    await db
      .delete(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
  }

  async getTeamMembers(teamId: string): Promise<User[]> {
    return await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        stripeCustomerId: users.stripeCustomerId,
        stripeSubscriptionId: users.stripeSubscriptionId,
        skills: users.skills,
        interests: users.interests,
        bio: users.bio,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .innerJoin(teamMembers, eq(users.id, teamMembers.userId))
      .where(eq(teamMembers.teamId, teamId));
  }

  // Chat operations
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async getEventChatMessages(eventId: string, limit = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.eventId, eventId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async getTeamChatMessages(teamId: string, limit = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.teamId, teamId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  // AI recommendations
  async createAIRecommendation(userId: string, type: string, entityId: string, score: number, reason: string): Promise<AIRecommendation> {
    const [recommendation] = await db
      .insert(aiRecommendations)
      .values({ userId, type, entityId, score: score.toString(), reason })
      .returning();
    return recommendation;
  }

  async getUserRecommendations(userId: string, type?: string): Promise<AIRecommendation[]> {
    const conditions = [eq(aiRecommendations.userId, userId)];
    
    if (type) {
      conditions.push(eq(aiRecommendations.type, type));
    }
    
    const query = db
      .select()
      .from(aiRecommendations)
      .where(conditions.length === 1 ? conditions[0] : and(...conditions));
    
    return await query.orderBy(desc(aiRecommendations.score));
  }

  // Notifications
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getUserNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
    const conditions = [eq(notifications.userId, userId)];
    
    if (unreadOnly) {
      conditions.push(eq(notifications.read, false));
    }
    
    const query = db
      .select()
      .from(notifications)
      .where(conditions.length === 1 ? conditions[0] : and(...conditions));
    
    return await query.orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }

  // Analytics
  async recordEventMetric(eventId: string, metric: string, value: number): Promise<void> {
    await db.insert(eventAnalytics).values({
      eventId,
      metric,
      value: value.toString(),
    });
  }

  async getEventAnalytics(eventId: string, metric?: string): Promise<EventAnalytic[]> {
    const conditions = [eq(eventAnalytics.eventId, eventId)];
    
    if (metric) {
      conditions.push(eq(eventAnalytics.metric, metric));
    }
    
    const query = db
      .select()
      .from(eventAnalytics)
      .where(conditions.length === 1 ? conditions[0] : and(...conditions));
    
    return await query.orderBy(desc(eventAnalytics.date));
  }

  // Search and discovery
  async searchEvents(query: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(ilike(events.title, `%${query}%`))
      .orderBy(desc(events.startDate))
      .limit(20);
  }

  async getRecommendedEvents(userId: string): Promise<Event[]> {
    const recommendations = await db
      .select()
      .from(aiRecommendations)
      .where(and(
        eq(aiRecommendations.userId, userId),
        eq(aiRecommendations.type, 'event')
      ))
      .orderBy(desc(aiRecommendations.score))
      .limit(10);
    
    if (recommendations.length === 0) {
      return [];
    }
    
    const eventIds = recommendations.map(r => r.entityId).filter(Boolean) as string[];
    
    return await db
      .select()
      .from(events)
      .where(inArray(events.id, eventIds))
      .orderBy(desc(events.startDate));
  }

  async findTeammates(userId: string, skills: string[]): Promise<User[]> {
    if (skills.length === 0) {
      return [];
    }
    
    return await db
      .select()
      .from(users)
      .where(sql`${users.skills} && ${skills}`)
      .limit(20);
  }
}

// Export the appropriate storage instance based on configuration
// PROTOTYPE MODE: Always use in-memory storage, no database dependencies
function createStorageInstance(): IStorage {
  console.log("💾 PROTOTYPE MODE - Always using in-memory storage (no database dependencies)");
  return new InMemoryStorage();
}

export const storage = createStorageInstance();
