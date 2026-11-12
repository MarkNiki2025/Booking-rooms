import { useMemo, useState } from "react";
import { DoorOpen, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/context/AppDataContext";
import { useAuth } from "@/context/AuthContext";
import CreateRoomModal from "@/features/dashboard/components/CreateRoomModal";
import { createRoom } from "@/features/dashboard/services/createRoom";
import EditRoomModal from "@/features/rooms/components/EditRoomModal";
import RoomCard from "@/features/rooms/components/RoomCard";
import {
  deleteRoom,
  updateRoom,
} from "@/service/roomsService";
import type { IRoom } from "@/types/room";

export default function RoomsPage() {
  const { rooms, loading, users, refreshData } = useAppData();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<
    (typeof rooms)[number] | null
  >(null);

  const filteredRooms = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return rooms.filter((room) =>
      room.name.toLowerCase().includes(normalizedSearch)
    );
  }, [rooms, search]);

  async function handleCreate(data: {
    name: string;
    description: string;
    members: string[];
  }) {
    if (!user) throw new Error("You must be signed in to create a room.");
    await createRoom(data, user.uid);
    await refreshData();
  }

  async function handleEdit(changes: Pick<IRoom, "name" | "description">) {
    if (!user || !editingRoom) {
      throw new Error("You must be signed in to edit a room.");
    }

    await updateRoom(editingRoom.id, user.uid, changes);
    await refreshData();
  }

  async function handleDelete(roomId: string) {
    if (!user) throw new Error("You must be signed in to delete a room.");
    await deleteRoom(roomId, user.uid);
    await refreshData();
  }

  return (
    <main className="min-h-screen bg-muted/30 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Meeting Rooms
            </h1>
            <p className="mt-2 text-muted-foreground">
              Browse and manage meeting rooms you belong to.
            </p>
          </div>

          <Button
            onClick={() => setCreateOpen(true)}
            className="gap-2"
          >
            <Plus size={17} />
            Create Room
          </Button>
        </section>

        <section aria-label="Search meeting rooms">
          <div className="relative max-w-md">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              aria-label="Search room names"
              placeholder="Search rooms..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-semibold">Your rooms</h2>
            <p className="text-sm text-muted-foreground">
              {filteredRooms.length}{" "}
              {filteredRooms.length === 1 ? "room" : "rooms"}
              {search.trim() ? " found" : " available"}
            </p>
          </div>

          {loading ? (
            <p className="py-12 text-center text-muted-foreground" aria-live="polite">
              Loading meeting rooms...
            </p>
          ) : filteredRooms.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 rounded-2xl bg-primary/10 p-4 text-primary">
                  <DoorOpen size={30} aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold">
                  {search.trim() ? "No rooms found" : "No meeting rooms yet"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search.trim()
                    ? "Try another search term."
                    : "Create a room or ask to be added to one."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredRooms.map((room) => {
                const canManage =
                  room.createdBy === user?.uid ||
                  room.memberRole === "owner" ||
                  room.memberRole === "admin";

                return (
                  <RoomCard
                    key={room.id}
                    room={room}
                    canManage={canManage}
                    onEdit={() => setEditingRoom(room)}
                    onDelete={() => handleDelete(room.id)}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>

      <CreateRoomModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
        users={users}
      />

      {editingRoom && (
        <EditRoomModal
          key={editingRoom.id}
          open
          room={editingRoom}
          onClose={() => setEditingRoom(null)}
          onSave={handleEdit}
        />
      )}
    </main>
  );
}
