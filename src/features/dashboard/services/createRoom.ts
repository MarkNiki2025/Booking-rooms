import { addDoc, collection, serverTimestamp } from "firebase/firestore";
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
  const docRef = await addDoc(collection(db, "rooms"), {
    ...data,
    createdBy,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}