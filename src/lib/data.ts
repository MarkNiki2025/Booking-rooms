
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

// CURRENT USER
export async function getUser(uid: string) {
  const snapshot = await getDoc(doc(db, "users", uid));

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

// ROOMS
export async function getRooms() {
  const snapshot = await getDocs(collection(db, "rooms"));

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// ROOM BY ID
export async function getRoom(roomId: string) {
  const snapshot = await getDoc(doc(db, "rooms", roomId));

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

// ROOM MEMBERS
export async function getRoomMembers(roomId: string) {
  const snapshot = await getDocs(
    collection(db, "rooms", roomId, "members")
  );

  return snapshot.docs.map((item) => ({
    uid: item.id,
    ...item.data(),
  }));
}

// BOOKINGS
export async function getBookings() {
  const snapshot = await getDocs(collection(db, "bookings"));

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// BOOKINGS BY ROOM
export async function getRoomBookings(roomId: string) {
  const q = query(
    collection(db, "bookings"),
    where("roomId", "==", roomId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}
