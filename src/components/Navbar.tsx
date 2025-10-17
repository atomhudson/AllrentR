import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Package, User, LogOut, LayoutDashboard, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  const NavLinks = () => (
    <>
      <Link to="/listings" onClick={() => setOpen(false)}>
        <Button variant="ghost" className="font-medium w-full justify-start">
          Browse Items
        </Button>
      </Link>

      <Link to="/blog" onClick={() => setOpen(false)}>
        <Button variant="ghost" className="font-medium w-full justify-start">
          Blog
        </Button>
      </Link>

      <Link to="/leaderboard" onClick={() => setOpen(false)}>
        <Button variant="ghost" className="font-medium w-full justify-start">
          🏆 Leaderboard
        </Button>
      </Link>

      {user ? (
        <>
          <Link to="/submit-listing" onClick={() => setOpen(false)}>
            <Button variant="outline" className="font-medium w-full justify-start">
              List an Item
            </Button>
          </Link>
          
          <Link to="/profile" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              <User className="w-5 h-5 mr-2" />
              Profile
            </Button>
          </Link>

          {isAdmin && (
            <Link to="/admin" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Admin Dashboard
              </Button>
            </Link>
          )}

          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </>
      ) : (
        <>
          <Link to="/login" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="font-medium w-full justify-start">
              Login
            </Button>
          </Link>
          <Link to="/signup" onClick={() => setOpen(false)}>
            <Button variant="hero" size="lg" className="w-full">
              Sign Up
            </Button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <Package className="w-8 h-8 text-primary group-hover:text-accent transition-colors" />
            <span className="text-2xl font-serif font-bold text-primary">RentKaro</span>
          </Link>

          {isMobile ? (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col gap-4 mt-8">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/listings">
                <Button variant="ghost" className="font-medium">
                  Browse Items
                </Button>
              </Link>

              <Link to="/blog">
                <Button variant="ghost" className="font-medium">
                  Blogs
                </Button>
              </Link>

              <Link to="/leaderboard">
                <Button variant="ghost" className="font-medium">
                  🏆 Leaderboard
                </Button>
              </Link>

              {user ? (
                <>
                  <Link to="/submit-listing">
                    <Button variant="outline" className="font-medium">
                      List an Item
                    </Button>
                  </Link>
                  
                  <Link to="/profile">
                    <Button variant="ghost" size="icon">
                      <User className="w-5 h-5" />
                    </Button>
                  </Link>

                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="ghost" size="icon">
                        <LayoutDashboard className="w-5 h-5" />
                      </Button>
                    </Link>
                  )}

                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="w-5 h-5" />
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="font-medium">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="hero" size="lg">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
