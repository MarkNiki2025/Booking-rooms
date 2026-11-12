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
import type { WithId } from "@/types";
import type { IBooking } from "@/types/booking";
import type { BookingInput } from "@/service/bookingService";
import {
  formatLocalDate,
  formatLocalTime,
  parseLocalDateTime,
} from "@/lib/bookingDateTime";

interface EditBookingDialogProps {
  booking: WithId<IBooking>;
  roomName: string;
  onClose: () => void;
  onSave: (
    input: Pick<BookingInput, "description" | "startAt" | "endAt">
  ) => Promise<void>;
}

export default function EditBookingDialog({
  booking,
  roomName,
  onClose,
  onSave,
}: EditBookingDialogProps) {
  const initialStart = booking.startAt.toDate();
  const initialEnd = booking.endAt.toDate();
  const [date, setDate] = useState(formatLocalDate(initialStart));
  const [startTime, setStartTime] = useState(formatLocalTime(initialStart));
  const [endTime, setEndTime] = useState(formatLocalTime(initialEnd));
  const [description, setDescription] = useState(booking.description);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const startAt = parseLocalDateTime(date, startTime);
    const endAt = parseLocalDateTime(date, endTime);

    if (!startAt || !endAt) {
      setError("Enter a valid booking date and time.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave({
        description: description.trim(),
        startAt,
        endAt,
      });
      onClose();
    } catch (saveError) {
      console.error("Failed to update booking:", saveError);
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update the booking. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !saving) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit booking</DialogTitle>
          <DialogDescription>
            Update the time or description for {roomName}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-booking-date">Date</Label>
            <Input
              id="edit-booking-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-booking-start">Start time</Label>
              <Input
                id="edit-booking-start"
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-booking-end">End time</Label>
              <Input
                id="edit-booking-end"
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                required
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-booking-description">Description</Label>
            <Textarea
              id="edit-booking-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
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
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
