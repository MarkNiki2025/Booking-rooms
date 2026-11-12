import { Button } from "@/components/ui/button";
import type { User } from "firebase/auth";

interface DashboardHeaderProps {
  user: User | null;
  onOpen: () => void;
}

function DashboardHeader({ user,onOpen }: DashboardHeaderProps) {
  return (
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Hello, {user?.displayName || user?.email || "User"}!
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage your meeting rooms and bookings.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick = {onOpen}>Create Room</Button>
        <Button>New Booking</Button>
      </div>
    </section>
  );
}

export default DashboardHeader;