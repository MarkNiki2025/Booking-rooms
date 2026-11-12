import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";

import DashboardHeader from "@/features/dashboard/components/DashBoardHeader";
import DashboardStats from "@/features/dashboard/components/DashBoardStats";
import MeetingRoomsSection from "@/features/dashboard/components/MeetingRoomSection";
import UpcomingBookingsSection from "@/features/dashboard/components/UpComingBookingSection";
import { useState } from "react";
import CreateRoomModal from "@/features/dashboard/components/CreateRoomModal";
import { createRoom } from "@/features/dashboard/services/createRoom";

function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { rooms, bookings, loading: dataLoading,users, refreshData } = useAppData();
  const [isOpen, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  }

  const handleCreateRoom = async (data: {
    name: string;
    description: string;
    members: string[];
    }) => {
    if (!user) return;

    await createRoom(data, user.uid);
    await refreshData();
    handleClose();
  };

  if (authLoading || dataLoading) {
    return <p>Loading...</p>;
  }

  const myBookings = bookings.filter(
    (booking) => booking.createdBy === user?.uid
  );

  const upcomingBookings = myBookings
    .filter(
      (booking) =>
        booking.startAt.toMillis() > Date.now() &&
        booking.status !== "cancelled"
    )
    .sort(
      (a, b) =>
        a.startAt.toMillis() - b.startAt.toMillis()
    );

  return (
    <main className="min-h-screen bg-muted/30 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <DashboardHeader user={user} onOpen={handleOpen}/>

        <DashboardStats
          roomsCount={rooms.length}
          bookingsCount={bookings.length}
          myBookingsCount={myBookings.length}
          upcomingBookingsCount={upcomingBookings.length}
        />

        <section className="grid gap-6 lg:grid-cols-3">
          <MeetingRoomsSection rooms={rooms} />

          <UpcomingBookingsSection
            bookings={upcomingBookings.slice(0, 5)}
            rooms={rooms}
          />
        </section>
      </div>
      {isOpen ? <CreateRoomModal  open={isOpen}
                                  onClose={handleClose}
                                  onCreate={handleCreateRoom}
                                  users={users}/>
      : null}
    </main>
  );
}

export default DashboardPage;