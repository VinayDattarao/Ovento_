import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/ui/navigation';
import { Home, ArrowLeft, Search, Sparkles, Rocket, MapPin, Calendar, Users, Zap } from 'lucide-react';

export default function EventDiscovery() {
  const featuredSections = [
    { name: 'Dashboard', href: '/', icon: '🏠', description: 'Your event command center' },
    { name: 'Live Events', href: '/events', icon: '🎯', description: 'Discover amazing experiences' },
    { name: 'Community Hub', href: '/community', icon: '💬', description: 'Connect with innovators' },
    { name: 'Virtual Space', href: '/virtual-space', icon: '🌐', description: 'Join immersive events' },
    { name: 'My Journey', href: '/event-history', icon: '📊', description: 'Track your registrations' },
    { name: 'Transactions', href: '/payment-history', icon: '💳', description: 'Payment records' }
  ];

  const eventCategories = [
    { name: 'Hackathons', icon: '💻', count: '12+ Active', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { name: 'Conferences', icon: '🎤', count: '8+ Events', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { name: 'Workshops', icon: '🛠️', count: '15+ Sessions', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
    { name: 'Competitions', icon: '🏆', count: '6+ Contests', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-12">
        <div className="bg-gradient-to-br from-background via-secondary/20 to-background min-h-screen flex items-center justify-center p-6">
          <div className="max-w-6xl w-full">
            <Card className="glass-card text-center mb-8">
              <CardHeader className="pb-6">
                <div className="relative">
                  <div className="text-8xl mb-6 animate-pulse">🌟</div>
                  <Sparkles className="absolute top-0 right-1/3 w-8 h-8 text-primary animate-bounce" />
                  <Sparkles className="absolute top-10 left-1/4 w-6 h-6 text-accent animate-bounce delay-300" />
                  <Zap className="absolute top-5 left-1/3 w-7 h-7 text-yellow-400 animate-bounce delay-500" />
                </div>
                <CardTitle className="text-5xl font-bold mb-4">
                  <span className="gradient-text">Ovento</span> Discovery
                </CardTitle>
                <CardDescription className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  🚀 Welcome to the next-generation event management platform! 
                  Discover exciting events, connect with innovators, and experience the future of digital engagement.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 border border-primary/20">
                    <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
                      <Rocket className="w-5 h-5" />
                      Platform Features
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-2 text-left">
                      <li>🎯 AI-powered event recommendations</li>
                      <li>💬 Real-time community chat</li>
                      <li>🌐 Immersive virtual event spaces</li>
                      <li>📊 Advanced analytics dashboard</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-chart-4/10 to-chart-5/10 rounded-lg p-6 border border-chart-4/20">
                    <h3 className="text-lg font-semibold mb-3 text-chart-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Community Benefits
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-2 text-left">
                      <li>🤝 Connect with like-minded innovators</li>
                      <li>🏆 Participate in exciting competitions</li>
                      <li>📚 Learn from industry experts</li>
                      <li>🎪 Experience cutting-edge tech</li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90">
                    <Link href="/">
                      <Home className="w-5 h-5 mr-2" />
                      Explore Dashboard
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg" 
                    className="border-primary text-primary hover:bg-primary/10"
                    onClick={() => {
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }, 100);
                    }}
                  >
                    <Link href="/events">
                      <Calendar className="w-5 h-5 mr-2" />
                      Browse Events
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Event Categories */}
            <Card className="glass-card mb-6">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold mb-2">
                  🎪 Event Categories
                </CardTitle>
                <CardDescription>
                  Explore different types of events on our platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {eventCategories.map((category) => (
                    <Link 
                      key={category.name} 
                      href="/events"
                      onClick={() => {
                        setTimeout(() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          // Set filter for the specific category type
                          const categoryType = category.name.toLowerCase().slice(0, -1); // Remove 's' for singular
                          sessionStorage.setItem('selectedEventType', categoryType);
                        }, 100);
                      }}
                    >
                      <div className={`group p-4 rounded-lg border transition-all duration-200 hover:shadow-lg cursor-pointer hover:scale-105 ${category.color}`}>
                        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform text-center">
                          {category.icon}
                        </div>
                        <h4 className="font-semibold text-sm mb-1 text-center group-hover:opacity-90 transition-opacity">
                          {category.name}
                        </h4>
                        <p className="text-xs text-center opacity-75">
                          {category.count}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Platform Navigation */}
            <Card className="glass-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold mb-2">
                  🧭 Platform Navigation
                </CardTitle>
                <CardDescription>
                  Quick access to all platform features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {featuredSections.map((section) => (
                    <Link key={section.name} href={section.href}>
                      <div className="group p-4 rounded-lg border border-border hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 cursor-pointer bg-secondary/30 hover:bg-primary/5">
                        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                          {section.icon}
                        </div>
                        <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                          {section.name}
                        </h4>
                        <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                          {section.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-8">
              <Badge variant="outline" className="text-sm">
                ✨ Ovento - Where Innovation Meets Experience
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}