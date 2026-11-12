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
  createdBy: string
): Promise<string> {
  const roomRef = doc(collection(db, "rooms"));
  const batch = writeBatch(db);

  batch.set(roomRef, {
    name: data.name,
    description: data.description,
    createdBy,
    createdAt: serverTimestamp(),
  });

  const memberUids = new Set([...data.members, createdBy]);
  memberUids.forEach((uid) => {
    batch.set(doc(db, "rooms", roomRef.id, "members", uid), {
      role: uid === createdBy ? "owner" : "member",
      addedAt: serverTimestamp(),
    });
  });

  await batch.commit();
  return roomRef.id;
}