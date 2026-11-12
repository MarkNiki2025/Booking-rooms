import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface NewRoom {
  name: string;
  description: string;
  members: string[];
}

export async function createRoom(
  data: NewRoom,
  createdBy: string | null,
  nameOfOwner: string
): Promise<string> {
  if (!createdBy) {
    throw new Error("User is not authenticated");
  }
  const ownerName = nameOfOwner.trim();
  if (!ownerName) {
    throw new Error("Owner name is required");
  }

  const roomRef = doc(collection(db, "rooms"));
  const batch = writeBatch(db);

  batch.set(roomRef, {
    name: data.name,
    description: data.description,
    createdBy,
    createdAt: serverTimestamp(),
    nameOfOwner: ownerName,
  });

  const memberUids = new Set([
    ...data.members.filter((uid) => uid.length > 0),
    createdBy,
  ]);
  memberUids.forEach((uid) => {
    batch.set(doc(db, "rooms", roomRef.id, "members", uid), {
      role: uid === createdBy ? "owner" : "member",
      addedAt: serverTimestamp(),
    });
  });

  await batch.commit();
  return roomRef.id;
}