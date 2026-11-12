import type { Timestamp } from "firebase/firestore";

export type RoomMemberRole = "owner" | "admin" | "member";

export interface IRoom {
  name: string;
  description: string;
  createdBy: string;
  createdAt: Timestamp;
}

export interface IRoomMember {
  uid: string;
  role: RoomMemberRole;
  addedAt: Timestamp;
}

