import type { Timestamp } from "firebase/firestore";

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface IBooking {
  roomId: string;
  createdBy: string;
  description: string;
  startAt: Timestamp;
  endAt: Timestamp;
  status: BookingStatus;
  createdAt: Timestamp;
}
