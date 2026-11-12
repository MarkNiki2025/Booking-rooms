import type { Timestamp } from "firebase/firestore";

export type BookingStatus = "active" | "cancelled";

export interface IBooking {
  roomId: string;
  userId: string;
  description: string;
  startAt: Timestamp;
  endAt: Timestamp;
  status: BookingStatus;
  createdAt: Timestamp;
  attendeeIds: string[];
}
