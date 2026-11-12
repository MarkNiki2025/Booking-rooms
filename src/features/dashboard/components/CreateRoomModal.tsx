
import { useState, type SubmitEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { WithId } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { IUser } from "@/types";

interface CreateRoomDialogProps {
  onClose: () => void;
  open: boolean;
  users: WithId <IUser>[]
  onCreate: (data: {
    name: string;
    description: string;
    members: string[];
  }) => Promise<void>;
}

function CreateRoomModal({
  onCreate,
  onClose,
  open,
  users,
}: CreateRoomDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleMemberChange(uid: string) {
    setMembers((prev) =>
      prev.includes(uid)
        ? prev.filter((id) => id !== uid)
        : [...prev, uid]
    );
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      await onCreate({
        name: name.trim(),
        description: description.trim(),
        members,
      });

      setName("");
      setDescription("");
      setMembers([]);

      onClose();
    } catch (error) {
      console.error("Failed to create room:", error);
      setError("Failed to create room. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Meeting Room</DialogTitle>
          <DialogDescription>
            Add a new meeting room to your workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room name</Label>

            <Input
              id="room-name"
              placeholder="Conference Room A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="room-description">Description</Label>

            <Textarea
              id="room-description"
              placeholder="Describe your meeting room..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Room members</Label>

            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span>
                  {members.length > 0
                    ? `Selected users: ${members.length}`
                    : "Select room members"}
                </span>

                <span className="transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover p-2 shadow-md">
                {users.map((user) => (
                  <label
                    key={user.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-accent"
                  >
                    <input
                      type="checkbox"
                      checked={members.includes(user.id)}
                      onChange={() => handleMemberChange(user.id)}
                    />

                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {user.name}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </label>
                ))}

                {users.length === 0 && (
                  <p className="p-2 text-sm text-muted-foreground">
                    No users available.
                  </p>
                )}
              </div>
            </details>

            <p className="text-xs text-muted-foreground">
              You can select multiple users.
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Room"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateRoomModal;
