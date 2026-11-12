import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { IRoom } from "@/types/room";

export async function getRooms(): Promise<IRoom[]> {
  const snapshot = await getDocs(collection(db, "rooms"));

  return snapshot.docs.map((item) => {
    const data = item.data();

    return {
      id: item.id,
      name: data.name,
      description: data.description,
      createdBy: data.createdBy,
      createdAt: data.createdAt,
    };
  });
}