import StatCard from "./StatCard";

interface DashboardStatsProps {
  roomsCount: number;
  bookingsCount: number;
  myBookingsCount: number;
  upcomingBookingsCount: number;
}

function DashboardStats({
  roomsCount,
  bookingsCount,
  myBookingsCount,
  upcomingBookingsCount,
}: DashboardStatsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Rooms" value={roomsCount} />
      <StatCard title="Total Bookings" value={bookingsCount} />
      <StatCard title="My Bookings" value={myBookingsCount} />
      <StatCard title="Upcoming Bookings" value={upcomingBookingsCount} />
    </section>
  );
}

export default DashboardStats;