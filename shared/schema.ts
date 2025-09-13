import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  skills: text("skills").array(),
  interests: text("interests").array(),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event types enum
export const eventTypeEnum = pgEnum('event_type', ['hackathon', 'workshop', 'quiz', 'conference', 'networking']);
export const eventStatusEnum = pgEnum('event_status', ['draft', 'published', 'live', 'completed', 'cancelled']);

// RSVP and registration status enums
export const rsvpStatusEnum = pgEnum('rsvp_status', ['pending', 'accepted', 'declined', 'confirmed', 'no_show']);
export const registrationStatusEnum = pgEnum('registration_status', ['pending', 'accepted', 'rejected', 'withdrawn', 'waitlist']);

// Project submission status enum  
export const submissionStatusEnum = pgEnum('submission_status', ['not_submitted', 'draft', 'submitted', 'under_review', 'approved', 'needs_revision']);

// Events table
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: eventTypeEnum("type").notNull(),
  status: eventStatusEnum("status").default('draft'),
  organizerId: varchar("organizer_id").references(() => users.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: text("location"),
  isVirtual: boolean("is_virtual").default(false),
  maxParticipants: integer("max_participants"),
  registrationFee: decimal("registration_fee", { precision: 10, scale: 2 }).default('0'),
  prizePool: decimal("prize_pool", { precision: 10, scale: 2 }).default('0'),
  requirements: text("requirements").array(),
  tags: text("tags").array(),
  imageUrl: varchar("image_url"),
  // Advanced feature fields
  rsvpDeadline: timestamp("rsvp_deadline"),
  projectSubmissionDeadline: timestamp("project_submission_deadline"),
  allowWithdrawal: boolean("allow_withdrawal").default(true),
  requireProjectSubmission: boolean("require_project_submission").default(false),
  projectSubmissionInstructions: text("project_submission_instructions"),
  maxFileSize: integer("max_file_size").default(10), // in MB
  allowedFileTypes: text("allowed_file_types").array().default(['pdf', 'doc', 'docx', 'zip', 'png', 'jpg']),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event registrations
export const eventRegistrations = pgTable("event_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").references(() => events.id),
  userId: varchar("user_id").references(() => users.id),
  teamId: varchar("team_id").references(() => teams.id),
  registeredAt: timestamp("registered_at").defaultNow(),
  paymentStatus: varchar("payment_status").default('pending'), // pending, completed, failed
  paymentIntentId: varchar("payment_intent_id"),
  // Enhanced registration management fields
  status: registrationStatusEnum("status").default('pending'),
  rsvpStatus: rsvpStatusEnum("rsvp_status").default('pending'),
  rsvpedAt: timestamp("rsvped_at"),
  checkedInAt: timestamp("checked_in_at"),
  withdrawnAt: timestamp("withdrawn_at"),
  withdrawalReason: text("withdrawal_reason"),
  organizerNotes: text("organizer_notes"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// RSVP management table
export const eventRsvps = pgTable("event_rsvps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").references(() => events.id),
  userId: varchar("user_id").references(() => users.id),
  registrationId: varchar("registration_id").references(() => eventRegistrations.id),
  status: rsvpStatusEnum("status").default('pending'),
  respondedAt: timestamp("responded_at"),
  remindersSent: integer("reminders_sent").default(0),
  lastReminderAt: timestamp("last_reminder_at"),
  dietary_restrictions: text("dietary_restrictions"),
  accessibility_needs: text("accessibility_needs"),
  emergency_contact: text("emergency_contact"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project submissions table
export const projectSubmissions = pgTable("project_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").references(() => events.id),
  teamId: varchar("team_id").references(() => teams.id),
  userId: varchar("user_id").references(() => users.id), // Individual submissions
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: submissionStatusEnum("status").default('draft'),
  submittedAt: timestamp("submitted_at"),
  reviewedAt: timestamp("reviewed_at"),
  reviewerId: varchar("reviewer_id").references(() => users.id),
  reviewNotes: text("review_notes"),
  score: decimal("score", { precision: 5, scale: 2 }), // Out of 100
  repositoryUrl: varchar("repository_url"),
  liveUrl: varchar("live_url"),
  videoUrl: varchar("video_url"),
  technologies: text("technologies").array(),
  tags: text("tags").array(),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project submission files table
export const submissionFiles = pgTable("submission_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  submissionId: varchar("submission_id").references(() => projectSubmissions.id),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name").notNull(),
  mimeType: varchar("mime_type").notNull(),
  size: integer("size").notNull(), // in bytes
  fileUrl: varchar("file_url").notNull(),
  fileType: varchar("file_type").notNull(), // document, image, video, archive, etc.
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Teams table
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  eventId: varchar("event_id").references(() => events.id),
  leaderId: varchar("leader_id").references(() => users.id),
  maxMembers: integer("max_members").default(4),
  skills: text("skills").array(),
  isOpen: boolean("is_open").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team members
export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").references(() => teams.id),
  userId: varchar("user_id").references(() => users.id),
  role: varchar("role").default('member'), // leader, member
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").references(() => events.id),
  teamId: varchar("team_id").references(() => teams.id),
  userId: varchar("user_id").references(() => users.id),
  message: text("message").notNull(),
  messageType: varchar("message_type").default('text'), // text, file, image
  fileUrl: varchar("file_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI recommendations
export const aiRecommendations = pgTable("ai_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type").notNull(), // event, team, skill
  entityId: varchar("entity_id"), // ID of recommended event/team/etc
  score: decimal("score", { precision: 3, scale: 2 }), // 0.00 to 1.00
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(), // event_reminder, team_invite, payment_success, etc
  read: boolean("read").default(false),
  data: jsonb("data"), // Additional data for the notification
  createdAt: timestamp("created_at").defaultNow(),
});

// Analytics data
export const eventAnalytics = pgTable("event_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").references(() => events.id),
  metric: varchar("metric").notNull(), // views, registrations, engagement, etc
  value: decimal("value", { precision: 12, scale: 2 }).notNull(),
  date: timestamp("date").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  organizedEvents: many(events),
  registrations: many(eventRegistrations),
  rsvps: many(eventRsvps),
  teams: many(teams),
  teamMemberships: many(teamMembers),
  chatMessages: many(chatMessages),
  recommendations: many(aiRecommendations),
  notifications: many(notifications),
  projectSubmissions: many(projectSubmissions),
  reviewedSubmissions: many(projectSubmissions, {
    relationName: "reviewedBy"
  }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  registrations: many(eventRegistrations),
  rsvps: many(eventRsvps),
  teams: many(teams),
  chatMessages: many(chatMessages),
  analytics: many(eventAnalytics),
  projectSubmissions: many(projectSubmissions),
}));

