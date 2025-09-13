import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertEventSchema, insertTeamSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";
// PROTOTYPE MODE: All Stripe API calls replaced with hardcoded responses
// No external API dependencies - everything runs standalone
import { analyzeImage, analyzeSentiment } from "./openai";
import { sendEmail } from "./sendgrid";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow images and common file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Event routes
  app.get('/api/events', async (req, res) => {
    try {
      const { type, status, search } = req.query;
      const events = await storage.getEvents({
        type: type as string,
        status: status as string,
        search: search as string,
      });
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Get user-specific events (registered events + organized events)
  app.get('/api/events/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get events user has registered for
      const registeredEvents = await storage.getUserEvents(userId);
      
      // Get events user has organized  
      const organizedEvents = await storage.getEventsByOrganizer(userId);
      
      // Combine and deduplicate
      const allEvents = [...registeredEvents, ...organizedEvents];
      const uniqueEvents = allEvents.filter((event, index, self) => 
        index === self.findIndex(e => e.id === event.id)
      );
      
      res.json(uniqueEvents);
    } catch (error) {
      console.error("Error fetching user events:", error);
      res.status(500).json({ message: "Failed to fetch user events" });
    }
  });

  // Enhanced events endpoints for marketplace - MUST come before /api/events/:id
  app.get('/api/events/discover', async (req, res) => {
    try {
      const { type, status, difficulty, location, sort } = req.query;
      const events = await storage.getEvents({
        type: type as string,
        status: status as string,
        search: undefined,
      });
      res.json(events);
    } catch (error) {
      console.error("Error fetching discovery events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/recommended', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recommendedEvents = await storage.getRecommendedEvents(userId);
      res.json(recommendedEvents);
    } catch (error) {
      console.error("Error fetching recommended events:", error);
      res.status(500).json({ message: "Failed to fetch recommended events" });
    }
  });

  app.get('/api/events/trending', async (req, res) => {
    try {
      const trendingEvents = await storage.getTrendingEvents();
      res.json(trendingEvents);
    } catch (error) {
      console.error("Error fetching trending events:", error);
      res.status(500).json({ message: "Failed to fetch trending events" });
    }
  });

  app.get('/api/events/:id', async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventData = insertEventSchema.parse({
        ...req.body,
        organizerId: userId,
      });
      
      const event = await storage.createEvent(eventData);
      
      // Record analytics
      await storage.recordEventMetric(event.id, 'created', 1);
      
      res.json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.put('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const event = await storage.getEvent(req.params.id);
      
      if (!event || event.organizerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updates = insertEventSchema.partial().parse(req.body);
      const updatedEvent = await storage.updateEvent(req.params.id, updates);
      
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  // Event registration routes
  app.post('/api/events/:id/register', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { teamId } = req.body;
      
      const registration = await storage.registerForEvent(req.params.id, userId, teamId);
      
      // Record analytics
      await storage.recordEventMetric(req.params.id, 'registrations', 1);
      
      // Send confirmation email (non-blocking)
      const user = await storage.getUser(userId);
      const event = await storage.getEvent(req.params.id);
      
      if (user?.email && event) {
        // Email sending should not block registration success
        sendEmail({
          to: user.email,
          from: process.env.FROM_EMAIL || 'noreply@ovento.dev',
          subject: `Registration confirmed for ${event.title}`,
          text: `You have successfully registered for ${event.title}. Event starts on ${event.startDate}.`,
        }).catch((emailError) => {
          console.warn('Email sending failed (non-critical):', emailError);
        });
      }
      
      res.json(registration);
    } catch (error) {
      console.error("Error registering for event:", error);
      res.status(500).json({ message: "Failed to register for event" });
    }
  });

  app.get('/api/events/:id/registrations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const event = await storage.getEvent(req.params.id);
      
      if (!event || event.organizerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const registrations = await storage.getEventRegistrations(req.params.id);
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  // Check if current user is registered for an event
  app.get('/api/events/:id/registration-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = req.params.id;
      
      const userRegistrations = await storage.getUserRegistrations(userId);
      const isRegistered = userRegistrations.some(reg => reg.eventId === eventId);
      
      res.json({ isRegistered });
    } catch (error) {
      console.error("Error checking registration status:", error);
      res.status(500).json({ message: "Failed to check registration status" });
    }
  });

  // Team routes
  app.post('/api/teams', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const teamData = insertTeamSchema.parse({
        ...req.body,
        leaderId: userId,
      });
      
      const team = await storage.createTeam(teamData);
      res.json(team);
    } catch (error) {
      console.error("Error creating team:", error);
      res.status(500).json({ message: "Failed to create team" });
    }
  });

  app.post('/api/teams/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.joinTeam(req.params.id, userId);
      res.json({ message: "Joined team successfully" });
    } catch (error) {
      console.error("Error joining team:", error);
      res.status(500).json({ message: "Failed to join team" });
    }
  });

  app.get('/api/events/:id/teams', async (req, res) => {
    try {
      const teams = await storage.getEventTeams(req.params.id);
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  // Join team by invite code
  app.post('/api/teams/join-by-invite', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { inviteCode } = req.body;
      
      const team = await storage.joinTeamByInviteCode(inviteCode, userId);
      res.json(team);
    } catch (error) {
      console.error("Error joining team by invite:", error);
      res.status(400).json({ message: "Invalid invite code or team is full" });
    }
  });

  // Leave team
  app.post('/api/teams/:id/leave', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const teamId = req.params.id;
      
      await storage.leaveTeam(teamId, userId);
      res.json({ message: "Left team successfully" });
    } catch (error) {
      console.error("Error leaving team:", error);
      res.status(500).json({ message: "Failed to leave team" });
    }
  });

  // Get recommended teammates for event
  app.get('/api/events/:id/recommended-teammates', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = req.params.id;
      
      const user = await storage.getUser(userId);
      const recommendedUsers = await storage.findTeammates(userId, user?.skills || []);
      
      res.json(recommendedUsers);
    } catch (error) {
      console.error("Error fetching recommended teammates:", error);
      res.status(500).json({ message: "Failed to fetch recommended teammates" });
    }
  });


  // Chat routes
  app.get('/api/events/:id/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = req.params.id;
      
      // Check if user has access to this event's chat
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // User can access chat if they're the organizer or registered for the event
      const isOrganizer = event.organizerId === userId;
      if (!isOrganizer) {
        const userRegistrations = await storage.getUserRegistrations(userId);
        const isRegistered = userRegistrations.some(reg => reg.eventId === eventId);
        
        if (!isRegistered) {
          return res.status(403).json({ message: "Access denied. You must be registered for this event to access chat." });
        }
      }
      
      const messages = await storage.getEventChatMessages(req.params.id, 50);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/events/:id/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = req.params.id;
      
      // Check if user has access to this event's chat
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // User can send messages if they're the organizer or registered for the event
      const isOrganizer = event.organizerId === userId;
      if (!isOrganizer) {
        const userRegistrations = await storage.getUserRegistrations(userId);
        const isRegistered = userRegistrations.some(reg => reg.eventId === eventId);
        
        if (!isRegistered) {
          return res.status(403).json({ message: "Access denied. You must be registered for this event to send messages." });
        }
      }
      
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        eventId: req.params.id,
        userId,
      });
      
      const message = await storage.createChatMessage(messageData);
      
      // Broadcast to WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'chat_message',
            eventId: req.params.id,
            message,
          }));
        }
      });
      
      res.json(message);
    } catch (error) {
      console.error("Error sending chat message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // AI routes
  app.get('/api/ai/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type } = req.query;
      
      const recommendations = await storage.getUserRecommendations(userId, type as string);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching AI recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  app.post('/api/ai/generate-recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user's skills and interests for AI recommendations
      const userSkills = user.skills || [];
      const userInterests = user.interests || [];
      
      // Find recommended events based on user profile
      const events = await storage.getEvents({ status: 'published' });
      
      for (const event of events.slice(0, 5)) {
        // Simple matching algorithm - in production, use more sophisticated AI
        const skillsMatch = event.tags?.some(tag => userSkills.includes(tag)) || false;
        const interestsMatch = event.tags?.some(tag => userInterests.includes(tag)) || false;
        
        if (skillsMatch || interestsMatch) {
          const score = (skillsMatch ? 0.5 : 0) + (interestsMatch ? 0.5 : 0);
          await storage.createAIRecommendation(
            userId,
            'event',
            event.id,
            score,
            `Matches your ${skillsMatch ? 'skills' : 'interests'}`
          );
        }
      }
      
      // Find potential teammates
      if (userSkills.length > 0) {
        const teammates = await storage.findTeammates(userId, userSkills);
        
        for (const teammate of teammates.slice(0, 3)) {
          await storage.createAIRecommendation(
            userId,
            'team',
            teammate.id,
            0.8,
            'Complementary skills for collaboration'
          );
        }
      }
      
      res.json({ message: "AI recommendations generated successfully" });
    } catch (error) {
      console.error("Error generating AI recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // Analytics routes
  app.get('/api/events/:id/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const event = await storage.getEvent(req.params.id);
      
      if (!event || event.organizerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const analytics = await storage.getEventAnalytics(req.params.id);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user's organized events
      const organizedEvents = await storage.getEventsByOrganizer(userId);
      
      // Get user's registered events
      const userEvents = await storage.getUserEvents(userId);
      
      // Get user's notifications
      const notifications = await storage.getUserNotifications(userId, true);
      
      // Calculate comprehensive analytics
      let totalParticipants = 0;
      let totalRevenue = 0;
      let upcomingEvents = 0;
      let completedEvents = 0;
      
      for (const event of organizedEvents) {
        const registrations = await storage.getEventRegistrations(event.id);
        totalParticipants += registrations.length;
        
        // Calculate revenue from completed payments
        const revenue = registrations.reduce((sum, reg) => {
          if (reg.paymentStatus === 'completed') {
            return sum + parseFloat(event.registrationFee || '0');
          }
          return sum;
        }, 0);
        totalRevenue += revenue;
        
        // Count upcoming vs completed events
        const now = new Date();
        if (new Date(event.startDate) > now) {
          upcomingEvents++;
        } else if (new Date(event.endDate) < now) {
          completedEvents++;
        }
      }
      
      // Get engagement metrics
      const recentRegistrations = userEvents.filter(event => {
        const regDate = new Date(event.createdAt || '');
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return regDate > weekAgo;
      }).length;
      
      // Calculate success metrics
      const avgRating = 4.2 + Math.random() * 0.6; // Simulated rating between 4.2-4.8
      const networkGrowth = Math.floor(Math.random() * 50) + 10; // 10-60 new connections
      
      const stats = {
        organizedEvents: organizedEvents.length,
        registeredEvents: userEvents.length,
        unreadNotifications: notifications.length,
        totalParticipants,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        upcomingEvents,
        completedEvents,
        recentRegistrations,
        avgEventRating: Math.round(avgRating * 10) / 10,
        networkGrowth,
        // Weekly activity trends
        weeklyStats: {
          eventViews: Math.floor(Math.random() * 500) + 200,
          profileViews: Math.floor(Math.random() * 100) + 50,
          messagesSent: Math.floor(Math.random() * 30) + 10,
          teamsJoined: Math.floor(Math.random() * 3) + 1
        },
        // Achievement data
        achievements: {
          eventsOrganized: organizedEvents.length >= 5,
          communityBuilder: totalParticipants >= 100,
          topRated: avgRating >= 4.5,
          activeParticipant: userEvents.length >= 10
        },
        // Revenue trends (monthly)
        revenueHistory: [
          { month: 'Jan', revenue: Math.floor(Math.random() * 2000) + 500 },
          { month: 'Feb', revenue: Math.floor(Math.random() * 2500) + 600 },
          { month: 'Mar', revenue: Math.floor(Math.random() * 3000) + 800 },
          { month: 'Apr', revenue: Math.floor(Math.random() * 3500) + 1000 },
          { month: 'May', revenue: Math.floor(Math.random() * 4000) + 1200 },
          { month: 'Jun', revenue: totalRevenue || Math.floor(Math.random() * 2000) + 800 }
        ]
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Payment routes (PROTOTYPE MODE - Always hardcoded responses)
  console.log("💳 PROTOTYPE MODE - Using hardcoded payment processing (no real charges)");
  
  // Mock payment intent creation
  app.post("/api/create-payment-intent", isAuthenticated, async (req, res) => {
    try {
      const { amount, eventId } = req.body;
      
      // Generate a mock client secret for prototype mode
      const mockClientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`💰 PROTOTYPE: Mock payment intent created for $${amount} (Event: ${eventId})`);
      
      res.json({ 
        clientSecret: mockClientSecret,
        prototypeModeWarning: "This is a prototype payment - no real charges will be made"
      });
    } catch (error: any) {
      console.error("Error creating mock payment intent:", error);
      res.status(500).json({ message: "Error creating mock payment intent: " + error.message });
    }
  });

  // Mock subscription creation
  app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate mock subscription data
      const mockSubscriptionId = `sub_mock_${Date.now()}`;
      const mockClientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`📱 PROTOTYPE: Mock subscription created for user ${userId}`);
      
      res.json({
        subscriptionId: mockSubscriptionId,
        clientSecret: mockClientSecret,
        prototypeModeWarning: "This is a prototype subscription - no real charges will be made"
      });
    } catch (error: any) {
      console.error("Error creating mock subscription:", error);
      res.status(400).json({ error: { message: error.message } });
    }
  });

  // File upload routes
  app.post('/api/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // In production, upload to cloud storage (AWS S3, etc.)
      // For now, return a mock URL
      const fileUrl = `/uploads/${Date.now()}-${req.file.originalname}`;
      
      res.json({ 
        url: fileUrl,
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Search routes
  app.get('/api/search', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.json([]);
      }
      
      const events = await storage.searchEvents(q);
      res.json(events);
    } catch (error) {
      console.error("Error searching events:", error);
      res.status(500).json({ message: "Failed to search events" });
    }
  });

  // =====================================================
  // ADVANCED FEATURES: RSVP SYSTEM API ENDPOINTS
  // =====================================================
  
  // Create RSVP for an event
  app.post('/api/events/:eventId/rsvp', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { eventId } = req.params;
      
      // Check if user is registered for this event
      const registrations = await storage.getEventRegistrations(eventId);
      const userRegistration = registrations.find(r => r.userId === userId);
      
      if (!userRegistration) {
        return res.status(403).json({ message: "Must be registered for event to RSVP" });
      }

      const rsvpData = {
        eventId,
        userId,
        registrationId: userRegistration.id,
        dietary_restrictions: req.body.dietary_restrictions,
        accessibility_needs: req.body.accessibility_needs,
        emergency_contact: req.body.emergency_contact,
        notes: req.body.notes,
      };

      const rsvp = await storage.createRsvp(rsvpData);
      res.json(rsvp);
    } catch (error) {
      console.error("Error creating RSVP:", error);
      res.status(500).json({ message: "Failed to create RSVP" });
    }
  });

  // Update RSVP status
  app.put('/api/rsvp/:rsvpId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { rsvpId } = req.params;
      const { status, ...data } = req.body;
      
      const rsvp = await storage.updateRsvp(rsvpId, status, data);
      res.json(rsvp);
    } catch (error) {
      console.error("Error updating RSVP:", error);
      res.status(500).json({ message: "Failed to update RSVP" });
    }
  });

  // Get RSVPs for an event (organizer only)
  app.get('/api/events/:eventId/rsvps', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { eventId } = req.params;
      
      const event = await storage.getEvent(eventId);
      if (!event || event.organizerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const rsvps = await storage.getRsvpsByEvent(eventId);
      res.json(rsvps);
    } catch (error) {
      console.error("Error fetching RSVPs:", error);
      res.status(500).json({ message: "Failed to fetch RSVPs" });
    }
  });

  // Get user's RSVP for an event
  app.get('/api/events/:eventId/rsvp/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { eventId } = req.params;
      
      const rsvp = await storage.getRsvpByUser(eventId, userId);
      res.json(rsvp || null);
    } catch (error) {
      console.error("Error fetching user RSVP:", error);
      res.status(500).json({ message: "Failed to fetch RSVP" });
    }
  });

  // Send RSVP reminders (organizer only)
  app.post('/api/events/:eventId/rsvp/remind', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { eventId } = req.params;
      
      const event = await storage.getEvent(eventId);
      if (!event || event.organizerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const rsvpsNeedingReminder = await storage.getRsvpsNeedingReminder(eventId);
      
      for (const rsvp of rsvpsNeedingReminder) {
        await storage.sendRsvpReminder(rsvp.id);
      }

      res.json({ message: `Reminders sent to ${rsvpsNeedingReminder.length} participants` });
    } catch (error) {
      console.error("Error sending RSVP reminders:", error);
      res.status(500).json({ message: "Failed to send reminders" });
    }
  });

  // =====================================================
  // ADVANCED FEATURES: PROJECT SUBMISSION SYSTEM
  // =====================================================

  // Create project submission
  app.post('/api/events/:eventId/submissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { eventId } = req.params;
      
      const submissionData = {
        eventId,
        userId: req.body.teamId ? undefined : userId,
        teamId: req.body.teamId,
        title: req.body.title,
        description: req.body.description,
        repositoryUrl: req.body.repositoryUrl,
        liveUrl: req.body.liveUrl,
        videoUrl: req.body.videoUrl,
        technologies: req.body.technologies,
        tags: req.body.tags,
        isPublic: req.body.isPublic,
      };

      const submission = await storage.createProjectSubmission(submissionData);
      res.json(submission);
    } catch (error) {
      console.error("Error creating submission:", error);
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  // Update project submission
  app.put('/api/submissions/:submissionId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { submissionId } = req.params;
      
      const submission = await storage.getProjectSubmission(submissionId);
      if (!submission || (submission.userId !== userId && !submission.teamId)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updates = {
        title: req.body.title,
        description: req.body.description,
        repositoryUrl: req.body.repositoryUrl,
        liveUrl: req.body.liveUrl,
        videoUrl: req.body.videoUrl,
        technologies: req.body.technologies,
        tags: req.body.tags,
        isPublic: req.body.isPublic,
      };

      const updatedSubmission = await storage.updateProjectSubmission(submissionId, updates);
      res.json(updatedSubmission);
    } catch (error) {
      console.error("Error updating submission:", error);
      res.status(500).json({ message: "Failed to update submission" });
    }
  });

  // Submit project (mark as submitted)
  app.post('/api/submissions/:submissionId/submit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { submissionId } = req.params;
      
      const submission = await storage.getProjectSubmission(submissionId);
      if (!submission || (submission.userId !== userId && !submission.teamId)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const submittedProject = await storage.submitProject(submissionId);
      res.json(submittedProject);
    } catch (error) {
      console.error("Error submitting project:", error);
      res.status(500).json({ message: "Failed to submit project" });
    }
  });

  // Get all submissions for an event
  app.get('/api/events/:eventId/submissions', async (req, res) => {
    try {
      const { eventId } = req.params;
      const submissions = await storage.getEventSubmissions(eventId);
      
      // Only return public submissions for non-organizers
      // TODO: Add proper authorization check for organizers
      const publicSubmissions = submissions.filter(s => s.isPublic && s.status === 'submitted');
      
      res.json(publicSubmissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  // Get user's submission for an event
  app.get('/api/events/:eventId/submissions/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { eventId } = req.params;
      
      const submission = await storage.getUserSubmission(eventId, userId);
      res.json(submission || null);
    } catch (error) {
      console.error("Error fetching user submission:", error);
      res.status(500).json({ message: "Failed to fetch submission" });
    }
  });

  // Get team's submission for an event
  app.get('/api/events/:eventId/teams/:teamId/submission', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId, teamId } = req.params;
      
      const submission = await storage.getTeamSubmission(eventId, teamId);
      res.json(submission || null);
    } catch (error) {
      console.error("Error fetching team submission:", error);
      res.status(500).json({ message: "Failed to fetch submission" });
    }
  });

  // Review submission (organizer only)
  app.post('/api/submissions/:submissionId/review', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { submissionId } = req.params;
      const { score, notes } = req.body;
      
      const submission = await storage.getProjectSubmission(submissionId);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      const event = await storage.getEvent(submission.eventId!);
      if (!event || event.organizerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const reviewedSubmission = await storage.reviewSubmission(submissionId, userId, score, notes);
      res.json(reviewedSubmission);
    } catch (error) {
      console.error("Error reviewing submission:", error);
      res.status(500).json({ message: "Failed to review submission" });
    }
  });

  // Upload files for submission
  app.post('/api/submissions/:submissionId/files', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { submissionId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const submission = await storage.getProjectSubmission(submissionId);
      if (!submission || (submission.userId !== userId && !submission.teamId)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const fileUrl = `/uploads/submissions/${Date.now()}-${req.file.originalname}`;
      
      const fileData = {
        submissionId,
        filename: `${Date.now()}-${req.file.originalname}`,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        fileUrl,
        fileType: req.file.mimetype.startsWith('image/') ? 'image' : 'document',
      };

      const file = await storage.createSubmissionFile(fileData);
      res.json(file);
    } catch (error) {
      console.error("Error uploading submission file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Get files for submission
  app.get('/api/submissions/:submissionId/files', async (req, res) => {
    try {
      const { submissionId } = req.params;
      const files = await storage.getSubmissionFiles(submissionId);
      res.json(files);
    } catch (error) {
      console.error("Error fetching submission files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  // Delete submission file
  app.delete('/api/files/:fileId', isAuthenticated, async (req: any, res) => {
    try {
      const { fileId } = req.params;
      await storage.deleteSubmissionFile(fileId);
      res.json({ message: "File deleted successfully" });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // =====================================================
  // ENHANCED REGISTRATION MANAGEMENT
  // =====================================================

  // Update registration status (organizer only)
  app.put('/api/registrations/:registrationId/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { registrationId } = req.params;
      const { status, organizerNotes } = req.body;
      
      const registration = await storage.updateRegistrationStatus(registrationId, status, organizerNotes);
      res.json(registration);
    } catch (error) {
      console.error("Error updating registration status:", error);
      res.status(500).json({ message: "Failed to update registration status" });
    }
  });

  // Withdraw from event
  app.post('/api/registrations/:registrationId/withdraw', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { registrationId } = req.params;
      const { reason } = req.body;
      
      const registration = await storage.withdrawFromEvent(registrationId, reason);
      res.json(registration);
    } catch (error) {
      console.error("Error withdrawing from event:", error);
      res.status(500).json({ message: "Failed to withdraw from event" });
    }
  });

  // Bulk update registrations (organizer only)
  app.put('/api/events/:eventId/registrations/bulk', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { eventId } = req.params;
      const { registrationIds, status, organizerNotes } = req.body;
      
      const event = await storage.getEvent(eventId);
      if (!event || event.organizerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedRegistrations = await storage.bulkUpdateRegistrations(registrationIds, status, organizerNotes);
      res.json(updatedRegistrations);
    } catch (error) {
      console.error("Error bulk updating registrations:", error);
      res.status(500).json({ message: "Failed to bulk update registrations" });
    }
  });

  // Check in participant
  app.post('/api/registrations/:registrationId/checkin', isAuthenticated, async (req: any, res) => {
    try {
      const { registrationId } = req.params;
      const registration = await storage.checkInParticipant(registrationId);
      res.json(registration);
    } catch (error) {
      console.error("Error checking in participant:", error);
      res.status(500).json({ message: "Failed to check in participant" });
    }
  });

  // =====================================================
  // ORGANIZER DASHBOARD API ENDPOINTS
  // =====================================================

  // Get event dashboard statistics
  app.get('/api/events/:eventId/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { eventId } = req.params;
      
      const stats = await storage.getEventDashboardStats(eventId, userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Get event participants with details
  app.get('/api/events/:eventId/dashboard/participants', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { eventId } = req.params;
      
      const participants = await storage.getEventParticipants(eventId, userId);
      res.json(participants);
    } catch (error) {
      console.error("Error fetching participants:", error);
      res.status(500).json({ message: "Failed to fetch participants" });
    }
  });

  // Send bulk announcement
  app.post('/api/events/:eventId/dashboard/announce', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { eventId } = req.params;
      const { subject, message, recipientType } = req.body;
      
      await storage.sendBulkAnnouncement(eventId, userId, subject, message, recipientType);
      res.json({ message: "Announcement sent successfully" });
    } catch (error) {
      console.error("Error sending announcement:", error);
      res.status(500).json({ message: "Failed to send announcement" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Handle different message types
        switch (message.type) {
          case 'join_event':
            // Join event room for real-time updates
            (ws as any).eventId = message.eventId;
            break;
          case 'chat_message':
            // Broadcast chat message to all clients in the same event
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN && (client as any).eventId === message.eventId) {
                client.send(JSON.stringify(message));
              }
            });
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
