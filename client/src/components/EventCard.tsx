import { Event } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Trophy, Clock, Bookmark, Share2 } from 'lucide-react';
import { Link } from 'wouter';

interface EventCardProps {
  event: Event;
  onRegister?: () => void;
  isRegistering?: boolean;
}

export function EventCard({ event, onRegister, isRegistering }: EventCardProps) {
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'hackathon': return 'bg-chart-4';
      case 'workshop': return 'bg-chart-5';
      case 'conference': return 'bg-chart-3';
      case 'quiz': return 'bg-destructive';
      default: return 'bg-primary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'status-live';
      case 'upcoming': return 'status-upcoming';
      case 'completed': return 'status-past';
      default: return 'bg-secondary';
    }
  };

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'hackathon': return '💻';
      case 'workshop': return '🛠️';
      case 'conference': return '🎤';
      case 'quiz': return '🏆';
      default: return '📅';
    }
  };

  return (
    <Card 
      className={`glass-card rounded-2xl overflow-hidden feature-card border-l-4 event-${event.type}`}
      data-testid={`event-card-${event.id}`}
    >
      {/* Event Image/Header */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
        <div className="text-6xl mb-4">{getEventIcon(event.type)}</div>
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <Badge className={`${getStatusColor(event.status)} text-white font-medium`}>
            {event.status === 'live' && (
              <div className="w-2 h-2 bg-white rounded-full mr-2 live-indicator"></div>
            )}
            {event.status.toUpperCase()}
          </Badge>
        </div>

        {/* Event Type Badge */}
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="capitalize">
            {event.type}
          </Badge>
        </div>

        {/* Live Indicator for Live Events */}
        {event.status === 'live' && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-red-500/90 text-white px-3 py-1 rounded-full text-sm">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            LIVE NOW
          </div>
        )}
      </div>
      
      <CardContent className="p-6 space-y-4">
        {/* Title and Description */}
        <div>
          <h3 className="text-xl font-semibold mb-2 line-clamp-2">{event.title}</h3>
          {event.description && (
            <p className="text-muted-foreground text-sm line-clamp-3">{event.description}</p>
          )}
        </div>
        
        {/* Event Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatEventDate(event.startDate)}</span>
            {event.startDate !== event.endDate && (
              <span>- {formatEventDate(event.endDate)}</span>
            )}
          </div>
          
          {event.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{event.location}</span>
              {event.isVirtual && (
                <Badge variant="outline" className="text-xs">Virtual</Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-muted-foreground">
              {event.maxParticipants && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{event.maxParticipants} max</span>
                </div>
              )}
              
              {event.prizePool && parseFloat(event.prizePool) > 0 && (
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-chart-5" />
                  <span className="text-chart-5 font-medium">₹{event.prizePool}</span>
                </div>
              )}
            </div>
            
            {event.registrationFee && parseFloat(event.registrationFee) > 0 ? (
              <div className="text-right">
                <div className="text-lg font-bold text-primary">₹{event.registrationFee}</div>
                <div className="text-xs text-muted-foreground">Registration</div>
              </div>
            ) : (
              <Badge variant="outline" className="text-chart-4 border-chart-4">
                FREE
              </Badge>
            )}
          </div>
        </div>
        
        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{event.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <div className="flex items-center gap-2">
            {event.status === 'live' ? (
              <Button 
                asChild
                className="flex-1 h-9 bg-gradient-to-r from-red-500 to-red-600 text-white hover:opacity-90"
                data-testid={`button-join-live-${event.id}`}
              >
                <Link href="/virtual-space">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 live-indicator"></div>
                  Join Live
                </Link>
              </Button>
            ) : event.status === 'published' || event.status === 'registration_open' ? (
              <>
                {event.registrationFee && parseFloat(event.registrationFee) > 0 ? (
                  <Button 
                    asChild
                    className="flex-1 h-9 bg-primary text-primary-foreground hover:bg-primary/90"
                    data-testid={`button-register-${event.id}`}
                  >
                    <Link href={`/payment/${event.id}`}>
                      Register - ₹{event.registrationFee}
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    onClick={onRegister}
                    disabled={isRegistering}
                    className="flex-1 h-9 bg-primary text-primary-foreground hover:bg-primary/90"
                    data-testid={`button-register-${event.id}`}
                  >
                    {isRegistering ? (
                      <>
                        <div className="spinner w-4 h-4 mr-2"></div>
                        Registering...
                      </>
                    ) : (
                      'Register Free'
                    )}
                  </Button>
                )}
              </>
            ) : (
              <Button 
                variant="outline" 
                className="flex-1 h-9"
                disabled
                data-testid={`button-completed-${event.id}`}
              >
                Event Completed
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="icon"
              className="h-9 w-9 flex-shrink-0"
              data-testid={`button-bookmark-${event.id}`}
            >
              <Bookmark className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              className="h-9 w-9 flex-shrink-0"
              data-testid={`button-share-${event.id}`}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Learn More Button */}
          <Button 
            asChild
            variant="outline" 
            className="w-full h-8 text-sm"
            data-testid={`button-learn-more-${event.id}`}
          >
            <Link href={`/event/${event.id}`}>
              Learn More
            </Link>
          </Button>
        </div>

        {/* Additional Info for Special Events */}
        {event.allowTeams && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />
            Team event (max {event.maxTeamSize} per team)
          </div>
        )}

        {/* Requirements Preview */}
        {event.requirements && event.requirements.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Requirements: </span>
            <span>{event.requirements.slice(0, 2).join(', ')}</span>
            {event.requirements.length > 2 && '...'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
