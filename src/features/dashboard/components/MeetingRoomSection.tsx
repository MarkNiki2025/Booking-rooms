import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import type { IRoom } from "@/types/room";
import type { WithId } from "@/types";

interface MeetingRoomsSectionProps {
  rooms: WithId<IRoom>[];
}

function MeetingRoomsSection({ rooms }: MeetingRoomsSectionProps) {
  return (
    <div className="space-y-4 lg:col-span-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Meeting Rooms</h2>

        <Button variant="outline">View All</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {rooms.slice(0, 4).map((room) => (
          <Card key={room.id}>
            <CardHeader>
              <CardTitle>{room.name}</CardTitle>
              <CardDescription>{room.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground">
                Created by: {room.createdBy}
              </p>
            </CardContent>
          </Card>
        ))}

        {rooms.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No meeting rooms available.
          </p>
        )}
      </div>
    </div>
  );
}

export default MeetingRoomsSection;