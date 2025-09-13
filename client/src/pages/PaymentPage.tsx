import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
// PROTOTYPE MODE: All Stripe integration replaced with hardcoded responses
// No external API dependencies - everything runs standalone

// Mock Elements component for prototype mode
const Elements = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => children;
import { Navigation } from '@/components/ui/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import PaymentForm from '@/components/PaymentForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Event } from '@/types';
import { Calendar, MapPin, Users, Shield, CreditCard } from 'lucide-react';

// Always in prototype mode - no Stripe integration
const isPrototypeMode = true;
const stripePromise = null;

export default function PaymentPage() {
  const { eventId } = useParams();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue with your payment.",
        variant: "destructive",
      });
      // Redirect to home page where user can sign in with Firebase
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: ['/api/events', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) throw new Error('Failed to fetch event');
      return response.json();
    },
    enabled: !!eventId && isAuthenticated,
  });

  useEffect(() => {
    if (event && user && !clientSecret) {
      // Create PaymentIntent when component mounts
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          eventId: event.id, 
          amount: parseFloat(event.registrationFee.toString()) 
        }),
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
            
            // Show prototype mode warning if present
            if (data.prototypeModeWarning) {
              toast({
                title: "Prototype Mode",
                description: data.prototypeModeWarning,
                variant: "default",
              });
            }
          } else {
            toast({
              title: "Payment Setup Failed",
              description: "Unable to initialize payment. Please try again.",
              variant: "destructive",
            });
          }
        })
        .catch((error) => {
          console.error("Error setting up payment:", error);
          toast({
            title: "Payment Error",
            description: "Failed to setup payment. Please try again.",
            variant: "destructive",
          });
        });
    }
  }, [event, user, clientSecret, toast]);

  if (authLoading || eventLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 flex items-center justify-center">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-6">
            <div className="text-center py-16">
              <div className="text-6xl mb-6">❌</div>
              <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
              <p className="text-muted-foreground mb-8">
                The event you're looking for doesn't exist or has been removed.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const registrationFee = parseFloat(event.registrationFee.toString());

  if (registrationFee === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-6">
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🎉</div>
              <h1 className="text-3xl font-bold mb-4">Free Event</h1>
              <p className="text-muted-foreground mb-8">
                This is a free event. No payment is required for registration.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Complete Your <span className="gradient-text">Registration</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              {isPrototypeMode 
                ? "Demo payment processing (prototype mode)"
                : "Secure payment processing powered by Stripe"
              }
            </p>
            {isPrototypeMode && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-yellow-800 text-sm">
                  🚧 <strong>Prototype Mode:</strong> This is a demo payment system. No real charges will be made.
                </p>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Event Summary */}
            <div className="space-y-6">
              {/* Event Details */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Event Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="capitalize">
                        {event.type}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {event.status}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-muted-foreground">{event.description}</p>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {new Date(event.startDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                    )}

                    {event.maxParticipants && (
                      <div className="flex items-center gap-3 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>Limited to {event.maxParticipants} participants</span>
                      </div>
                    )}
                  </div>

                  {event.tags && event.tags.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Topics Covered</h4>
                        <div className="flex flex-wrap gap-2">
                          {event.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {event.requirements && event.requirements.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Requirements</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {event.requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Pricing Breakdown */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-chart-4" />
                    Pricing Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Event Registration</span>
                    <span className="font-semibold">${registrationFee.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Processing Fee</span>
                    <span>Included</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${registrationFee.toFixed(2)}</span>
                  </div>

                  <div className="bg-chart-4/10 border border-chart-4/20 rounded-lg p-3 mt-4">
                    <div className="flex items-center gap-2 text-chart-4 text-sm font-medium mb-1">
                      <Shield className="w-4 h-4" />
                      What's Included
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✅ Full event access</li>
                      <li>✅ All materials and resources</li>
                      <li>✅ Certificate of completion</li>
                      <li>✅ Networking opportunities</li>
                      {event.prizePool && parseFloat(event.prizePool.toString()) > 0 && (
                        <li>✅ Eligibility for ${event.prizePool} prize pool</li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Card className="glass-card border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-6 h-6 text-primary" />
                    <h4 className="font-semibold text-primary">Secure Payment</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your payment information is encrypted and processed securely by Stripe. 
                    We never store your credit card details on our servers.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            <div>
              <Card className="glass-card payment-form">
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                  <CardDescription>
                    Complete your registration with secure payment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {clientSecret ? (
                    isPrototypeMode ? (
                      // Prototype mode - render PaymentForm directly without Stripe Elements
                      <PaymentForm 
                        eventId={event.id}
                        eventTitle={event.title}
                        initialAmount={registrationFee}
                        onSuccess={() => {
                          toast({
                            title: "Registration Completed! (Prototype)",
                            description: "Your demo registration has been completed successfully.",
                          });
                          // Stay on the success page - user can navigate manually
                        }}
                      />
                    ) : (
                      // Real mode - use Stripe Elements
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <PaymentForm 
                          eventId={event.id}
                          eventTitle={event.title}
                          initialAmount={registrationFee}
                          onSuccess={() => {
                            toast({
                              title: "Payment Successful!",
                              description: "Your registration has been completed.",
                            });
                            // Stay on the success page - user can navigate manually
                          }}
                        />
                      </Elements>
                    )
                  ) : (
                    <div className="flex items-center justify-center py-16">
                      <div className="text-center">
                        <div className="spinner w-8 h-8 mx-auto mb-4"></div>
                        <p className="text-muted-foreground">
                          {isPrototypeMode 
                            ? "Setting up demo payment..."
                            : "Setting up secure payment..."
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
