
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, X, MessageSquare, History, User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200/20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link 
            to="/" 
            className="text-2xl font-semibold tracking-tight transition-opacity hover:opacity-80"
          >
            vGPT
          </Link>
        </div>

        {/* Mobile menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex h-full flex-col gap-6 py-4">
              <div className="flex items-center gap-2">
                <Link 
                  to="/" 
                  className="text-2xl font-semibold tracking-tight"
                  onClick={() => setIsOpen(false)}
                >
                  vGPT
                </Link>
              </div>
              <nav className="flex flex-col gap-2">
                <Link
                  to="/chat"
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                    location.pathname === '/chat'
                      ? 'bg-secondary text-secondary-foreground'
                      : 'hover:bg-secondary/80'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Chat</span>
                </Link>
                <Link
                  to="/history"
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                    location.pathname === '/history'
                      ? 'bg-secondary text-secondary-foreground'
                      : 'hover:bg-secondary/80'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <History className="h-5 w-5" />
                  <span>History</span>
                </Link>
              </nav>
              <div className="mt-auto">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 rounded-lg px-3 py-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="justify-start gap-2"
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign out</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link to="/auth?mode=signin" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">Sign in</Button>
                    </Link>
                    <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">Sign up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/chat"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === '/chat'
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            Chat
          </Link>
          <Link
            to="/history"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === '/history'
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            History
          </Link>
        </nav>

        {/* User menu (desktop) */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <div className="p-2">
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/auth?mode=signin">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
