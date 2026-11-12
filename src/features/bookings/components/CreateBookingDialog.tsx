import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AccessibleRoom } from "@/service/roomsService";
import type { BookingInput } from "@/service/bookingService";
import {
  getDefaultBookingDateTime,
  parseLocalDateTime,
} from "@/lib/bookingDateTime";

interface CreateBookingDialogProps {
  open: boolean;
  rooms: AccessibleRoom[];
  onClose: () => void;
  onCreate: (input: BookingInput) => Promise<void>;
}

export default function CreateBookingDialog({
  open,
  rooms,
  onClose,
  onCreate,
}: CreateBookingDialogProps) {
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? "");
  const [dateTime, setDateTime] = useState(getDefaultBookingDateTime);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const startAt = parseLocalDateTime(dateTime.date, dateTime.startTime);
    const endAt = parseLocalDateTime(dateTime.date, dateTime.endTime);

    if (!roomId) {
      setError("Select a meeting room.");
      return;
    }
    if (!startAt || !endAt) {
      setError("Enter a valid booking date and time.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onCreate({
        roomId,
        description: description.trim(),
        startAt,
        endAt,
      });
      setDescription("");
      setDateTime(getDefaultBookingDateTime());
      onClose();
    } catch (createError) {
      console.error("Failed to create booking:", createError);
      setError(
        createError instanceof Error
          ? createError.message
          : "Unable to create the booking. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !saving) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create booking</DialogTitle>
          <DialogDescription>
            Choose a room and reserve a time slot.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-booking-room">Meeting room</Label>
            <select
              id="create-booking-room"
              value={roomId}
              onChange={(event) => setRoomId(event.target.value)}
              required
              disabled={saving}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-booking-date">Date</Label>
            <Input
              id="create-booking-date"
              type="date"
              value={dateTime.date}
              onChange={(event) =>
                setDateTime((current) => ({
                  ...current,
                  date: event.target.value,
                }))
              }
              required
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-booking-start">Start time</Label>
              <Input
                id="create-booking-start"
                type="time"
                value={dateTime.startTime}
                onChange={(event) =>
                  setDateTime((current) => ({
                    ...current,
                    startTime: event.target.value,
                  }))
                }
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-booking-end">End time</Label>
              <Input
                id="create-booking-end"
                type="time"
                value={dateTime.endTime}
                onChange={(event) =>
                  setDateTime((current) => ({
                    ...current,
                    endTime: event.target.value,
                  }))
                }
                required
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-booking-description">Description</Label>
            <Textarea
              id="create-booking-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this room being booked for?"
              required
              disabled={saving}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || rooms.length === 0}>
              {saving ? "Creating..." : "Create booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
