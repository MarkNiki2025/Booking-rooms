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
import type { IRoom } from "@/types/room";

interface EditRoomModalProps {
  open: boolean;
  room: AccessibleRoom;
  onClose: () => void;
  onSave: (changes: Pick<IRoom, "name" | "description">) => Promise<void>;
}

export default function EditRoomModal({
  open,
  room,
  onClose,
  onSave,
}: EditRoomModalProps) {
  const [name, setName] = useState(room.name);
  const [description, setDescription] = useState(room.description);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName || !trimmedDescription) {
      setError("Room name and description are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave({
        name: trimmedName,
        description: trimmedDescription,
      });
      onClose();
    } catch (saveError) {
      console.error("Failed to update room:", saveError);
      setError("Unable to save room changes. Check your permissions and try again.");
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit meeting room</DialogTitle>
          <DialogDescription>
            Update the name and description for {room.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-room-name">Room name</Label>
            <Input
              id="edit-room-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-room-description">Description</Label>
            <Textarea
              id="edit-room-description"
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
