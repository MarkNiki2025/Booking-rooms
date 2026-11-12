import { useMemo, useState } from "react";
import { CalendarClock, CalendarPlus, Check, Clock3, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppData } from "@/context/AppDataContext";
import { useAuth } from "@/context/AuthContext";
import CreateBookingDialog from "@/features/bookings/components/CreateBookingDialog";
import EditBookingDialog from "@/features/bookings/components/EditBookingDialog";
import {
  cancelBooking,
  createBooking,
  joinBooking,
  updateBooking,
  type BookingInput,
} from "@/service/bookingService";
import type { AccessibleRoom } from "@/service/roomsService";
import type { WithId } from "@/types";
import type { IBooking } from "@/types/booking";

function isRoomManager(room: AccessibleRoom, userId: string): boolean {
  return (
    room.createdBy === userId ||
    room.memberRole === "owner" ||
    room.memberRole === "admin"
  );
}

function formatBookingDate(start: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(start);
}

function formatBookingTime(start: Date, end: Date): string {
  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

export default function BookingsPage() {
  const { rooms, bookings, users, loading, refreshData } = useAppData();
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingBooking, setEditingBooking] =
    useState<WithId<IBooking> | null>(null);
  const [cancellingBooking, setCancellingBooking] =
    useState<WithId<IBooking> | null>(null);
  const [actionError, setActionError] = useState("");
  const [savingAction, setSavingAction] = useState(false);
  const [joiningBookingId, setJoiningBookingId] = useState<string | null>(null);

  const roomsById = useMemo(
    () => new Map(rooms.map((room) => [room.id, room])),
    [rooms]
  );
  const manageableRooms = user
    ? rooms.filter((room) => isRoomManager(room, user.uid))
    : [];

  async function handleCreate(input: BookingInput) {
    if (!user) throw new Error("You must be signed in to create a booking.");
    await createBooking(input, user.uid);
    await refreshData();
  }

  async function handleEdit(
    input: Pick<BookingInput, "description" | "startAt" | "endAt">
  ) {
    if (!user || !editingBooking) {
      throw new Error("You must be signed in to edit this booking.");
    }
    await updateBooking(editingBooking.id, user.uid, input);
    await refreshData();
  }

  async function handleCancel() {
    if (!user || !cancellingBooking) return;
    setSavingAction(true);
    setActionError("");
    try {
      await cancelBooking(cancellingBooking.id, user.uid);
      await refreshData();
      setCancellingBooking(null);
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to cancel the booking. Please try again."
      );
    } finally {
      setSavingAction(false);
    }
  }

  async function handleJoin(bookingId: string) {
    if (!user) return;
    setJoiningBookingId(bookingId);
    setActionError("");
    try {
      await joinBooking(bookingId, user.uid);
      await refreshData();
    } catch (error) {
      console.error("Failed to join booking:", error);
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to join the booking. Please try again."
      );
    } finally {
      setJoiningBookingId(null);
    }
  }

  if (loading) {
    return (
      <main className="p-6 md:p-10" aria-live="polite">
        <p className="text-muted-foreground">Loading bookings...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
            <p className="mt-2 text-muted-foreground">
              View and manage bookings for rooms you belong to.
            </p>
          </div>
          {manageableRooms.length > 0 && (
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <CalendarPlus size={17} aria-hidden="true" />
              Create booking
            </Button>
          )}
        </section>

        {actionError && (
          <p className="text-sm text-destructive" role="alert">
            {actionError}
          </p>
        )}

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-16 text-center">
              <div className="mb-4 rounded-2xl bg-primary/10 p-4 text-primary">
                <CalendarClock size={30} aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold">No bookings yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Book a room or join a room booking to see it here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <section aria-label="Room bookings" className="grid gap-5 md:grid-cols-2">
            {bookings.map((booking) => {
              const room = roomsById.get(booking.roomId);
              const canManage = Boolean(
                user && room && isRoomManager(room, user.uid)
              );
              const isJoined = Boolean(
                user &&
                  (booking.attendeeIds.includes(user.uid) ||
                    booking.userId === user.uid)
              );
              const start = booking.startAt.toDate();
              const end = booking.endAt.toDate();
              const author =
                users.find((profile) => profile.id === booking.userId)?.name ||
                (user?.uid === booking.userId
                  ? user.displayName || user.email
                  : null) ||
                "Unknown user";

              return (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <CardTitle>{room?.name ?? "Unavailable room"}</CardTitle>
                        <CardDescription className="mt-1">
                          Booked by {author}
                        </CardDescription>
                      </div>
                      <span
                        className={
                          booking.status === "active"
                            ? "rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                            : "rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                        }
                      >
                        {booking.status === "active" ? "Active" : "Cancelled"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <CalendarClock size={16} aria-hidden="true" />
                        {formatBookingDate(start)}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock3 size={16} aria-hidden="true" />
                        {formatBookingTime(start, end)}
                      </p>
                      <p className="flex items-center gap-2">
                        <Users size={16} aria-hidden="true" />
                        {booking.attendeeIds.length}{" "}
                        {booking.attendeeIds.length === 1
                          ? "attendee"
                          : "attendees"}
                      </p>
                    </div>

                    <p className="whitespace-pre-wrap text-sm">
                      {booking.description}
                    </p>

                    <div className="flex flex-wrap gap-2 border-t pt-4">
                      {booking.status === "active" &&
                        !isJoined &&
                        user && (
                          <Button
                            variant="outline"
                            className="gap-2"
                            disabled={joiningBookingId === booking.id}
                            onClick={() => void handleJoin(booking.id)}
                          >
                            <Users size={15} aria-hidden="true" />
                            {joiningBookingId === booking.id
                              ? "Joining..."
                              : "Join booking"}
                          </Button>
                        )}
                      {booking.status === "active" && isJoined && (
                        <span className="inline-flex items-center gap-1.5 px-2 text-sm text-muted-foreground">
                          <Check size={15} aria-hidden="true" />
                          Joined
                        </span>
                      )}
                      {canManage && booking.status === "active" && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => setEditingBooking(booking)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              setActionError("");
                              setCancellingBooking(booking);
                            }}
                          >
                            Cancel booking
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </section>
        )}
      </div>

      <CreateBookingDialog
        open={createOpen}
        rooms={manageableRooms}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />

      {editingBooking && (
        <EditBookingDialog
          key={editingBooking.id}
          booking={editingBooking}
          roomName={
            roomsById.get(editingBooking.roomId)?.name ?? "this room"
          }
          onClose={() => setEditingBooking(null)}
          onSave={handleEdit}
        />
      )}

      <Dialog
        open={cancellingBooking !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !savingAction) setCancellingBooking(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this booking?</DialogTitle>
            <DialogDescription>
              It will remain in the booking history with a cancelled status.
              Cancelled bookings no longer block the room’s time slot.
            </DialogDescription>
          </DialogHeader>
          {actionError && (
            <p className="text-sm text-destructive" role="alert">
              {actionError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setCancellingBooking(null)}
              disabled={savingAction}
            >
              Keep booking
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleCancel()}
              disabled={savingAction}
            >
              {savingAction ? "Cancelling..." : "Confirm cancellation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
