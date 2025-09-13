import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import EventsPage from "@/pages/EventsPage";
import EventBuilder from "@/pages/EventBuilder";
import PaymentPage from "@/pages/PaymentPage";
import Community from "@/pages/Community";
import Analytics from "@/pages/Analytics";
import VirtualSpace from "@/pages/VirtualSpace";
import Payments from "@/pages/Payments";
import Discover from "@/pages/Discover";
import Profile from "@/pages/Profile";
import EventDetail from "@/pages/EventDetail";
import EventHistory from "@/pages/EventHistory";
import PaymentHistory from "@/pages/PaymentHistory";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Switch>
          {!isAuthenticated ? (
            <>
              <Route path="/" component={Landing} />
              <Route component={Landing} />
            </>
          ) : (
            <>
              <Route path="/" component={Home} />
              <Route path="/events" component={EventsPage} />
              <Route path="/discover" component={Discover} />
              <Route path="/profile" component={Profile} />
              <Route path="/event/:id" component={EventDetail} />
              <Route path="/events/:id" component={EventDetail} />
              <Route path="/event-builder" component={EventBuilder} />
              <Route path="/payment/:eventId" component={PaymentPage} />
              <Route path="/payments/:eventId" component={PaymentPage} />
              <Route path="/community" component={Community} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/virtual-space" component={VirtualSpace} />
              <Route path="/virtual-space/:id" component={VirtualSpace} />
              <Route path="/payments" component={Payments} />
              <Route path="/event-history" component={EventHistory} />
              <Route path="/history" component={EventHistory} />
              <Route path="/payment-history" component={PaymentHistory} />
              <Route path="/payments/history" component={PaymentHistory} />
              <Route component={NotFound} />
            </>
          )}
        </Switch>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
