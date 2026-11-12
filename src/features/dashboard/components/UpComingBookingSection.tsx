import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import type { IRoom } from "@/types/room";
import type { IBooking } from "@/types/booking";
import type { WithId } from "@/types";

interface UpcomingBookingsSectionProps {
  bookings: WithId<IBooking>[];
  rooms: WithId<IRoom>[];
}

function UpcomingBookingsSection({
  bookings,
  rooms,
}: UpcomingBookingsSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Upcoming Bookings</h2>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            No upcoming bookings.
          </CardContent>
        </Card>
      ) : (
        bookings.map((booking) => {
          const room = rooms.find(
            (item) => item.id === booking.roomId
          );

          return (
            <Card key={booking.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {room?.name || "Unknown room"}
                </CardTitle>

                <CardDescription>
                  {booking.startAt.toDate().toLocaleString()}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <p className="text-sm">
                  Status: {booking.status}
                </p>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

export default UpcomingBookingsSection;