export const eventRsvpsRelations = relations(eventRsvps, ({ one }) => ({
  event: one(events, {
    fields: [eventRsvps.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventRsvps.userId],
    references: [users.id],
  }),
  registration: one(eventRegistrations, {
    fields: [eventRsvps.registrationId],
    references: [eventRegistrations.id],
  }),
}));

export const projectSubmissionsRelations = relations(projectSubmissions, ({ one, many }) => ({
  event: one(events, {
    fields: [projectSubmissions.eventId],
    references: [events.id],
  }),
  team: one(teams, {
    fields: [projectSubmissions.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [projectSubmissions.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [projectSubmissions.reviewerId],
    references: [users.id],
    relationName: "reviewedBy"
  }),
  files: many(submissionFiles),
}));

export const submissionFilesRelations = relations(submissionFiles, ({ one }) => ({
  submission: one(projectSubmissions, {
    fields: [submissionFiles.submissionId],
    references: [projectSubmissions.id],
  }),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  event: one(events, {
    fields: [teams.eventId],
    references: [events.id],
  }),
  leader: one(users, {
    fields: [teams.leaderId],
    references: [users.id],
  }),
  members: many(teamMembers),
  chatMessages: many(chatMessages),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(events, {
    fields: [eventRegistrations.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventRegistrations.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [eventRegistrations.teamId],
    references: [teams.id],
  }),
}));

// Insert schemas
export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Transform string dates to Date objects for database compatibility
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertEventRsvpSchema = createInsertSchema(eventRsvps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSubmissionSchema = createInsertSchema(projectSubmissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubmissionFileSchema = createInsertSchema(submissionFiles).omit({
  id: true,
  uploadedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type AIRecommendation = typeof aiRecommendations.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type EventAnalytic = typeof eventAnalytics.$inferSelect;

// New types for advanced features
export type EventRsvp = typeof eventRsvps.$inferSelect;
export type InsertEventRsvp = z.infer<typeof insertEventRsvpSchema>;
export type ProjectSubmission = typeof projectSubmissions.$inferSelect;
export type InsertProjectSubmission = z.infer<typeof insertProjectSubmissionSchema>;
export type SubmissionFile = typeof submissionFiles.$inferSelect;
export type InsertSubmissionFile = z.infer<typeof insertSubmissionFileSchema>;
