import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { IBooking } from "@/types";
import type { WithId } from "@/types";

export async function getBookings(): Promise<WithId<IBooking>[]> {
  const snapshot = await getDocs(collection(db, "bookings"));

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      roomId: data.roomId,
      createdBy: data.createdBy,
      description: data.description,
      startAt: data.startAt,
      endAt: data.endAt,
      status: data.status,
      createdAt: data.createdAt,
    };
  });
}