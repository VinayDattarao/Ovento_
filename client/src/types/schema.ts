// Local schema definitions for the client
export interface Event {
  id: string;
  title: string;
  description?: string;
  type: 'hackathon' | 'workshop' | 'quiz' | 'conference' | 'networking';
  status: 'draft' | 'published' | 'live' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  location?: string;
  isVirtual: boolean;
  maxParticipants?: number;
  registrationFee: string;
  prizePool?: string;
  tags?: string[];
  imageUrl?: string;
  organizerId: string;
}