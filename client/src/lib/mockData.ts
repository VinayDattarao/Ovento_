// Mock data for static deployment when backend is not available
// This determines if we should use mock data when backend is not available
const checkStaticMode = () => {
  if (typeof window === 'undefined') return false;
  
  // Check if backend is available by making a quick test request
  try {
    // This will be overridden for actual static deployments
    return false;
  } catch {
    return true;
  }
};

export const isStaticMode = checkStaticMode();

// Mock events data
export const mockEvents = [
  {
    id: "1",
    title: "TechNova Hackathon 2025",
    description: "Join the most exciting hackathon of the year! Build innovative solutions and win amazing prizes.",
    category: "hackathon",
    startDate: "2025-10-15T09:00:00Z",
    endDate: "2025-10-17T18:00:00Z",
    location: "Virtual",
    maxParticipants: 500,
    currentParticipants: 247,
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400",
    tags: ["AI", "Web Development", "Mobile"],
    organizer: {
      name: "TechCorp",
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100"
    },
    prizes: {
      first: "₹50,000",
      second: "₹30,000", 
      third: "₹20,000"
    },
    registrationOpen: true
  },
  {
    id: "2", 
    title: "AI Conference 2025",
    description: "Learn about the latest advances in artificial intelligence from industry experts.",
    category: "conference",
    startDate: "2025-11-20T10:00:00Z",
    endDate: "2025-11-20T17:00:00Z",
    location: "Bangalore, India",
    maxParticipants: 200,
    currentParticipants: 156,
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400",
    tags: ["AI", "Machine Learning", "Data Science"],
    organizer: {
      name: "AI India",
      logo: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=100"
    },
    registrationOpen: true
  },
  {
    id: "3",
    title: "Startup Pitch Competition",
    description: "Present your startup idea to top investors and win funding opportunities.",
    category: "competition",
    startDate: "2025-12-05T14:00:00Z", 
    endDate: "2025-12-05T18:00:00Z",
    location: "Mumbai, India",
    maxParticipants: 50,
    currentParticipants: 32,
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400",
    tags: ["Entrepreneurship", "Funding", "Pitch"],
    organizer: {
      name: "StartupHub",
      logo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100"
    },
    prizes: {
      first: "₹2,00,000 Funding",
      second: "₹1,00,000 Funding",
      third: "Mentorship Program"
    },
    registrationOpen: true
  }
];

// Mock notifications
export const mockNotifications = [
  {
    id: "1",
    title: "Welcome to EventHorizon!",
    message: "Thanks for joining our platform. Explore amazing events and connect with like-minded people.",
    type: "info",
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "2", 
    title: "Event Reminder",
    message: "TechNova Hackathon starts in 3 days. Make sure you're prepared!",
    type: "reminder",
    read: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

// Mock chat messages
export const mockChatMessages = [
  {
    id: "1",
    userId: "demo-user",
    message: "Welcome to the chat! This is a demo message in static mode.",
    messageType: "text" as const,
    createdAt: new Date().toISOString(),
    user: {
      id: "demo-user",
      firstName: "Demo",
      lastName: "User",
      profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50"
    }
  },
  {
    id: "2",
    userId: "system",
    message: "Chat functionality works perfectly! In production, this would be connected to a real backend.",
    messageType: "text" as const,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    user: {
      id: "system", 
      firstName: "System",
      lastName: "",
      profileImageUrl: undefined
    }
  }
];

// Mock API response handlers
export const mockApiHandlers = {
  // Mock API request function for static mode
  mockApiRequest: async (method: string, url: string, data?: any): Promise<Response> => {
    console.log(`🔄 Mock API: ${method} ${url}`, data);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    let responseData: any = { success: true };
    
    if (url.includes('/api/events')) {
      if (method === 'GET') {
        // Handle specific event by ID (e.g., /api/events/1)
        const eventIdMatch = url.match(/\/api\/events\/([^\/]+)$/);
        if (eventIdMatch) {
          const eventId = eventIdMatch[1];
          const event = mockEvents.find(e => e.id === eventId);
          if (event) {
            responseData = event;
          } else {
            // Return 404 for non-existent events
            return new Response(JSON.stringify({ message: 'Event not found' }), {
              status: 404,
              statusText: 'Not Found',
              headers: { 'Content-Type': 'application/json' }
            });
          }
        } else {
          // Return all events for general /api/events request
          responseData = mockEvents;
        }
      }
      if (method === 'POST') responseData = { success: true, id: Date.now() };
    }
    
    if (url.includes('/api/notifications')) {
      responseData = mockNotifications;
    }
    
    if (url.includes('/chat')) {
      if (method === 'GET') responseData = mockChatMessages;
      if (method === 'POST') {
        responseData = {
          id: Date.now().toString(),
          userId: "mock-user-1",
          message: data.message,
          messageType: data.messageType || "text",
          createdAt: new Date().toISOString(),
          user: {
            id: "mock-user-1",
            firstName: "Demo",
            lastName: "User"
          }
        };
      }
    }
    
    if (url.includes('/api/upload')) {
      responseData = { 
        filename: "demo-file.jpg", 
        url: "https://images.unsplash.com/photo-1618477371303-b2a56f422d9e?w=200",
        mimetype: "image/jpeg"
      };
    }
    
    // Create a proper Response object
    const response = new Response(JSON.stringify(responseData), {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  },

  // Mock WebSocket for static mode
  createMockWebSocket: (url: string) => {
    console.log(`🔄 Mock WebSocket: Connecting to ${url}`);
    
    const mockWs = {
      send: (data: string) => {
        console.log('🔄 Mock WebSocket: Sending', data);
      },
      close: () => {
        console.log('🔄 Mock WebSocket: Closed');
      },
      onmessage: null as ((event: any) => void) | null,
      onopen: null as ((event: any) => void) | null,
      onclose: null as ((event: any) => void) | null,
      onerror: null as ((event: any) => void) | null,
      readyState: 1 // OPEN
    };
    
    // Simulate connection opened
    setTimeout(() => {
      if (mockWs.onopen) mockWs.onopen({ type: 'open' });
    }, 100);
    
    return mockWs;
  }
};