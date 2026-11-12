import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  DoorOpen,
  Pencil,
  Trash2,
} from "lucide-react";

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
import type { AccessibleRoom } from "@/service/roomsService";

interface RoomCardProps {
  room: AccessibleRoom;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}

export default function RoomCard({
  room,
  canManage,
  onEdit,
  onDelete,
}: RoomCardProps) {
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");

    try {
      await onDelete();
      setDeleteOpen(false);
    } catch (error) {
      console.error("Failed to delete room:", error);
      setDeleteError(
        "Unable to delete this room. Check your permissions and try again."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Card className="group transition-all hover:-translate-y-1 hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <DoorOpen size={23} aria-hidden="true" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Open ${room.name}`}
              onClick={() => navigate(`/rooms/${room.id}`)}
            >
              <ArrowUpRight size={18} />
            </Button>
          </div>

          <CardTitle className="mt-3">{room.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {room.description || "No description provided."}
          </CardDescription>
        </CardHeader>

        {canManage && (
          <CardContent>
            <div className="flex gap-2 border-t pt-4">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={onEdit}
              >
                <Pencil size={15} aria-hidden="true" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="icon"
                aria-label={`Delete ${room.name}`}
                onClick={() => {
                  setDeleteError("");
                  setDeleteOpen(true);
                }}
              >
                <Trash2 size={16} aria-hidden="true" />
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <Dialog
        open={deleteOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !deleting) setDeleteOpen(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete meeting room?</DialogTitle>
            <DialogDescription>
              This permanently deletes “{room.name}” and its room membership
              records. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <p className="text-sm text-destructive" role="alert">
              {deleteError}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete room"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
