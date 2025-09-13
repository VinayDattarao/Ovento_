import { Button } from "@/components/ui/button";
import ThreeBackground from "@/components/ThreeBackground";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const { signInWithGoogle, isAuthenticated } = useAuth();

  const handleGetStarted = async () => {
    if (isAuthenticated) {
      window.location.href = "/";
    } else {
      try {
        await signInWithGoogle();
      } catch (error) {
        console.error("Login failed:", error);
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">
        <ThreeBackground />
        
        <div className="relative z-10 px-6 max-w-7xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 rounded-full glass-card mb-6">
            <span className="w-2 h-2 bg-accent rounded-full mr-2 live-indicator"></span>
            <span className="text-sm font-medium">🚀 New: AI-Powered Team Matching Now Live</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black leading-tight mb-6">
            The Future of <br />
            <span className="gradient-text">Event Experiences</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed">
            Revolutionary platform with AI-driven personalization, immersive virtual experiences, 
            and real-time collaboration tools that redefine how events are created and experienced.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-4"
              data-testid="get-started-button"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-primary text-foreground hover:bg-primary/10 text-lg px-8 py-4"
              onClick={() => {
                // Show a demo modal or redirect to a demo page
                alert('Demo functionality will be available soon! For now, explore the features below or sign up to try the full platform.');
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Watch Demo
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto glass-card p-8 rounded-2xl">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">50K+</div>
              <div className="text-muted-foreground text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">1.2K+</div>
              <div className="text-muted-foreground text-sm">Events Hosted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">98%</div>
              <div className="text-muted-foreground text-sm">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">24/7</div>
              <div className="text-muted-foreground text-sm">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview Section */}
      <section id="features" className="py-20 bg-secondary/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Why Choose <span className="gradient-text">Ovento?</span></h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the advanced features that make Ovento the ultimate event management platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {/* AI-Powered Features */}
            <div className="glass-card p-6 rounded-xl feature-card">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">AI-Powered Matching</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Smart algorithms match participants for optimal team formation and recommend personalized events.
              </p>
              <div className="text-sm text-primary font-medium">Learn More →</div>
            </div>

            {/* Real-time Collaboration */}
            <div className="glass-card p-6 rounded-xl feature-card">
              <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Collaboration</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Live chat, file sharing, virtual whiteboards, and integrated code editors for seamless teamwork.
              </p>
              <div className="text-sm text-accent font-medium">Explore Tools →</div>
            </div>

            {/* VR/AR Integration */}
            <div className="glass-card p-6 rounded-xl feature-card">
              <div className="w-12 h-12 bg-chart-3/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-chart-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">VR/AR Integration</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Immersive virtual events with VR support, AR overlays, and 3D interactive environments.
              </p>
              <div className="text-sm text-chart-3 font-medium">Try VR Demo →</div>
            </div>

            {/* Analytics Dashboard */}
            <div className="glass-card p-6 rounded-xl feature-card">
              <div className="w-12 h-12 bg-chart-4/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-chart-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Advanced Analytics</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Comprehensive insights with real-time metrics, predictive analytics, and detailed reporting.
              </p>
              <div className="text-sm text-chart-4 font-medium">View Dashboard →</div>
            </div>

            {/* Drag & Drop Builder */}
            <div className="glass-card p-6 rounded-xl feature-card">
              <div className="w-12 h-12 bg-chart-5/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-chart-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v14a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v14a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Visual Event Builder</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Intuitive drag-and-drop interface with AI-suggested layouts and customizable themes.
              </p>
              <div className="text-sm text-chart-5 font-medium">Start Building →</div>
            </div>

            {/* Payment Processing */}
            <div className="glass-card p-6 rounded-xl feature-card">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Payments</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Integrated payment processing with multiple gateways, subscription management, and financial analytics.
              </p>
              <div className="text-sm text-primary font-medium">Setup Payments →</div>
            </div>

            {/* Mobile PWA */}
            <div className="glass-card p-6 rounded-xl feature-card">
              <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Progressive Web App</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Mobile-first design with offline capabilities, push notifications, and native-like performance.
              </p>
              <div className="text-sm text-accent font-medium">Install App →</div>
            </div>

            {/* Security & Privacy */}
            <div className="glass-card p-6 rounded-xl feature-card">
              <div className="w-12 h-12 bg-chart-3/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-chart-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Enterprise Security</h3>
              <p className="text-muted-foreground text-sm mb-4">
                End-to-end encryption, role-based access control, and GDPR/CCPA compliance for secure events.
              </p>
              <div className="text-sm text-chart-3 font-medium">Security Details →</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Events?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of organizers who are already using Ovento to create unforgettable experiences.
          </p>
          <Button 
            onClick={() => window.location.href = "/api/login"}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 text-lg px-12 py-4"
          >
            Start Your Journey
          </Button>
        </div>
      </section>
    </div>
  );
}
