import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { IUser } from "@/types/user";
import type { WithId } from "@/types";

export async function getUsers(): Promise<WithId <IUser>[]> {
  const snapshot = await getDocs(collection(db, "users"));

  return snapshot.docs.map((item) => {
    const data = item.data();

    return {
      name: data.name,
      email: data.email,
      createdAt: data.createdAt,
      id: item.id
    };
  });
}