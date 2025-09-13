import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, MessageSquare, Menu, X } from 'lucide-react';

export function Navigation() {
  const { user, isAuthenticated, signInWithGoogle } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { href: '/', label: 'Dashboard', icon: '🏠' },
    { href: '/events', label: 'Events', icon: '📅' },
    { href: '/community', label: 'Community', icon: '👥' },
    { href: '/analytics', label: 'Analytics', icon: '📊' },
    { href: '/virtual-space', label: 'Virtual Space', icon: '🌐' },
  ];

  if (!isAuthenticated) {
    return (
      <header className="fixed w-full top-0 left-0 z-50 glass-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-white text-xl">⚡</span>
                </div>
                <h1 className="text-2xl font-bold gradient-text">Ovento</h1>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={signInWithGoogle}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-login"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed w-full top-0 left-0 z-50 glass-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center space-x-3" data-testid="link-home">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white text-xl">⚡</span>
              </div>
              <h1 className="text-2xl font-bold gradient-text">Ovento</h1>
            </div>
          </Link>
          
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-muted-foreground hover:text-foreground transition-colors ${
                  location === item.href ? 'text-primary' : ''
                }`}
                data-testid={`link-${item.label.toLowerCase()}`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="notification-dot"></span>
            </Button>
            
            {/* Messages */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              data-testid="button-messages"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="notification-dot"></span>
            </Button>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-3 cursor-pointer" data-testid="button-user-profile">
                  <Avatar className="w-10 h-10 border-2 border-primary">
                    <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
                    <AvatarFallback>
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem data-testid="menu-profile">
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-preferences">
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-help">
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => window.location.href = '/api/logout'}
                  data-testid="menu-logout"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${
                    location === item.href ? 'text-primary bg-primary/10' : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  data-testid={`mobile-link-${item.label.toLowerCase()}`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
