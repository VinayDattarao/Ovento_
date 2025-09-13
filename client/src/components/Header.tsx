import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageSquare, Menu, X } from "lucide-react";
import { NotificationsDropdown } from "./NotificationsDropdown";

export default function Header() {
  const { user, isAuthenticated, signInWithGoogle, signOut, isFirebaseEnabled } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/" },
    { name: "Events", href: "/events" },
    { name: "Discover", href: "/discover" },
    { name: "Community", href: "/community" },
    { name: "Analytics", href: "/analytics" },
  ];

  return (
    <header className="fixed w-full top-0 left-0 z-50 glass-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href={isAuthenticated ? "/" : "/"}>
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold gradient-text">Ovento</h1>
            </div>
          </Link>
          
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <span className={`text-sm font-medium transition-colors cursor-pointer ${
                    location === item.href 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}>
                    {item.name}
                  </span>
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Button
                  onClick={signInWithGoogle}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="login-button"
                >
                  {isFirebaseEnabled ? "Sign in with Google" : "Demo Sign In"}
                </Button>
              </div>
            ) : (
              <>
                {/* Notifications */}
                <NotificationsDropdown user={user} />

                {/* Messages */}
                <Button variant="ghost" size="sm" className="relative" asChild>
                  <Link href="/community">
                    <MessageSquare className="h-5 w-5" />
                    <span className="notification-dot" />
                  </Link>
                </Button>

                {/* User Profile */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl || ""} />
                        <AvatarFallback>
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">Organizer</p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && mobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-border">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <span 
                    className={`block px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                      location === item.href 
                        ? "text-primary bg-primary/10" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
