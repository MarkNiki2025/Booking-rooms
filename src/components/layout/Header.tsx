
import { CalendarDays, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/features/auth/services/authService";
import { useAuth } from "@/context/AuthContext";

function Header() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary p-2 text-primary-foreground">
            <CalendarDays size={20} />
          </div>
          <span className="text-lg font-bold tracking-tight">
            MeetSpace
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <a href="/" className="text-sm font-medium text-primary">
            Dashboard
          </a>
          <a href="/rooms" className="text-sm text-muted-foreground hover:text-foreground">
            Meeting Rooms
          </a>
          <a href="/bookings" className="text-sm text-muted-foreground hover:text-foreground">
            Bookings
          </a>
        </nav>

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex size-9 items-center justify-center rounded-full bg-muted">
              <User size={18} />
            </div>
            <span className="text-sm font-medium">{user?.displayName}</span>
          </div>

          <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => logoutUser()}>
            <LogOut size={16} />
            Logout
          </Button>
        </div>

      </div>
    </header>
  );
}

export default Header;
